import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

import type { EnvSchema } from "./config/env.schema";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = new Logger("Bootstrap");

  // ConfigService est typé avec EnvSchema — autocomplétion et typage fort sur get()
  const configService = app.get(ConfigService<EnvSchema>);

  // Les variables sont typées : configService.get('PORT') retourne number, pas string
  const port = configService.get("PORT", { infer: true });
  await app.listen(port ?? 3000);

  logger.log(`API running on port ${port}`);
  logger.log(`Environment: ${configService.get("NODE_ENV", { infer: true })}`);
}
bootstrap();
