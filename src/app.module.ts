import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from './config/redis.config';
import { UsersModule } from './modules/users/users.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    CacheModule.registerAsync(redisConfig),
    MessagingModule,
    UsersModule,
  ],
})
export class AppModule {}