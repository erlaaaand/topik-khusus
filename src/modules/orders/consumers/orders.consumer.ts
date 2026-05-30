import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_PATTERNS } from '../../../common/constants/queue.constants';
import type { OrderStatus } from '../../../common/interfaces/order.interface';

interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  totalAmount: number;
  itemCount: number;
  status: OrderStatus;
  timestamp: Date;
}

interface OrderStatusUpdatedPayload {
  orderId: string;
  userId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  timestamp: Date;
}

@Controller()
export class OrdersConsumer {
  private readonly logger = new Logger(OrdersConsumer.name);

  @EventPattern(EVENT_PATTERNS.ORDER_CREATED)
  handleOrderCreated(@Payload() data: OrderCreatedPayload): void {
    this.logger.log(`[CONSUMER] Event "${EVENT_PATTERNS.ORDER_CREATED}" diterima dari RabbitMQ`);
    this.logger.log(
      `[CONSUMER] Order baru — id: ${data.orderId} | userId: ${data.userId} | ${data.itemCount} item | total: Rp ${data.totalAmount.toLocaleString('id-ID')} | status: ${data.status}`,
    );
    this.logger.debug(`[CONSUMER] Timestamp event: ${String(data.timestamp)}`);
    this.logger.log(`[CONSUMER] Event "${EVENT_PATTERNS.ORDER_CREATED}" selesai diproses`);
  }

  @EventPattern(EVENT_PATTERNS.ORDER_STATUS_UPDATED)
  handleOrderStatusUpdated(@Payload() data: OrderStatusUpdatedPayload): void {
    this.logger.log(`[CONSUMER] Event "${EVENT_PATTERNS.ORDER_STATUS_UPDATED}" diterima dari RabbitMQ`);
    this.logger.log(
      `[CONSUMER] Status diperbarui — orderId: ${data.orderId} | userId: ${data.userId} | "${data.previousStatus}" → "${data.newStatus}"`,
    );
    this.logger.debug(`[CONSUMER] Timestamp event: ${String(data.timestamp)}`);
    this.logger.log(`[CONSUMER] Event "${EVENT_PATTERNS.ORDER_STATUS_UPDATED}" selesai diproses`);
  }
}