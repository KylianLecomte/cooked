import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { validateEnv } from "./config/env.validation";
import type { EnvSchema } from "./config/env.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate: validateEnv,
    }),
    SentryModule.forRoot(),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema>) => {
        const isDev = config.get("NODE_ENV", { infer: true }) === "development";

        return {
          pinoHttp: {
            // En dev : logs lisibles via pino-pretty
            // En prod : JSON brut — parsé par Axiom
            transport: isDev
              ? {
                  target: "pino-pretty",
                  options: {
                    colorize: true,
                    translateTime: "HH:MM:ss",
                    // Ignore les champs techniques pino-http dans l'affichage dev
                    ignore: "pid,hostname,req,res",
                  },
                }
              : undefined,

            level: isDev ? "debug" : "info",

            // Champs ajoutés à chaque ligne de log — utiles pour filtrer dans Axiom
            // En prod, ajouter version: process.env.npm_package_version
            base: isDev ? undefined : { env: "production" },

            // Personnalise le message de log HTTP généré par pino-http
            customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,

            customErrorMessage: (req, res, err) =>
              `${req.method} ${req.url} ${res.statusCode} — ${err.message}`,

            // Ne log pas les health checks — ils polluent les logs sans valeur
            autoLogging: {
              ignore: (req) => req.url === "/health",
            },
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
