import { Logger } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OffProduct } from "./food.type";
import { makeHttpResponse } from "./mock/food.mock";
import { OffService } from "./off.service";

const MOCK_PRODUCT: OffProduct = {
  code: "5000112126619",
  product_name: "Chocolate Bar",
  brands: "Brand X",
  pnns_groups_1: "Sugary snacks",
  nutriments: { "energy-kcal_100g": 540, proteins_100g: 5, carbohydrates_100g: 60, fat_100g: 30 },
};

describe("OffService", () => {
  let service: OffService;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    vi.spyOn(Logger.prototype, "warn").mockReturnValue(undefined);
    vi.spyOn(Logger.prototype, "error").mockReturnValue(undefined);
    service = new OffService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("search(query, limit?)", () => {
    it("should return products on success", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ products: [MOCK_PRODUCT] }));

      const result = await service.search("chocolate");

      expect(result).toEqual([MOCK_PRODUCT]);
    });

    it("should return multiple products", async () => {
      const products = [MOCK_PRODUCT, { ...MOCK_PRODUCT, code: "111" }];
      mockFetch.mockResolvedValue(makeHttpResponse({ products }));

      const result = await service.search("chocolate");

      expect(result).toHaveLength(2);
    });

    it("should return [] when products array is missing from response", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({}));

      const result = await service.search("chocolate");

      expect(result).toEqual([]);
    });

    it("should return [] when response is not ok", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({}, false));

      const result = await service.search("chocolate");

      expect(result).toEqual([]);
    });

    it("should return [] and log error when fetch throws (timeout / network error)", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await service.search("chocolate");

      expect(result).toEqual([]);
    });

    it("should pass query and limit as URL params", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ products: [] }));

      await service.search("chicken", 5);

      const calledUrl: string = mockFetch.mock.calls[0][0];
      const url = new URL(calledUrl);
      expect(url.searchParams.get("search_terms")).toBe("chicken");
      expect(url.searchParams.get("page_size")).toBe("5");
    });

    it("should default limit to 10", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ products: [] }));

      await service.search("chicken");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      const url = new URL(calledUrl);
      expect(url.searchParams.get("page_size")).toBe("10");
    });

    it("should include required fixed params (json, action, fields)", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ products: [] }));

      await service.search("test");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      const url = new URL(calledUrl);
      expect(url.searchParams.get("json")).toBe("1");
      expect(url.searchParams.get("action")).toBe("process");
      expect(url.searchParams.get("fields")).toBeTruthy();
    });
  });

  describe("getByBarcode(barcode)", () => {
    it("should return the product when status is 1 and product is present", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ status: 1, product: MOCK_PRODUCT }));

      const result = await service.getByBarcode("5000112126619");

      expect(result).toEqual(MOCK_PRODUCT);
    });

    it("should return null when response is not ok", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({}, false));

      const result = await service.getByBarcode("5000112126619");

      expect(result).toBeNull();
    });

    it("should return null when OFF status !== 1 (product not found)", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ status: 0 }));

      const result = await service.getByBarcode("0000000000000");

      expect(result).toBeNull();
    });

    it("should return null when OFF status is 1 but product is missing", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ status: 1 }));

      const result = await service.getByBarcode("5000112126619");

      expect(result).toBeNull();
    });

    it("should return null and log error when fetch throws", async () => {
      mockFetch.mockRejectedValue(new Error("Timeout"));

      const result = await service.getByBarcode("5000112126619");

      expect(result).toBeNull();
    });

    it("should include the barcode in the URL", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ status: 1, product: MOCK_PRODUCT }));

      await service.getByBarcode("5000112126619");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("5000112126619");
    });
  });
});
