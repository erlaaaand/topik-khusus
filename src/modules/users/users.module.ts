import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersConsumer } from './consumers/users.consumer';
import { MessagingModule } from '../../messaging/messaging.module';

@Module({
  imports: [MessagingModule],
  controllers: [UsersController, UsersConsumer],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
