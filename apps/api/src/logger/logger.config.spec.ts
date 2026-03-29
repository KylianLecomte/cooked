import { describe, expect, it } from "vitest";
import { buildPinoConfig, buildPinoTransport } from "./logger.config";

describe("buildPinoTransport", () => {
  describe("development mode", () => {
    it("should return a pino-pretty single transport", () => {
      const transport = buildPinoTransport({ isDev: true });
      expect(transport).toMatchObject({ target: "pino-pretty" });
    });

    it("should enable colorize and a human-readable time format", () => {
      const transport = buildPinoTransport({ isDev: true }) as { options: Record<string, unknown> };
      expect(transport.options.colorize).toBe(true);
      expect(transport.options.translateTime).toBe("HH:MM:ss");
    });
  });

  describe("production mode — with Axiom", () => {
    const prodWithAxiom = { isDev: false, axiomDataset: "my-dataset", axiomToken: "my-token" };

    it("should return a multi-transport", () => {
      const transport = buildPinoTransport(prodWithAxiom) as { targets: unknown[] };
      expect(Array.isArray(transport.targets)).toBe(true);
    });

    it("should include pino/file (stdout) as one of the targets", () => {
      const transport = buildPinoTransport(prodWithAxiom) as { targets: { target: string }[] };
      expect(transport.targets.some((t) => t.target === "pino/file")).toBe(true);
    });

    it("should include @axiomhq/pino with the correct dataset and token", () => {
      const transport = buildPinoTransport(prodWithAxiom) as {
        targets: { target: string; options: Record<string, unknown> }[];
      };
      const axiomTarget = transport.targets.find((t) => t.target === "@axiomhq/pino");
      expect(axiomTarget).toBeDefined();
      expect(axiomTarget?.options.dataset).toBe("my-dataset");
      expect(axiomTarget?.options.token).toBe("my-token");
    });
  });

  describe("production mode — without Axiom", () => {
    it("should return undefined when no Axiom credentials are provided", () => {
      expect(buildPinoTransport({ isDev: false })).toBeUndefined();
    });

    it("should return undefined when only axiomDataset is provided", () => {
      expect(buildPinoTransport({ isDev: false, axiomDataset: "dataset" })).toBeUndefined();
    });

    it("should return undefined when only axiomToken is provided", () => {
      expect(buildPinoTransport({ isDev: false, axiomToken: "token" })).toBeUndefined();
    });
  });
});

describe("buildPinoConfig", () => {
  it("should set log level to debug in dev mode", () => {
    const http = buildPinoConfig({ isDev: true }).pinoHttp as { level?: string };
    expect(http.level).toBe("debug");
  });

  it("should set log level to info in production", () => {
    const http = buildPinoConfig({ isDev: false }).pinoHttp as { level?: string };
    expect(http.level).toBe("info");
  });

  it("should include env:production base in production", () => {
    const http = buildPinoConfig({ isDev: false }).pinoHttp as { base?: Record<string, string> };
    expect(http.base).toEqual({ env: "production" });
  });

  it("should not include base in dev mode (cleaner console output)", () => {
    const http = buildPinoConfig({ isDev: true }).pinoHttp as { base?: unknown };
    expect(http.base).toBeUndefined();
  });

  it("should ignore /health requests to avoid noise", () => {
    const http = buildPinoConfig({ isDev: true }).pinoHttp as {
      autoLogging?: { ignore: (req: { url: string }) => boolean };
    };
    expect(http.autoLogging?.ignore({ url: "/health" })).toBe(true);
    expect(http.autoLogging?.ignore({ url: "/api/diary" })).toBe(false);
  });

  it("should format customSuccessMessage as '<method> <url> <status>'", () => {
    const http = buildPinoConfig({ isDev: false }).pinoHttp as {
      customSuccessMessage?: (
        req: { method: string; url: string },
        res: { statusCode: number },
      ) => string;
    };
    expect(
      http.customSuccessMessage?.({ method: "GET", url: "/v1/api/profile" }, { statusCode: 200 }),
    ).toBe("GET /v1/api/profile 200");
  });

  it("should format customErrorMessage including the error message", () => {
    const http = buildPinoConfig({ isDev: false }).pinoHttp as {
      customErrorMessage?: (
        req: { method: string; url: string },
        res: { statusCode: number },
        err: { message: string },
      ) => string;
    };
    expect(
      http.customErrorMessage?.(
        { method: "POST", url: "/v1/api/diary" },
        { statusCode: 500 },
        { message: "DB crashed" },
      ),
    ).toBe("POST /v1/api/diary 500 — DB crashed");
  });
});
