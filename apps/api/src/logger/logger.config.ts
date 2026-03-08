import type { Params } from "nestjs-pino";
import type pino from "pino";
import { LoggerConfigOptions } from "./logger.type";

export function buildPinoConfig(options: LoggerConfigOptions): Params {
  const { isDev } = options;

  return {
    pinoHttp: {
      transport: buildPinoTransport(options),
      level: isDev ? "debug" : "info",
      base: isDev ? undefined : { env: "production" },
      customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
      customErrorMessage: (req, res, err) =>
        `${req.method} ${req.url} ${res.statusCode} — ${err.message}`,
      autoLogging: { ignore: (req) => req.url === "/health" },
    },
  };
}

export function buildPinoTransport(
  options: LoggerConfigOptions,
): pino.TransportSingleOptions | pino.TransportMultiOptions | undefined {
  const { isDev, axiomDataset, axiomToken } = options;
  const hasAxiom = !!axiomDataset && !!axiomToken;

  if (isDev) {
    return {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname,req,res",
      },
    };
  }

  if (hasAxiom) {
    return {
      targets: [
        { target: "pino/file", options: { destination: 1 } },
        {
          target: "@axiomhq/pino",
          options: { dataset: axiomDataset, token: axiomToken },
        },
      ],
    };
  }

  return undefined;
}
