import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = new Logger('Bootstrap');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`API running on port ${port}`);
}
bootstrap();
