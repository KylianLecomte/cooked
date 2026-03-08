import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { validateEnv } from "./config/env.validation";
import type { EnvSchema } from "./config/env.schema";
import { buildPinoConfig } from "./logger/logger.config";
import { SentryExceptionFilter } from "./filter/sentry-exception.filter";

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema>) => {
        return buildPinoConfig({
          isDev: config.get("NODE_ENV", { infer: true }) === "development",
          axiomDataset: config.get("AXIOM_DATASET", { infer: true }),
          axiomToken: config.get("AXIOM_TOKEN", { infer: true }),
        });
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
