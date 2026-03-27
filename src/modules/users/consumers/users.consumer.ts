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
    this.logger.log(
      `[RabbitMQ] Event diterima - User Created: ${data.name} (${data.email}) | ID: ${data.userId}`,
    );
  }
}
