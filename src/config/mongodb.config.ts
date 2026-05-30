import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const mongodbConfig: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI') ?? 'mongodb://localhost:27017/nestjs-demo',
  }),
};