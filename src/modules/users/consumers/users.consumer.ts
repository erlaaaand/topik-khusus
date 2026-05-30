import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_PATTERNS } from '../../../common/constants/queue.constants';

interface UserCreatedPayload {
  userId: string;
  name: string;
  email: string;
  timestamp: Date;
}

@Controller()
export class UsersConsumer {
  private readonly logger = new Logger(UsersConsumer.name);

  @EventPattern(EVENT_PATTERNS.USER_CREATED)
  handleUserCreated(@Payload() data: UserCreatedPayload): void {
    this.logger.log(`[CONSUMER] Event "${EVENT_PATTERNS.USER_CREATED}" diterima dari RabbitMQ`);
    this.logger.log(`[CONSUMER] User baru — id: ${data.userId} | nama: ${data.name} | email: ${data.email}`);
    this.logger.debug(`[CONSUMER] Timestamp event: ${String(data.timestamp)}`);
    this.logger.log(`[CONSUMER] Event "${EVENT_PATTERNS.USER_CREATED}" selesai diproses`);
  }
}