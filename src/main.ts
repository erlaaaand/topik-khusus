import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Users API dengan Redis Cache')
    .setDescription('Dokumentasi API untuk pengujian CRUD Users dan performa Redis')
    .setVersion('1.0')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('Aplikasi berjalan di: http://localhost:3000');
  console.log('Swagger UI tersedia di: http://localhost:3000/api');
}

bootstrap().catch((error: unknown) => {
  console.error('Gagal menjalankan aplikasi:', error);
});