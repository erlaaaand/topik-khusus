import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { OrdersConsumer } from './consumers/orders.consumer';
import { MessagingModule } from '../../messaging/messaging.module';
import { UsersModule } from '../users/users.module';
import { OrderEntity, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MessagingModule,
    UsersModule,
    MongooseModule.forFeature([{ name: OrderEntity.name, schema: OrderSchema }]),
  ],
  controllers: [OrdersController, OrdersConsumer],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
