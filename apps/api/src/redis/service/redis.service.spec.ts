import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EnvSchema } from "../../config/env.schema";
import { RedisService } from "./redis.service";

vi.mock("ioredis", () => ({
  default: vi.fn(),
}));

describe("RedisService", () => {
  let service: RedisService;
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    quit: ReturnType<typeof vi.fn>;
    status: string;
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      set: vi.fn(),
      quit: vi.fn().mockResolvedValue("OK"),
      status: "ready",
    };
    // `function` keyword required — arrow functions cannot be used as constructors
    vi.mocked(Redis).mockImplementation(function () {
      return mockClient as unknown as Redis;
    });

    const mockConfig = {
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as ConfigService<EnvSchema>;
    service = new RedisService(mockConfig);
    service.onModuleInit();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("onModuleDestroy", () => {
    it("should call quit when client status is ready", async () => {
      mockClient.status = "ready";
      await service.onModuleDestroy();
      expect(mockClient.quit).toHaveBeenCalledOnce();
    });

    it("should not call quit when client is not connected", async () => {
      mockClient.status = "close";
      await service.onModuleDestroy();
      expect(mockClient.quit).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("should return the value from Redis", async () => {
      mockClient.get.mockResolvedValue("cached-value");
      expect(await service.get("my-key")).toBe("cached-value");
      expect(mockClient.get).toHaveBeenCalledWith("my-key");
    });

    it("should return null when the key does not exist", async () => {
      mockClient.get.mockResolvedValue(null);
      expect(await service.get("missing-key")).toBeNull();
    });

    it("should return null when Redis throws", async () => {
      mockClient.get.mockRejectedValue(new Error("ECONNREFUSED"));
      expect(await service.get("key")).toBeNull();
    });
  });

  describe("set", () => {
    it("should call client.set with the correct EX arguments", async () => {
      mockClient.set.mockResolvedValue("OK");
      await service.set("key", "value", 60);
      expect(mockClient.set).toHaveBeenCalledWith("key", "value", "EX", 60);
    });

    it("should silently swallow errors when Redis is unavailable", async () => {
      mockClient.set.mockRejectedValue(new Error("ECONNREFUSED"));
      await expect(service.set("key", "value", 60)).resolves.toBeUndefined();
    });
  });

  describe("getJson", () => {
    it("should return the parsed object", async () => {
      mockClient.get.mockResolvedValue(JSON.stringify({ kcal: 2000 }));
      expect(await service.getJson<{ kcal: number }>("key")).toEqual({ kcal: 2000 });
    });

    it("should return null when the key is missing", async () => {
      mockClient.get.mockResolvedValue(null);
      expect(await service.getJson("key")).toBeNull();
    });

    it("should return null when the stored value is corrupt JSON", async () => {
      mockClient.get.mockResolvedValue("{not-valid-json");
      expect(await service.getJson("key")).toBeNull();
    });

    it("should return null when Redis throws", async () => {
      mockClient.get.mockRejectedValue(new Error("ECONNREFUSED"));
      expect(await service.getJson("key")).toBeNull();
    });
  });

  describe("setJson", () => {
    it("should serialize the value to JSON before storing", async () => {
      mockClient.set.mockResolvedValue("OK");
      await service.setJson("key", { kcal: 2000 }, 300);
      expect(mockClient.set).toHaveBeenCalledWith("key", JSON.stringify({ kcal: 2000 }), "EX", 300);
    });
  });
});
