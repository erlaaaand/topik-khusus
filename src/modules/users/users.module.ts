import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersConsumer } from './consumers/users.consumer';
import { MessagingModule } from '../../messaging/messaging.module';
import { UserEntity, UserSchema } from './schemas/user.schemas';

@Module({
  imports: [
    MessagingModule,
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, UsersConsumer],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}