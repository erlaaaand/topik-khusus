import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { redisConfig } from './config/redis.config';
import { mongodbConfig } from './config/mongodb.config';
import { UsersModule } from './modules/users/users.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    CacheModule.registerAsync(redisConfig),
    MongooseModule.forRootAsync(mongodbConfig),
    MessagingModule,
    UsersModule,
    OrdersModule,
  ],
})
export class AppModule {}