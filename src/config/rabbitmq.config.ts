import { Transport, type RmqOptions } from '@nestjs/microservices';
import { QUEUE_NAMES } from '../common/constants/queue.constants';

export const rabbitmqConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: QUEUE_NAMES.USER_QUEUE,
    queueOptions: {
      durable: true,
    },
  },
};
