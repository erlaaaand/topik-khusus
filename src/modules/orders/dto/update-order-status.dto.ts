import { ApiProperty } from '@nestjs/swagger';
import type { OrderStatus } from '../../../common/interfaces/order.interface';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Status pesanan baru',
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    example: 'processing',
  })
  readonly status: OrderStatus;

  constructor(status: OrderStatus) {
    this.status = status;
  }
}