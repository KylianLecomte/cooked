import { describe, expect, it } from "vitest";
import { FoodCategory, FoodSource } from "../../generated/prisma/client";
import { normalizeOffProduct, normalizeUsdaDetail, normalizeUsdaSearch } from "./food.normalizer";
import type { OffProduct, UsdaFoodDetail, UsdaSearchFood } from "./food.type";
import { USDA_NUTRIENT_IDS } from "./food.type";

function makeSearchFood(
  overrides: Partial<UsdaSearchFood> = {},
  nutrients: Record<number, number> = {},
): UsdaSearchFood {
  return {
    fdcId: 1,
    description: "Test Food",
    foodNutrients: Object.entries(nutrients).map(([id, value]) => ({
      nutrientId: Number(id),
      value,
    })),
    ...overrides,
  };
}

function makeDetailFood(
  overrides: Partial<UsdaFoodDetail> = {},
  nutrients: Record<number, number> = {},
): UsdaFoodDetail {
  return {
    fdcId: 1,
    description: "Test Food",
    foodNutrients: Object.entries(nutrients).map(([id, amount]) => ({
      nutrient: { id: Number(id), name: "", unitName: "" },
      amount,
    })),
    ...overrides,
  };
}

function makeOffProduct(overrides: Partial<OffProduct> = {}): OffProduct {
  return {
    code: "1234567890",
    product_name: "Test Product",
    nutriments: { "energy-kcal_100g": 100 },
    ...overrides,
  };
}

const ALL_MACROS: Record<number, number> = {
  [USDA_NUTRIENT_IDS.ENERGY]: 165,
  [USDA_NUTRIENT_IDS.PROTEIN]: 31,
  [USDA_NUTRIENT_IDS.CARBS]: 0.5,
  [USDA_NUTRIENT_IDS.FAT]: 3.6,
  [USDA_NUTRIENT_IDS.FIBER]: 1.2,
};

describe("normalizeUsdaSearch", () => {
  describe("macros and energy", () => {
    it("should map all nutrients correctly when present", () => {
      const result = normalizeUsdaSearch(makeSearchFood({}, ALL_MACROS));

      expect(result.kcalPer100g).toBe(165);
      expect(result.proteinPer100g).toBe(31);
      expect(result.carbsPer100g).toBe(0.5);
      expect(result.fatPer100g).toBe(3.6);
      expect(result.fiberPer100g).toBe(1.2);
    });

    it("should default macros (kcal, protein, carbs, fat) to 0 when missing", () => {
      const result = normalizeUsdaSearch(makeSearchFood());

      expect(result.kcalPer100g).toBe(0);
      expect(result.proteinPer100g).toBe(0);
      expect(result.carbsPer100g).toBe(0);
      expect(result.fatPer100g).toBe(0);
    });

    it("should return null for fiber when missing", () => {
      const result = normalizeUsdaSearch(makeSearchFood());

      expect(result.fiberPer100g).toBeNull();
    });
  });

  describe("metadata", () => {
    it("should set source to USDA and convert fdcId to string", () => {
      const result = normalizeUsdaSearch(makeSearchFood({ fdcId: 98765 }));

      expect(result.source).toBe(FoodSource.USDA);
      expect(result.sourceId).toBe("98765");
    });

    it("should set microDataComplete to false", () => {
      const result = normalizeUsdaSearch(makeSearchFood());

      expect(result.microDataComplete).toBe(false);
    });

    it("should use brandOwner when both brandOwner and brandName are present", () => {
      const result = normalizeUsdaSearch(
        makeSearchFood({ brandOwner: "Owner Corp", brandName: "BrandName" }),
      );

      expect(result.brand).toBe("Owner Corp");
    });

    it("should fall back to brandName when brandOwner is absent", () => {
      const result = normalizeUsdaSearch(makeSearchFood({ brandName: "BrandName" }));

      expect(result.brand).toBe("BrandName");
    });

    it("should set brand to null when neither brandOwner nor brandName is present", () => {
      const result = normalizeUsdaSearch(makeSearchFood());

      expect(result.brand).toBeNull();
    });
  });

  describe("category mapping", () => {
    it.each([
      ["Beef Products", FoodCategory.PROTEIN],
      ["Pork Products", FoodCategory.PROTEIN],
      ["Poultry Products", FoodCategory.PROTEIN],
      ["Finfish and Shellfish Products", FoodCategory.PROTEIN],
      ["Lamb, Veal, and Game Products", FoodCategory.PROTEIN],
      ["Legumes and Legume Products", FoodCategory.PROTEIN],
      ["Sausages and Luncheon Meats", FoodCategory.PROTEIN],
      ["Cereal Grains and Pasta", FoodCategory.STARCH],
      ["Baked Products", FoodCategory.STARCH],
      ["Vegetables and Vegetable Products", FoodCategory.VEGETABLE],
      ["Fruits and Fruit Juices", FoodCategory.FRUIT],
      ["Dairy and Egg Products", FoodCategory.DAIRY],
      ["Fats and Oils", FoodCategory.FAT_OIL],
      ["Nut and Seed Products", FoodCategory.FAT_OIL],
    ])("should map '%s' → %s", (rawCategory, expected) => {
      const result = normalizeUsdaSearch(makeSearchFood({ foodCategory: rawCategory }));

      expect(result.category).toBe(expected);
    });

    it("should match case-insensitively", () => {
      const result = normalizeUsdaSearch(makeSearchFood({ foodCategory: "beef products" }));

      expect(result.category).toBe(FoodCategory.PROTEIN);
    });

    it("should match when category string contains the key as substring", () => {
      const result = normalizeUsdaSearch(
        makeSearchFood({ foodCategory: "Some Brand — Poultry Products" }),
      );

      expect(result.category).toBe(FoodCategory.PROTEIN);
    });

    it("should return OTHER for an unknown category", () => {
      const result = normalizeUsdaSearch(makeSearchFood({ foodCategory: "Space Food" }));

      expect(result.category).toBe(FoodCategory.OTHER);
    });

    it("should return OTHER when foodCategory is undefined", () => {
      const result = normalizeUsdaSearch(makeSearchFood());

      expect(result.category).toBe(FoodCategory.OTHER);
    });
  });
});

describe("normalizeUsdaDetail", () => {
  describe("macros and energy", () => {
    it("should map all macros correctly", () => {
      const result = normalizeUsdaDetail(makeDetailFood({}, ALL_MACROS));

      expect(result.kcalPer100g).toBe(165);
      expect(result.proteinPer100g).toBe(31);
      expect(result.carbsPer100g).toBe(0.5);
      expect(result.fatPer100g).toBe(3.6);
      expect(result.fiberPer100g).toBe(1.2);
    });

    it("should default macros to 0 when missing", () => {
      const result = normalizeUsdaDetail(makeDetailFood());

      expect(result.kcalPer100g).toBe(0);
      expect(result.proteinPer100g).toBe(0);
      expect(result.carbsPer100g).toBe(0);
      expect(result.fatPer100g).toBe(0);
    });
  });

  describe("micronutrients", () => {
    it("should map all micronutrients correctly", () => {
      const micros: Record<number, number> = {
        [USDA_NUTRIENT_IDS.VIT_A]: 12,
        [USDA_NUTRIENT_IDS.VIT_B1]: 0.1,
        [USDA_NUTRIENT_IDS.VIT_B2]: 0.2,
        [USDA_NUTRIENT_IDS.VIT_B3]: 3.5,
        [USDA_NUTRIENT_IDS.VIT_B5]: 0.5,
        [USDA_NUTRIENT_IDS.VIT_B6]: 0.4,
        [USDA_NUTRIENT_IDS.VIT_B9]: 20,
        [USDA_NUTRIENT_IDS.VIT_B12]: 1.2,
        [USDA_NUTRIENT_IDS.VIT_C]: 50,
        [USDA_NUTRIENT_IDS.VIT_D]: 2.5,
        [USDA_NUTRIENT_IDS.VIT_E]: 1.1,
        [USDA_NUTRIENT_IDS.VIT_K]: 7,
        [USDA_NUTRIENT_IDS.CALCIUM]: 120,
        [USDA_NUTRIENT_IDS.IRON]: 2.1,
        [USDA_NUTRIENT_IDS.MAGNESIUM]: 30,
        [USDA_NUTRIENT_IDS.POTASSIUM]: 300,
        [USDA_NUTRIENT_IDS.ZINC]: 0.8,
        [USDA_NUTRIENT_IDS.PHOSPHORUS]: 90,
        [USDA_NUTRIENT_IDS.SELENIUM]: 15,
        [USDA_NUTRIENT_IDS.SODIUM]: 5,
        [USDA_NUTRIENT_IDS.COPPER]: 0.06,
        [USDA_NUTRIENT_IDS.MANGANESE]: 0.3,
      };
      const result = normalizeUsdaDetail(makeDetailFood({}, micros));

      expect(result.vitA).toBe(12);
      expect(result.vitB1).toBe(0.1);
      expect(result.vitB2).toBe(0.2);
      expect(result.vitB3).toBe(3.5);
      expect(result.vitB5).toBe(0.5);
      expect(result.vitB6).toBe(0.4);
      expect(result.vitB9).toBe(20);
      expect(result.vitB12).toBe(1.2);
      expect(result.vitC).toBe(50);
      expect(result.vitD).toBe(2.5);
      expect(result.vitE).toBe(1.1);
      expect(result.vitK).toBe(7);
      expect(result.calcium).toBe(120);
      expect(result.iron).toBe(2.1);
      expect(result.magnesium).toBe(30);
      expect(result.potassium).toBe(300);
      expect(result.zinc).toBe(0.8);
      expect(result.phosphorus).toBe(90);
      expect(result.selenium).toBe(15);
      expect(result.sodium).toBe(5);
      expect(result.copper).toBe(0.06);
      expect(result.manganese).toBe(0.3);
    });

    it("should return null for all micronutrients when absent", () => {
      const result = normalizeUsdaDetail(makeDetailFood());

      expect(result.vitA).toBeNull();
      expect(result.vitB1).toBeNull();
      expect(result.vitC).toBeNull();
      expect(result.vitD).toBeNull();
      expect(result.calcium).toBeNull();
      expect(result.iron).toBeNull();
      expect(result.selenium).toBeNull();
      expect(result.sodium).toBeNull();
      expect(result.copper).toBeNull();
      expect(result.manganese).toBeNull();
    });
  });

  describe("metadata", () => {
    it("should set microDataComplete to true", () => {
      const result = normalizeUsdaDetail(makeDetailFood());

      expect(result.microDataComplete).toBe(true);
    });

    it("should set source to USDA and convert fdcId to string", () => {
      const result = normalizeUsdaDetail(makeDetailFood({ fdcId: 42 }));

      expect(result.source).toBe(FoodSource.USDA);
      expect(result.sourceId).toBe("42");
    });

    it("should use brandOwner when both brandOwner and brandName are present", () => {
      const result = normalizeUsdaDetail(
        makeDetailFood({ brandOwner: "Owner Corp", brandName: "BrandName" }),
      );

      expect(result.brand).toBe("Owner Corp");
    });

    it("should fall back to brandName when brandOwner is absent", () => {
      const result = normalizeUsdaDetail(makeDetailFood({ brandName: "BrandName" }));

      expect(result.brand).toBe("BrandName");
    });

    it("should set brand to null when neither brandOwner nor brandName is present", () => {
      const result = normalizeUsdaDetail(makeDetailFood());

      expect(result.brand).toBeNull();
    });
  });

  describe("category mapping", () => {
    // Same engine as normalizeUsdaSearch — spot-check a few
    it("should map 'Dairy and Egg Products' → DAIRY", () => {
      const result = normalizeUsdaDetail(
        makeDetailFood({ foodCategory: "Dairy and Egg Products" }),
      );

      expect(result.category).toBe(FoodCategory.DAIRY);
    });

    it("should return OTHER when foodCategory is undefined", () => {
      const result = normalizeUsdaDetail(makeDetailFood());

      expect(result.category).toBe(FoodCategory.OTHER);
    });
  });
});

describe("normalizeOffProduct", () => {
  describe("null cases (unusable products)", () => {
    it("should return null when product_name is missing", () => {
      const product = makeOffProduct({ product_name: undefined });

      expect(normalizeOffProduct(product)).toBeNull();
    });

    it("should return null when product_name is empty string", () => {
      const product = makeOffProduct({ product_name: "" });

      expect(normalizeOffProduct(product)).toBeNull();
    });

    it("should return null when kcal (energy-kcal_100g) is missing", () => {
      const product = makeOffProduct({ nutriments: {} });

      expect(normalizeOffProduct(product)).toBeNull();
    });

    it("should return null when nutriments is undefined", () => {
      const product = makeOffProduct({ nutriments: undefined });

      expect(normalizeOffProduct(product)).toBeNull();
    });
  });

  describe("macros and energy", () => {
    it("should map all provided macro nutrients correctly", () => {
      const product = makeOffProduct({
        nutriments: {
          "energy-kcal_100g": 240,
          proteins_100g: 15,
          carbohydrates_100g: 20,
          fat_100g: 10,
          fiber_100g: 2,
        },
      });
      const result = normalizeOffProduct(product);

      expect(result?.kcalPer100g).toBe(240);
      expect(result?.proteinPer100g).toBe(15);
      expect(result?.carbsPer100g).toBe(20);
      expect(result?.fatPer100g).toBe(10);
      expect(result?.fiberPer100g).toBe(2);
    });

    it("should default protein, carbs, fat to 0 when absent", () => {
      const product = makeOffProduct({ nutriments: { "energy-kcal_100g": 100 } });
      const result = normalizeOffProduct(product);

      expect(result?.proteinPer100g).toBe(0);
      expect(result?.carbsPer100g).toBe(0);
      expect(result?.fatPer100g).toBe(0);
    });

    it("should return null for fiber when absent", () => {
      const product = makeOffProduct({ nutriments: { "energy-kcal_100g": 100 } });
      const result = normalizeOffProduct(product);

      expect(result?.fiberPer100g).toBeNull();
    });
  });

  describe("minerals — conversion g/100g → mg (×1000)", () => {
    const MINERAL_CASES: [
      nutrimentKey: string,
      resultKey: string,
      inputG: number,
      expectedMg: number,
    ][] = [
      ["calcium_100g", "calcium", 0.1, 100],
      ["iron_100g", "iron", 0.002, 2],
      ["magnesium_100g", "magnesium", 0.05, 50],
      ["potassium_100g", "potassium", 0.3, 300],
      ["zinc_100g", "zinc", 0.001, 1],
      ["phosphorus_100g", "phosphorus", 0.08, 80],
      ["sodium_100g", "sodium", 0.5, 500],
    ];

    it.each(
      MINERAL_CASES,
    )("should convert %s from g to mg (%d → %d)", (nutrimentKey, resultKey, input, expected) => {
      const product = makeOffProduct({
        nutriments: { "energy-kcal_100g": 100, [nutrimentKey]: input },
      });
      const result = normalizeOffProduct(product) as Record<string, unknown>;

      expect(result?.[resultKey]).toBe(expected);
    });

    it("should return 0 mg when mineral value is 0 g (not null)", () => {
      const product = makeOffProduct({
        nutriments: { "energy-kcal_100g": 100, calcium_100g: 0 },
      });
      const result = normalizeOffProduct(product);

      expect(result?.calcium).toBe(0);
    });

    it("should return null for minerals when absent", () => {
      const product = makeOffProduct({ nutriments: { "energy-kcal_100g": 100 } });
      const result = normalizeOffProduct(product);

      expect(result?.calcium).toBeNull();
      expect(result?.iron).toBeNull();
      expect(result?.sodium).toBeNull();
    });
  });

  describe("vitamins — no unit conversion", () => {
    it("should keep vitamin values as-is (no conversion)", () => {
      const product = makeOffProduct({
        nutriments: {
          "energy-kcal_100g": 100,
          vitamin_a_100g: 12,
          vitamin_c_100g: 50,
          vitamin_d_100g: 2.5,
          vitamin_e_100g: 1.1,
          vitamin_k_100g: 7,
        },
      });
      const result = normalizeOffProduct(product);

      expect(result?.vitA).toBe(12);
      expect(result?.vitC).toBe(50);
      expect(result?.vitD).toBe(2.5);
      expect(result?.vitE).toBe(1.1);
      expect(result?.vitK).toBe(7);
    });

    it("should return null for vitamins when absent", () => {
      const product = makeOffProduct({ nutriments: { "energy-kcal_100g": 100 } });
      const result = normalizeOffProduct(product);

      expect(result?.vitA).toBeNull();
      expect(result?.vitC).toBeNull();
      expect(result?.vitD).toBeNull();
    });
  });

  describe("metadata", () => {
    it("should set source to OFF and microDataComplete to false", () => {
      const result = normalizeOffProduct(makeOffProduct({ code: "9876543210" }));

      expect(result?.source).toBe(FoodSource.OFF);
      expect(result?.sourceId).toBe("9876543210");
      expect(result?.microDataComplete).toBe(false);
    });

    it("should set brand from brands field", () => {
      const result = normalizeOffProduct(makeOffProduct({ brands: "Nestlé" }));

      expect(result?.brand).toBe("Nestlé");
    });

    it("should set brand to null when brands is undefined", () => {
      const result = normalizeOffProduct(makeOffProduct({ brands: undefined }));

      expect(result?.brand).toBeNull();
    });
  });

  describe("category mapping via pnns_groups_1 (exact match)", () => {
    it.each([
      ["Cereals and potatoes", FoodCategory.STARCH],
      ["Vegetables", FoodCategory.VEGETABLE],
      ["Fruits", FoodCategory.FRUIT],
      ["Milk and dairy products", FoodCategory.DAIRY],
      ["Meat", FoodCategory.PROTEIN],
      ["Fish and seafood", FoodCategory.PROTEIN],
      ["Legumes", FoodCategory.PROTEIN],
      ["Eggs", FoodCategory.PROTEIN],
      ["Fats and sauces", FoodCategory.FAT_OIL],
    ])("should map '%s' → %s", (pnns, expected) => {
      const result = normalizeOffProduct(makeOffProduct({ pnns_groups_1: pnns }));

      expect(result?.category).toBe(expected);
    });

    it("should return OTHER for unknown pnns_groups_1", () => {
      const result = normalizeOffProduct(makeOffProduct({ pnns_groups_1: "Unknown group" }));

      expect(result?.category).toBe(FoodCategory.OTHER);
    });

    it("should return OTHER when pnns_groups_1 is undefined", () => {
      const result = normalizeOffProduct(makeOffProduct({ pnns_groups_1: undefined }));

      expect(result?.category).toBe(FoodCategory.OTHER);
    });

    it("should NOT match case-insensitively (exact key lookup)", () => {
      // Unlike USDA, OFF uses exact map lookup — wrong case → OTHER
      const result = normalizeOffProduct(makeOffProduct({ pnns_groups_1: "vegetables" }));

      expect(result?.category).toBe(FoodCategory.OTHER);
    });
  });
});
