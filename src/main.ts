import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { rabbitmqConfig } from './config/rabbitmq.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Connect RabbitMQ Microservice
  app.connectMicroservice<MicroserviceOptions>(rabbitmqConfig);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Users API dengan Redis Cache & RabbitMQ')
    .setDescription(
      'Dokumentasi API untuk pengujian CRUD Users, performa Redis, dan messaging RabbitMQ',
    )
    .setVersion('2.0')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start all microservices lalu HTTP server
  await app.startAllMicroservices();
  await app.listen(3000);

  console.log('Aplikasi berjalan di: http://localhost:3000');
  console.log('Swagger UI tersedia di: http://localhost:3000/api');
  console.log('RabbitMQ Microservice terhubung');
}

bootstrap().catch((error: unknown) => {
  console.error('Gagal menjalankan aplikasi:', error);
});