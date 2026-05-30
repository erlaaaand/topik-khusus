import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { OrderStatus } from '../../../common/interfaces/order.interface';

export type OrderDocument = HydratedDocument<OrderEntity>;

@Schema({ _id: false })
export class OrderItemEntity {
  @Prop({ required: true })
  productName: string = '';

  @Prop({ required: true, min: 1 })
  quantity: number = 0;

  @Prop({ required: true, min: 0 })
  price: number = 0;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItemEntity);

@Schema({ timestamps: true })
export class OrderEntity {
  @Prop({ required: true })
  userId: string = '';

  @Prop({ type: [OrderItemSchema], required: true, default: [] })
  items: OrderItemEntity[] = [];

  @Prop({ required: true, min: 0 })
  totalAmount: number = 0;

  @Prop({
    required: true,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: OrderStatus = 'pending';
}

export const OrderSchema = SchemaFactory.createForClass(OrderEntity);