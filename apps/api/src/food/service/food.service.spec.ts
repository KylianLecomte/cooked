import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { REDIS_CACHE_TTL_1D, REDIS_CACHE_TTL_7D } from "src/util/constant";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FoodSource } from "../../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/service/redis.service";
import * as foodNormalizer from "../food.normalizer";
import type { OffProduct, UsdaSearchFood } from "../food.type";
import {
  createMockFood,
  createMockFoodSummary,
  createMockOffProduct,
  createMockServices,
  createMockUsdaFood,
  MockServices,
  mockNormalizeOffProduct,
  mockNormalizeOffProductAsNull,
  mockNormalizeOffProductConditional,
  mockNormalizeUsdaDetail,
  mockNormalizeUsdaSearch,
} from "../mock/food.mock";
import { FoodService } from "./food.service";
import { OffService } from "./off.service";
import { UsdaService } from "./usda.service";

describe("FoodService", () => {
  let service: FoodService;
  let mockPrismaService: MockServices["prisma"];
  let mockRedisService: MockServices["redis"];
  let mockUsdaService: MockServices["usda"];
  let mockOffService: MockServices["off"];

  beforeEach(async () => {
    const mocks = createMockServices();
    mockPrismaService = mocks.prisma;
    mockRedisService = mocks.redis;
    mockUsdaService = mocks.usda;
    mockOffService = mocks.off;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: UsdaService, useValue: mockUsdaService },
        { provide: OffService, useValue: mockOffService },
      ],
    }).compile();

    service = module.get<FoodService>(FoodService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("search", () => {
    const query = "chicken";
    const cacheKey = `food:search:${query.toLowerCase().trim()}`;

    describe("cache hit", () => {
      it("should return cached results without calling external services", async () => {
        const cachedResults = [
          createMockFoodSummary(),
          createMockFoodSummary({ sourceId: "off_456" }),
        ];
        mockRedisService.getJson.mockResolvedValue(cachedResults);

        const result = await service.search(query);

        expect(result).toEqual(cachedResults);
        expect(mockRedisService.getJson).toHaveBeenCalledWith(cacheKey);
        expect(mockUsdaService.search).not.toHaveBeenCalled();
        expect(mockOffService.search).not.toHaveBeenCalled();
      });
    });

    describe("cache miss - database operations", () => {
      it("should search USDA and OFF services in parallel", async () => {
        const mockUsdaFood = createMockUsdaFood();
        const mockOffFood = createMockOffProduct();

        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([mockUsdaFood]);
        mockOffService.search.mockResolvedValue([mockOffFood]);
        mockNormalizeUsdaSearch({ sourceId: "12345" });
        mockNormalizeOffProduct({ sourceId: "5000112126619" });
        mockPrismaService.client.food.upsert.mockResolvedValue(createMockFoodSummary());

        await service.search(query);

        expect(mockUsdaService.search).toHaveBeenCalledWith(query, 10);
        expect(mockOffService.search).toHaveBeenCalledWith(query, 10);
      });

      it("should normalize and upsert USDA results", async () => {
        const mockUsdaFood = createMockUsdaFood();
        const normalizedData = {
          sourceId: "12345",
          name: "Chicken Breast",
        };

        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([mockUsdaFood]);
        mockOffService.search.mockResolvedValue([]);
        mockNormalizeUsdaSearch(normalizedData);
        const mockSummary = createMockFoodSummary({ source: FoodSource.USDA, sourceId: "12345" });
        mockPrismaService.client.food.upsert.mockResolvedValue(mockSummary);

        const result = await service.search(query);

        expect(foodNormalizer.normalizeUsdaSearch).toHaveBeenCalledWith(mockUsdaFood);
        expect(mockPrismaService.client.food.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { source_sourceId: { source: FoodSource.USDA, sourceId: "12345" } },
            create: expect.any(Object),
            update: expect.any(Object),
          }),
        );
        expect(result).toContain(mockSummary);
      });

      it("should normalize and upsert OFF results", async () => {
        const mockOffFood = createMockOffProduct();
        const normalizedData = {
          sourceId: "5000112126619",
          name: "Chicken Nuggets",
        };

        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([]);
        mockOffService.search.mockResolvedValue([mockOffFood]);
        mockNormalizeOffProduct(normalizedData);
        const mockSummary = createMockFoodSummary({
          source: FoodSource.OFF,
          sourceId: "5000112126619",
        });
        mockPrismaService.client.food.upsert.mockResolvedValue(mockSummary);

        const result = await service.search(query);

        expect(foodNormalizer.normalizeOffProduct).toHaveBeenCalledWith(mockOffFood);
        expect(mockPrismaService.client.food.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { source_sourceId: { source: FoodSource.OFF, sourceId: "5000112126619" } },
          }),
        );
        expect(result).toContain(mockSummary);
      });

      it("should skip OFF products that fail normalization", async () => {
        const validOffProduct = createMockOffProduct();
        const invalidOffProduct = createMockOffProduct({ product_name: null });

        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([]);
        mockOffService.search.mockResolvedValue([validOffProduct, invalidOffProduct]);
        mockNormalizeOffProductConditional((product: OffProduct) => !!product.product_name);
        mockPrismaService.client.food.upsert.mockResolvedValue(createMockFoodSummary());

        await service.search(query);

        expect(mockPrismaService.client.food.upsert).toHaveBeenCalledTimes(1);
      });

      it("should continue processing after OFF upsert failure", async () => {
        const mockOffFood1 = createMockOffProduct();
        const mockOffFood2 = createMockOffProduct({ code: "5000112126620" });

        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([]);
        mockOffService.search.mockResolvedValue([mockOffFood1, mockOffFood2]);
        mockNormalizeOffProduct();
        mockPrismaService.client.food.upsert.mockRejectedValueOnce(
          new Error("Unique constraint failed"),
        );
        mockPrismaService.client.food.upsert.mockResolvedValueOnce(createMockFoodSummary());

        const result = await service.search(query);

        expect(result.length).toBe(1);
        expect(mockPrismaService.client.food.upsert).toHaveBeenCalledTimes(2);
      });
    });

    describe("caching", () => {
      it("should cache results with 1-day TTL", async () => {
        const mockUsdaFood = createMockUsdaFood();
        const mockSummary = createMockFoodSummary();

        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([mockUsdaFood]);
        mockOffService.search.mockResolvedValue([]);
        mockNormalizeUsdaSearch();
        mockPrismaService.client.food.upsert.mockResolvedValue(mockSummary);

        await service.search(query);

        expect(mockRedisService.setJson).toHaveBeenCalledWith(
          cacheKey,
          [mockSummary],
          REDIS_CACHE_TTL_1D,
        );
      });

      it("should normalize query before caching", async () => {
        const queryWithSpaces = "  CHICKEN  ";
        const normalizedCacheKey = `food:search:chicken`;

        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([]);
        mockOffService.search.mockResolvedValue([]);

        await service.search(queryWithSpaces);

        expect(mockRedisService.getJson).toHaveBeenCalledWith(normalizedCacheKey);
      });
    });

    describe("edge cases", () => {
      it("should handle empty USDA and OFF results", async () => {
        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([]);
        mockOffService.search.mockResolvedValue([]);

        const result = await service.search(query);

        expect(result).toEqual([]);
        expect(mockRedisService.setJson).toHaveBeenCalledWith(cacheKey, [], REDIS_CACHE_TTL_1D);
      });

      it("should handle mixed USDA and OFF results", async () => {
        const mockUsdaFood = createMockUsdaFood();
        const mockOffFood = createMockOffProduct();
        const usdaSummary = createMockFoodSummary({ source: FoodSource.USDA });
        const offSummary = createMockFoodSummary({ source: FoodSource.OFF });

        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([mockUsdaFood]);
        mockOffService.search.mockResolvedValue([mockOffFood]);
        mockNormalizeUsdaSearch();
        mockNormalizeOffProduct();
        mockPrismaService.client.food.upsert.mockResolvedValueOnce(usdaSummary);
        mockPrismaService.client.food.upsert.mockResolvedValueOnce(offSummary);

        const result = await service.search(query);

        expect(result).toHaveLength(2);
        expect(result).toContainEqual(usdaSummary);
        expect(result).toContainEqual(offSummary);
      });

      it("should propagate USDA search errors", async () => {
        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockRejectedValue(new Error("USDA API error"));

        await expect(service.search(query)).rejects.toThrow("USDA API error");
      });

      it("should propagate OFF search errors", async () => {
        mockRedisService.getJson.mockResolvedValue(null);
        mockUsdaService.search.mockResolvedValue([]);
        mockOffService.search.mockRejectedValue(new Error("OFF API error"));

        await expect(service.search(query)).rejects.toThrow("OFF API error");
      });
    });
  });

  describe("findByBarcode", () => {
    const barcode = "5000112126619";
    const cacheKey = `food:barcode:${barcode}`;

    describe("cache hit", () => {
      it("should return cached result without database or API calls", async () => {
        const cachedFood = createMockFoodSummary();
        mockRedisService.getJson.mockResolvedValue(cachedFood);

        const result = await service.findByBarcode(barcode);

        expect(result).toEqual(cachedFood);
        expect(mockRedisService.getJson).toHaveBeenCalledWith(cacheKey);
        expect(mockPrismaService.client.food.findUnique).not.toHaveBeenCalled();
        expect(mockOffService.getByBarcode).not.toHaveBeenCalled();
      });
    });

    describe("cache miss - found in database", () => {
      it("should return food from database and cache it", async () => {
        const foodFromDb = createMockFoodSummary();

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(foodFromDb);

        const result = await service.findByBarcode(barcode);

        expect(result).toEqual(foodFromDb);
        expect(mockPrismaService.client.food.findUnique).toHaveBeenCalledWith({
          where: { source_sourceId: { source: FoodSource.OFF, sourceId: barcode } },
          select: expect.any(Object),
        });
        expect(mockRedisService.setJson).toHaveBeenCalledWith(
          cacheKey,
          foodFromDb,
          REDIS_CACHE_TTL_7D,
        );
      });

      it("should not call OFF API if food found in database", async () => {
        const foodFromDb = createMockFoodSummary();

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(foodFromDb);

        await service.findByBarcode(barcode);

        expect(mockOffService.getByBarcode).not.toHaveBeenCalled();
      });
    });

    describe("cache miss - found via OFF API", () => {
      it("should fetch from OFF API when not in database", async () => {
        const mockOffProduct = createMockOffProduct();
        const upsertedFood = createMockFoodSummary();

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(null);
        mockOffService.getByBarcode.mockResolvedValue(mockOffProduct);
        mockNormalizeOffProduct({ sourceId: barcode });
        mockPrismaService.client.food.upsert.mockResolvedValue(upsertedFood);

        const result = await service.findByBarcode(barcode);

        expect(result).toEqual(upsertedFood);
        expect(mockOffService.getByBarcode).toHaveBeenCalledWith(barcode);
        expect(foodNormalizer.normalizeOffProduct).toHaveBeenCalledWith(mockOffProduct);
      });

      it("should cache upserted food with 7-day TTL", async () => {
        const mockOffProduct = createMockOffProduct();
        const upsertedFood = createMockFoodSummary();

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(null);
        mockOffService.getByBarcode.mockResolvedValue(mockOffProduct);
        mockNormalizeOffProduct();
        mockPrismaService.client.food.upsert.mockResolvedValue(upsertedFood);

        await service.findByBarcode(barcode);

        expect(mockRedisService.setJson).toHaveBeenCalledWith(
          cacheKey,
          upsertedFood,
          REDIS_CACHE_TTL_7D,
        );
      });
    });

    describe("cache miss - not found", () => {
      it("should return null when barcode not found anywhere", async () => {
        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(null);
        mockOffService.getByBarcode.mockResolvedValue(null);

        const result = await service.findByBarcode(barcode);

        expect(result).toBeNull();
      });

      it("should return null when normalization returns null", async () => {
        const mockOffProduct = createMockOffProduct({ product_name: null });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(null);
        mockOffService.getByBarcode.mockResolvedValue(mockOffProduct);
        mockNormalizeOffProductAsNull();

        const result = await service.findByBarcode(barcode);

        expect(result).toBeNull();
      });

      it("should not cache null results", async () => {
        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(null);
        mockOffService.getByBarcode.mockResolvedValue(null);

        await service.findByBarcode(barcode);

        expect(mockRedisService.setJson).not.toHaveBeenCalled();
      });
    });

    describe("error handling", () => {
      it("should throw on upsert failure", async () => {
        const mockOffProduct = createMockOffProduct();

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(null);
        mockOffService.getByBarcode.mockResolvedValue(mockOffProduct);
        mockNormalizeOffProduct();
        mockPrismaService.client.food.upsert.mockRejectedValue(new Error("DB error"));

        await expect(service.findByBarcode(barcode)).rejects.toThrow();
      });

      it("should propagate OFF API errors", async () => {
        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(null);
        mockOffService.getByBarcode.mockRejectedValue(new Error("OFF API error"));

        await expect(service.findByBarcode(barcode)).rejects.toThrow("OFF API error");
      });
    });
  });

  describe("findById", () => {
    const foodId = "food_001";
    const cacheKey = `food:detail:${foodId}`;

    describe("cache hit", () => {
      it("should return cached food without database calls", async () => {
        const cachedFood = createMockFood();
        mockRedisService.getJson.mockResolvedValue(cachedFood);

        const result = await service.findById(foodId);

        expect(result).toEqual(cachedFood);
        expect(mockRedisService.getJson).toHaveBeenCalledWith(cacheKey);
        expect(mockPrismaService.client.food.findUnique).not.toHaveBeenCalled();
      });
    });

    describe("cache miss - food not found", () => {
      it("should throw NotFoundException when food not in database", async () => {
        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(null);

        await expect(service.findById(foodId)).rejects.toThrow(NotFoundException);
      });

      it("should throw NotFoundException with proper message", async () => {
        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(null);

        await expect(service.findById(foodId)).rejects.toThrow(`Food ${foodId} not found`);
      });
    });

    describe("cache miss - non-USDA food", () => {
      it("should return OFF food without micro data fetch", async () => {
        const offFood = createMockFood({ source: FoodSource.OFF, microDataComplete: false });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(offFood);

        const result = await service.findById(foodId);

        expect(result).toEqual(offFood);
        expect(mockUsdaService.getDetail).not.toHaveBeenCalled();
      });

      it("should cache non-USDA food with 7-day TTL", async () => {
        const offFood = createMockFood({ source: FoodSource.OFF });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(offFood);

        await service.findById(foodId);

        expect(mockRedisService.setJson).toHaveBeenCalledWith(
          cacheKey,
          offFood,
          REDIS_CACHE_TTL_7D,
        );
      });
    });

    describe("cache miss - USDA with microDataComplete=true", () => {
      it("should return USDA food without fetching detail when microDataComplete is true", async () => {
        const usdaFood = createMockFood({ source: FoodSource.USDA, microDataComplete: true });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(usdaFood);

        const result = await service.findById(foodId);

        expect(result).toEqual(usdaFood);
        expect(mockUsdaService.getDetail).not.toHaveBeenCalled();
      });

      it("should cache complete USDA food with 7-day TTL", async () => {
        const usdaFood = createMockFood({ source: FoodSource.USDA, microDataComplete: true });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(usdaFood);

        await service.findById(foodId);

        expect(mockRedisService.setJson).toHaveBeenCalledWith(
          cacheKey,
          usdaFood,
          REDIS_CACHE_TTL_7D,
        );
      });
    });

    describe("cache miss - USDA with microDataComplete=false", () => {
      it("should fetch detailed USDA data when microDataComplete is false", async () => {
        const incompleteFood = createMockFood({
          source: FoodSource.USDA,
          microDataComplete: false,
        });
        const mockUsdaDetail = {
          fdcId: "usda_789",
          description: "Apple",
          foodNutrients: [
            { nutrient: { id: 317 }, amount: 3 }, // vitA
            { nutrient: { id: 401 }, amount: 4.6 }, // vitC
          ],
        };
        const completedFood = createMockFood({ source: FoodSource.USDA, microDataComplete: true });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(incompleteFood);
        mockUsdaService.getDetail.mockResolvedValue(mockUsdaDetail);
        mockNormalizeUsdaDetail({ vitA: 3, vitC: 4.6 });
        mockPrismaService.client.food.update.mockResolvedValue(completedFood);

        const result = await service.findById(foodId);

        expect(result).toEqual(completedFood);
        expect(mockUsdaService.getDetail).toHaveBeenCalledWith(incompleteFood.sourceId);
      });

      it("should update all micronutrients in database", async () => {
        const incompleteFood = createMockFood({
          source: FoodSource.USDA,
          microDataComplete: false,
        });
        const mockUsdaDetail = {
          fdcId: "usda_789",
          foodNutrients: [],
        };
        const normalizedData = {
          source: FoodSource.USDA,
          sourceId: "usda_789",
          name: "Apple",
          kcalPer100g: 52,
          proteinPer100g: 0.26,
          carbsPer100g: 13.81,
          fatPer100g: 0.17,
          fiberPer100g: 2.4,
          vitA: 3,
          vitB1: 0.028,
          vitB2: 0.026,
          vitB3: 0.091,
          vitB5: 0.111,
          vitB6: 0.041,
          vitB9: 3,
          vitB12: 0,
          vitC: 4.6,
          vitD: 0,
          vitE: 0.18,
          vitK: 2.2,
          calcium: 6,
          iron: 0.12,
          magnesium: 5,
          potassium: 107,
          zinc: 0.04,
          phosphorus: 11,
          selenium: 0,
          sodium: 1,
          copper: 0.027,
          manganese: 0.035,
        };
        // Service only updates micronutrients, not base fields
        const micronutrientFields = {
          vitA: normalizedData.vitA,
          vitB1: normalizedData.vitB1,
          vitB2: normalizedData.vitB2,
          vitB3: normalizedData.vitB3,
          vitB5: normalizedData.vitB5,
          vitB6: normalizedData.vitB6,
          vitB9: normalizedData.vitB9,
          vitB12: normalizedData.vitB12,
          vitC: normalizedData.vitC,
          vitD: normalizedData.vitD,
          vitE: normalizedData.vitE,
          vitK: normalizedData.vitK,
          calcium: normalizedData.calcium,
          iron: normalizedData.iron,
          magnesium: normalizedData.magnesium,
          potassium: normalizedData.potassium,
          zinc: normalizedData.zinc,
          phosphorus: normalizedData.phosphorus,
          selenium: normalizedData.selenium,
          sodium: normalizedData.sodium,
          copper: normalizedData.copper,
          manganese: normalizedData.manganese,
        };

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(incompleteFood);
        mockUsdaService.getDetail.mockResolvedValue(mockUsdaDetail);
        mockNormalizeUsdaDetail(normalizedData);
        mockPrismaService.client.food.update.mockResolvedValue(createMockFood());

        await service.findById(foodId);

        expect(mockPrismaService.client.food.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: foodId },
            data: expect.objectContaining({
              ...micronutrientFields,
              microDataComplete: true,
            }),
          }),
        );
      });

      it("should cache completed food after update", async () => {
        const incompleteFood = createMockFood({
          source: FoodSource.USDA,
          microDataComplete: false,
        });
        const completedFood = createMockFood({ source: FoodSource.USDA, microDataComplete: true });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(incompleteFood);
        mockUsdaService.getDetail.mockResolvedValue({} as unknown as Parameters<typeof vi.fn>[0]);
        mockNormalizeUsdaDetail();
        mockPrismaService.client.food.update.mockResolvedValue(completedFood);

        await service.findById(foodId);

        expect(mockRedisService.setJson).toHaveBeenCalledWith(
          cacheKey,
          completedFood,
          REDIS_CACHE_TTL_7D,
        );
      });

      it("should cache incomplete food when USDA detail fetch returns null", async () => {
        const incompleteFood = createMockFood({
          source: FoodSource.USDA,
          microDataComplete: false,
        });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(incompleteFood);
        mockUsdaService.getDetail.mockResolvedValue(null);

        const result = await service.findById(foodId);

        expect(result).toEqual(incompleteFood);
        expect(mockPrismaService.client.food.update).not.toHaveBeenCalled();
        expect(mockRedisService.setJson).toHaveBeenCalledWith(
          cacheKey,
          incompleteFood,
          REDIS_CACHE_TTL_7D,
        );
      });

      it("should not update database when USDA detail fetch returns null", async () => {
        const incompleteFood = createMockFood({
          source: FoodSource.USDA,
          microDataComplete: false,
        });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(incompleteFood);
        mockUsdaService.getDetail.mockResolvedValue(null);

        await service.findById(foodId);

        expect(mockPrismaService.client.food.update).not.toHaveBeenCalled();
      });
    });

    describe("edge cases", () => {
      it("should handle concurrent requests without race conditions", async () => {
        const food = createMockFood();

        mockRedisService.getJson.mockResolvedValue(food);

        const [result1, result2] = await Promise.all([
          service.findById(foodId),
          service.findById(foodId),
        ]);

        expect(result1).toEqual(food);
        expect(result2).toEqual(food);
        expect(mockRedisService.getJson).toHaveBeenCalledTimes(2);
      });
    });

    describe("error handling", () => {
      it("should propagate database errors on findUnique", async () => {
        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockRejectedValue(
          new Error("DB connection error"),
        );

        await expect(service.findById(foodId)).rejects.toThrow("DB connection error");
      });

      it("should propagate USDA detail fetch errors", async () => {
        const incompleteFood = createMockFood({
          source: FoodSource.USDA,
          microDataComplete: false,
        });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(incompleteFood);
        mockUsdaService.getDetail.mockRejectedValue(new Error("USDA API error"));

        await expect(service.findById(foodId)).rejects.toThrow("USDA API error");
      });

      it("should propagate database update errors when updating micronutrients", async () => {
        const incompleteFood = createMockFood({
          source: FoodSource.USDA,
          microDataComplete: false,
        });

        mockRedisService.getJson.mockResolvedValue(null);
        mockPrismaService.client.food.findUnique.mockResolvedValue(incompleteFood);
        mockUsdaService.getDetail.mockResolvedValue({
          fdcId: 123,
          description: "test",
          foodNutrients: [],
        } as unknown as UsdaSearchFood);
        mockNormalizeUsdaDetail();
        mockPrismaService.client.food.update.mockRejectedValue(new Error("Update failed"));

        await expect(service.findById(foodId)).rejects.toThrow("Update failed");
      });
    });
  });
});
