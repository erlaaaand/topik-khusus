import { Injectable, Inject, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Order, OrderStatus } from '../../../common/interfaces/order.interface';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { MessagingService } from '../../../messaging/messaging.service';
import { EVENT_PATTERNS } from '../../../common/constants/queue.constants';
import { OrderEntity, type OrderDocument } from '../schemas/order.schema';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly CACHE_TTL = 60000; // 60 detik

  constructor(
    @InjectModel(OrderEntity.name) private readonly orderModel: Model<OrderDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly messagingService: MessagingService,
    private readonly usersService: UsersService,
  ) {}

  private toOrder(doc: OrderDocument): Order {
    const plain = doc as unknown as {
      _id: { toString(): string };
      createdAt: Date;
      updatedAt: Date;
    };
    return {
      id: plain._id.toString(),
      userId: doc.userId,
      items: doc.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: doc.totalAmount,
      status: doc.status,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }

  private calculateTotal(items: CreateOrderDto['items']): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log(`[CREATE] Memulai pembuatan order untuk userId: ${createOrderDto.userId}`);

    // Validasi: pastikan user benar-benar ada
    this.logger.log(`[CREATE] Memvalidasi keberadaan userId: ${createOrderDto.userId}`);
    const userExists = await this.usersService.existsById(createOrderDto.userId);
    if (!userExists) {
      this.logger.warn(`[CREATE] Gagal — userId: ${createOrderDto.userId} tidak ditemukan di MongoDB`);
      throw new BadRequestException(`User dengan ID ${createOrderDto.userId} tidak ditemukan`);
    }
    this.logger.log(`[CREATE] Validasi user berhasil — userId: ${createOrderDto.userId} valid`);

    const totalAmount = this.calculateTotal(createOrderDto.items);
    this.logger.log(`[CREATE] Total amount dihitung: Rp ${totalAmount.toLocaleString('id-ID')} dari ${createOrderDto.items.length} item`);

    const created = await this.orderModel.create({
      userId: createOrderDto.userId,
      items: createOrderDto.items,
      totalAmount,
      status: 'pending' as OrderStatus,
    });

    const newOrder = this.toOrder(created);
    this.logger.log(`[CREATE] Order berhasil disimpan ke MongoDB — orderId: ${newOrder.id}`);

    // Invalidate cache list per user
    await this.cacheManager.del(`orders:user:${createOrderDto.userId}`);
    this.logger.log(`[CACHE] Cache "orders:user:${createOrderDto.userId}" di-invalidate`);

    // Publish event ke RabbitMQ
    await this.messagingService.publishEvent(EVENT_PATTERNS.ORDER_CREATED, {
      orderId: newOrder.id,
      userId: newOrder.userId,
      totalAmount: newOrder.totalAmount,
      itemCount: newOrder.items.length,
      status: newOrder.status,
      timestamp: newOrder.createdAt,
    });

    this.logger.log(`[CREATE] Proses selesai — orderId: ${newOrder.id} dikembalikan`);
    return newOrder;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    this.logger.log(`[FIND_BY_USER] Mengambil semua order untuk userId: ${userId}`);

    const cacheKey = `orders:user:${userId}`;
    const cached = await this.cacheManager.get<Order[]>(cacheKey);

    if (cached !== undefined && cached !== null) {
      this.logger.log(`[CACHE HIT] "${cacheKey}" ditemukan di Redis — ${cached.length} order dikembalikan`);
      return cached;
    }

    this.logger.log(`[CACHE MISS] "${cacheKey}" tidak ada di Redis — mengambil dari MongoDB`);
    const docs = await this.orderModel.find({ userId }).exec();
    const orders = docs.map((doc) => this.toOrder(doc));

    await this.cacheManager.set(cacheKey, orders, this.CACHE_TTL);
    this.logger.log(`[CACHE SET] ${orders.length} order userId: ${userId} disimpan ke Redis dengan TTL 60 detik`);

    return orders;
  }

  async getOrderById(id: string): Promise<Order | null> {
    this.logger.log(`[FIND_ONE] Mencari order dengan id: ${id}`);

    const cacheKey = `orders:${id}`;
    const cached = await this.cacheManager.get<Order>(cacheKey);

    if (cached !== undefined && cached !== null) {
      this.logger.log(`[CACHE HIT] "orders:${id}" ditemukan di Redis`);
      return cached;
    }

    this.logger.log(`[CACHE MISS] "orders:${id}" tidak ada di Redis — mengambil dari MongoDB`);
    const doc = await this.orderModel.findById(id).exec();

    if (doc === null) {
      this.logger.warn(`[FIND_ONE] Order id: ${id} tidak ditemukan di MongoDB`);
      return null;
    }

    const order = this.toOrder(doc);
    await this.cacheManager.set(cacheKey, order, this.CACHE_TTL);
    this.logger.log(`[CACHE SET] Order id: ${id} disimpan ke Redis dengan TTL 60 detik`);

    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    this.logger.log(`[UPDATE_STATUS] Memperbarui status order id: ${id} → "${dto.status}"`);

    const doc = await this.orderModel.findById(id).exec();

    if (doc === null) {
      this.logger.warn(`[UPDATE_STATUS] Order id: ${id} tidak ditemukan — NotFoundException`);
      throw new NotFoundException(`Order dengan ID ${id} tidak ditemukan`);
    }

    const previousStatus = doc.status;
    doc.status = dto.status;
    await doc.save();
    this.logger.log(`[UPDATE_STATUS] Status order id: ${id} berhasil diubah: "${previousStatus}" → "${dto.status}"`);

    // Invalidate cache order ini dan list milik user-nya
    await this.cacheManager.del(`orders:${id}`);
    await this.cacheManager.del(`orders:user:${doc.userId}`);
    this.logger.log(`[CACHE] Cache "orders:${id}" dan "orders:user:${doc.userId}" di-invalidate`);

    const updatedOrder = this.toOrder(doc);

    // Publish event ke RabbitMQ
    await this.messagingService.publishEvent(EVENT_PATTERNS.ORDER_STATUS_UPDATED, {
      orderId: updatedOrder.id,
      userId: updatedOrder.userId,
      previousStatus,
      newStatus: dto.status,
      timestamp: new Date(),
    });

    this.logger.log(`[UPDATE_STATUS] Proses selesai — orderId: ${id} dikembalikan`);
    return updatedOrder;
  }
}