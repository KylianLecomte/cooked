import { TypesValuesOf } from "../../type/generics.type";

// ── Food Source ─────────────────────────────────────────────────────────────
export const FoodSource = { USDA: "USDA", OFF: "OFF", MANUAL: "MANUAL" } as const;
export type FoodSource = TypesValuesOf<typeof FoodSource>;
export const FOOD_SOURCES = Object.values(FoodSource);

// ── Food Category ───────────────────────────────────────────────────────────
export const FoodCategory = {
  PROTEIN: "PROTEIN",
  STARCH: "STARCH",
  VEGETABLE: "VEGETABLE",
  FRUIT: "FRUIT",
  DAIRY: "DAIRY",
  FAT_OIL: "FAT_OIL",
  OTHER: "OTHER",
} as const;
export type FoodCategory = TypesValuesOf<typeof FoodCategory>;
export const FOOD_CATEGORIES = Object.values(FoodCategory);

export interface Food {
  id: string;
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}
