import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { SentryModule } from "@sentry/nestjs/setup";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { LoggerModule } from "nestjs-pino";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { auth } from "./auth/auth";
import type { EnvSchema } from "./config/env.schema";
import { validateEnv } from "./config/env.validation";
import { SentryExceptionFilter } from "./filter/sentry-exception.filter";
import { buildPinoConfig } from "./logger/logger.config";
import { PrismaModule } from "./prisma/prisma.module";

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
    PrismaModule,
    AuthModule.forRoot({ auth, disableGlobalAuthGuard: true }),
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
