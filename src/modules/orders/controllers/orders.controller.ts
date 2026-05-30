import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import type { Order } from '../../../common/interfaces/order.interface';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Membuat pesanan baru untuk user' })
  @ApiResponse({ status: 201, description: 'Pesanan berhasil dibuat.' })
  @ApiResponse({ status: 400, description: 'User tidak ditemukan.' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log(`[POST /orders] Request masuk — userId: ${createOrderDto.userId}, ${createOrderDto.items.length} item`);
    const order = await this.ordersService.createOrder(createOrderDto);
    this.logger.log(`[POST /orders] Response dikirim — orderId: ${order.id}`);
    return order;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Mengambil semua pesanan milik satu user (demonstrasi Redis Cache per user)' })
  @ApiResponse({ status: 200, description: 'Daftar pesanan ditemukan.' })
  async findByUser(@Param('userId') userId: string): Promise<Order[]> {
    this.logger.log(`[GET /orders/user/:userId] Request masuk — userId: ${userId}`);
    const orders = await this.ordersService.getOrdersByUserId(userId);
    this.logger.log(`[GET /orders/user/:userId] Response dikirim — ${orders.length} order untuk userId: ${userId}`);
    return orders;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mengambil detail satu pesanan berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Pesanan ditemukan.' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan.' })
  async findOne(@Param('id') id: string): Promise<Order> {
    this.logger.log(`[GET /orders/:id] Request masuk — id: ${id}`);
    const order = await this.ordersService.getOrderById(id);

    if (order === null) {
      this.logger.warn(`[GET /orders/:id] Order id: ${id} tidak ditemukan — 404`);
      throw new NotFoundException(`Order dengan ID ${id} tidak ditemukan`);
    }

    this.logger.log(`[GET /orders/:id] Response dikirim — orderId: ${id}`);
    return order;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Memperbarui status pesanan (trigger event RabbitMQ)' })
  @ApiResponse({ status: 200, description: 'Status pesanan berhasil diperbarui.' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    this.logger.log(`[PATCH /orders/:id/status] Request masuk — id: ${id}, status baru: "${updateOrderStatusDto.status}"`);
    const order = await this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
    this.logger.log(`[PATCH /orders/:id/status] Response dikirim — orderId: ${id}`);
    return order;
  }
}