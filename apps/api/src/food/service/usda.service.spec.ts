import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UsdaFoodDetail, UsdaSearchFood } from "../food.type";
import { makeHttpResponse } from "../mock/food.mock";
import { UsdaService } from "./usda.service";

const MOCK_SEARCH_FOOD: UsdaSearchFood = {
  fdcId: 748967,
  description: "Chicken, broiler or fryers, breast, skinless",
  foodCategory: "Poultry Products",
  foodNutrients: [{ nutrientId: 1008, value: 165 }],
};

const MOCK_DETAIL_FOOD: UsdaFoodDetail = {
  fdcId: 748967,
  description: "Chicken, broiler or fryers, breast, skinless",
  foodCategory: "Poultry Products",
  foodNutrients: [
    { nutrient: { id: 1008, name: "Energy", unitName: "kcal" }, amount: 165 },
    { nutrient: { id: 1003, name: "Protein", unitName: "g" }, amount: 31 },
  ],
};

describe("UsdaService", () => {
  let service: UsdaService;
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockConfig: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    vi.spyOn(Logger.prototype, "warn").mockReturnValue(undefined);
    vi.spyOn(Logger.prototype, "error").mockReturnValue(undefined);

    mockConfig = { get: vi.fn().mockReturnValue("TEST_API_KEY") };
    service = new UsdaService(mockConfig as unknown as ConfigService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("search(query, limit?)", () => {
    it("should return foods on success", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ foods: [MOCK_SEARCH_FOOD] }));

      const result = await service.search("chicken");

      expect(result).toEqual([MOCK_SEARCH_FOOD]);
    });

    it("should return [] when foods array is missing from response", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({}));

      const result = await service.search("chicken");

      expect(result).toEqual([]);
    });

    it("should return [] when response is not ok", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({}, false));

      const result = await service.search("chicken");

      expect(result).toEqual([]);
    });

    it("should return [] and log error when fetch throws (timeout / network error)", async () => {
      mockFetch.mockRejectedValue(new Error("Network timeout"));

      const result = await service.search("chicken");

      expect(result).toEqual([]);
    });

    it("should pass query and limit as URL params", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ foods: [] }));

      await service.search("apple", 5);

      const calledUrl: string = mockFetch.mock.calls[0][0];
      const url = new URL(calledUrl);
      expect(url.searchParams.get("query")).toBe("apple");
      expect(url.searchParams.get("pageSize")).toBe("5");
    });

    it("should default limit to 10", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ foods: [] }));

      await service.search("apple");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      const url = new URL(calledUrl);
      expect(url.searchParams.get("pageSize")).toBe("10");
    });

    it("should include the API key from ConfigService in the URL", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ foods: [] }));

      await service.search("test");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      const url = new URL(calledUrl);
      expect(url.searchParams.get("api_key")).toBe("TEST_API_KEY");
    });

    it("should fall back to DEMO_KEY when ConfigService returns undefined", async () => {
      mockConfig.get.mockReturnValue(undefined);
      mockFetch.mockResolvedValue(makeHttpResponse({ foods: [] }));

      await service.search("test");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      const url = new URL(calledUrl);
      expect(url.searchParams.get("api_key")).toBe("DEMO_KEY");
    });

    it("should include all expected dataType values in the URL", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({ foods: [] }));

      await service.search("test");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      const url = new URL(calledUrl);
      const dataType = url.searchParams.get("dataType");
      expect(dataType).toContain("Foundation");
      expect(dataType).toContain("SR Legacy");
      expect(dataType).toContain("Branded");
    });
  });

  describe("getDetail(fdcId)", () => {
    it("should return the food detail on success", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse(MOCK_DETAIL_FOOD));

      const result = await service.getDetail("748967");

      expect(result).toEqual(MOCK_DETAIL_FOOD);
    });

    it("should return null when response is not ok", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse({}, false));

      const result = await service.getDetail("748967");

      expect(result).toBeNull();
    });

    it("should return null and log error when fetch throws", async () => {
      mockFetch.mockRejectedValue(new Error("Connection refused"));

      const result = await service.getDetail("748967");

      expect(result).toBeNull();
    });

    it("should include the fdcId in the URL", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse(MOCK_DETAIL_FOOD));

      await service.getDetail("748967");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("748967");
    });

    it("should include the API key in the URL", async () => {
      mockFetch.mockResolvedValue(makeHttpResponse(MOCK_DETAIL_FOOD));

      await service.getDetail("748967");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("TEST_API_KEY");
    });

    it("should fall back to DEMO_KEY when ConfigService returns undefined", async () => {
      mockConfig.get.mockReturnValue(undefined);
      mockFetch.mockResolvedValue(makeHttpResponse(MOCK_DETAIL_FOOD));

      await service.getDetail("748967");

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("DEMO_KEY");
    });
  });
});
