import { PrismaService } from "src/prisma/prisma.service";
import { FoodCategory, FoodSource } from "../../../generated/prisma/client";

interface SeedFoodOptions {
  source?: FoodSource;
  sourceId?: string;
  name?: string;
  brand?: string | null;
  category?: FoodCategory;
  kcalPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  withMicronutrients?: boolean;
}

export async function seedFood(prisma: PrismaService, options: SeedFoodOptions = {}) {
  const {
    source = FoodSource.OFF,
    sourceId = "off_123",
    name = "Chicken Breast",
    brand = "PDO",
    category = FoodCategory.PROTEIN,
    kcalPer100g = 165,
    proteinPer100g = 31,
    carbsPer100g = 0,
    fatPer100g = 3.6,
    fiberPer100g = 0,
    withMicronutrients = false,
  } = options;

  const baseData = {
    source,
    sourceId,
    name,
    brand,
    category,
    kcalPer100g,
    proteinPer100g,
    carbsPer100g,
    fatPer100g,
    fiberPer100g,
  };

  if (withMicronutrients) {
    return prisma.client.food.create({
      data: {
        ...baseData,
        vitA: 0,
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
      },
    });
  }

  return prisma.client.food.create({
    data: baseData,
  });
}

export async function seedMultipleFoods(prisma: PrismaService, count = 3) {
  const foods = [];
  for (let i = 0; i < count; i++) {
    const food = await seedFood(prisma, {
      sourceId: `off_${i}`,
      name: `Food ${i}`,
      kcalPer100g: 100 + i * 10,
    });
    foods.push(food);
  }
  return foods;
}

export async function seedUsdaFood(prisma: PrismaService, options: SeedFoodOptions = {}) {
  return seedFood(prisma, {
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
    ...options,
  });
}
