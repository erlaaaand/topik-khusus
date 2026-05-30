import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { rabbitmqConfig } from './config/rabbitmq.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>(rabbitmqConfig);

  const config = new DocumentBuilder()
    .setTitle('Users & Orders API — Redis Cache, RabbitMQ & MongoDB')
    .setDescription(
      'Dokumentasi API untuk pengujian CRUD Users & Orders, persistensi MongoDB, performa Redis Cache, dan messaging event antar module via RabbitMQ',
    )
    .setVersion('2.0')
    .addTag('users')
    .addTag('orders')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(3000);

  console.log('Aplikasi berjalan di: http://localhost:3000');
  console.log('Swagger UI tersedia di: http://localhost:3000/api');
  console.log('RabbitMQ Microservice terhubung');
  console.log('MongoDB terhubung');
}

bootstrap().catch((error: unknown) => {
  console.error('Gagal menjalankan aplikasi:', error);
});