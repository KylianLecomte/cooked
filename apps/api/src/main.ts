import "./instrument";
import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { Logger as PinoLogger } from "nestjs-pino";
import { AppModule } from "./app.module";
import type { EnvSchema } from "./config/env.schema";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Désactive le logger NestJS par défaut pendant le bootstrap
    // Les logs seront bufferisés jusqu'à ce que Pino soit prêt
    bufferLogs: true,
    bodyParser: false, // Requis pour @thallesp/nestjs-better-auth
  });

  app.useLogger(app.get(PinoLogger));

  const configService = app.get(ConfigService<EnvSchema>);
  const port = configService.get("PORT", { infer: true });

  await app.listen(port ?? 3000);

  // Ces logs passent maintenant par Pino
  const logger = new Logger("Bootstrap");
  logger.log(`API running on port ${port}`);
  logger.log(`Environment: ${configService.get("NODE_ENV", { infer: true })}`);
}

bootstrap().catch((_: unknown) => {
  process.exit(1);
});
