import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MESSAGING_SERVICE } from '../common/constants/queue.constants';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @Inject(MESSAGING_SERVICE) private readonly client: ClientProxy,
  ) {}

  async publishEvent(pattern: string, data: unknown): Promise<void> {
    this.logger.log(`Publishing event [${pattern}]`);
    this.client.emit(pattern, data);
  }
}
