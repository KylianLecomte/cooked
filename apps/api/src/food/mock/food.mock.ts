import { vi } from "vitest";
import { FoodCategory, FoodSource } from "../../../generated/prisma/client";
import * as foodNormalizer from "../food.normalizer";
import type { OffProduct, UsdaSearchFood } from "../food.type";

export function makeHttpResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  } as Response;
}

export const createMockFoodSummary = (overrides?: Record<string, unknown>) => ({
  id: "food_001",
  source: FoodSource.OFF,
  sourceId: "off_123",
  name: "Chicken Breast",
  brand: "PDO",
  category: FoodCategory.PROTEIN,
  kcalPer100g: 165,
  proteinPer100g: 31,
  carbsPer100g: 0,
  fatPer100g: 3.6,
  fiberPer100g: 0,
  ...overrides,
});

export const createMockFood = (overrides?: Record<string, unknown>) => ({
  id: "food_001",
  source: FoodSource.USDA,
  sourceId: "usda_789",
  name: "Apple",
  brand: null,
  category: FoodCategory.FRUIT,
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
  microDataComplete: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockUsdaFood = (overrides?: Record<string, unknown>): UsdaSearchFood =>
  ({
    fdcId: 12345,
    description: "Chicken Breast Raw",
    brandOwner: "Farm Fresh",
    brandName: undefined,
    foodCategory: "Poultry Products",
    foodNutrients: [
      { nutrientId: 208, value: 165 }, // kcal
      { nutrientId: 203, value: 31 }, // protein
      { nutrientId: 205, value: 0 }, // carbs
      { nutrientId: 204, value: 3.6 }, // fat
      { nutrientId: 291, value: 0 }, // fiber
    ],
    ...overrides,
  }) as unknown as UsdaSearchFood;

export const createMockOffProduct = (overrides?: Record<string, unknown>): OffProduct =>
  ({
    code: "5000112126619",
    product_name: "Chicken Nuggets",
    brands: "Brand X",
    pnns_groups_1: "Meat",
    nutriments: {
      "energy-kcal_100g": 240,
      proteins_100g: 15,
      carbohydrates_100g: 20,
      fat_100g: 10,
      fiber_100g: 1,
    },
    ...overrides,
  }) as OffProduct;

const baseNormalizedData = {
  source: FoodSource.USDA,
  sourceId: "test",
  name: "test",
  kcalPer100g: 0,
  proteinPer100g: 0,
  carbsPer100g: 0,
  fatPer100g: 0,
};

export const createNormalizedUsdaSearch = (
  overrides?: Record<string, unknown>,
): ReturnType<typeof foodNormalizer.normalizeUsdaSearch> =>
  ({ ...baseNormalizedData, ...overrides }) as ReturnType<
    typeof foodNormalizer.normalizeUsdaSearch
  >;

export const createNormalizedUsdaDetail = (
  overrides?: Record<string, unknown>,
): ReturnType<typeof foodNormalizer.normalizeUsdaDetail> =>
  ({ ...baseNormalizedData, ...overrides }) as ReturnType<
    typeof foodNormalizer.normalizeUsdaDetail
  >;

export const createNormalizedOffProduct = (
  overrides?: Record<string, unknown>,
): ReturnType<typeof foodNormalizer.normalizeOffProduct> =>
  ({ ...baseNormalizedData, ...overrides }) as ReturnType<
    typeof foodNormalizer.normalizeOffProduct
  >;

export interface MockServices {
  prisma: {
    client: {
      food: {
        upsert: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
    };
  };
  redis: {
    getJson: ReturnType<typeof vi.fn>;
    setJson: ReturnType<typeof vi.fn>;
  };
  usda: {
    search: ReturnType<typeof vi.fn>;
    getDetail: ReturnType<typeof vi.fn>;
  };
  off: {
    search: ReturnType<typeof vi.fn>;
    getByBarcode: ReturnType<typeof vi.fn>;
  };
}

export const createMockUsdaService = (defaultSearchResults?: UsdaSearchFood[]) => ({
  search: vi.fn().mockResolvedValue(defaultSearchResults ?? [createMockUsdaFood()]),
  getDetail: vi.fn().mockResolvedValue(createMockUsdaFood()),
});

export const createMockOffService = (defaultProduct?: OffProduct) => ({
  search: vi.fn().mockResolvedValue([defaultProduct ?? createMockOffProduct()]),
  getByBarcode: vi.fn().mockResolvedValue(defaultProduct ?? createMockOffProduct()),
});

export const createMockServices = (): MockServices => ({
  prisma: {
    client: {
      food: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  },
  redis: {
    getJson: vi.fn(),
    setJson: vi.fn(),
  },
  usda: createMockUsdaService(),
  off: createMockOffService(),
});

export const mockNormalizeUsdaSearch = (data?: Record<string, unknown>) => {
  vi.spyOn(foodNormalizer, "normalizeUsdaSearch").mockImplementation(() =>
    createNormalizedUsdaSearch(data),
  );
};

export const mockNormalizeOffProduct = (data?: Record<string, unknown>) => {
  vi.spyOn(foodNormalizer, "normalizeOffProduct").mockImplementation(() =>
    createNormalizedOffProduct(data),
  );
};

export const mockNormalizeOffProductAsNull = () => {
  vi.spyOn(foodNormalizer, "normalizeOffProduct").mockReturnValue(null);
};

export const mockNormalizeOffProductConditional = (predicate: (product: OffProduct) => boolean) => {
  vi.spyOn(foodNormalizer, "normalizeOffProduct").mockImplementation((product: OffProduct) =>
    predicate(product) ? createNormalizedOffProduct({ source: FoodSource.OFF }) : null,
  );
};

export const mockNormalizeUsdaDetail = (data?: Record<string, unknown>) => {
  vi.spyOn(foodNormalizer, "normalizeUsdaDetail").mockImplementation(() =>
    createNormalizedUsdaDetail(data),
  );
};
