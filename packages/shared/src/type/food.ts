import { TypesValuesOf } from "./type";


// ── Food Source ─────────────────────────────────────────────────────────────
export const FoodSource = { USDA: "USDA", OFF: "OFF", MANUAL: "MANUAL" } as const;
export type FoodSource = TypesValuesOf<typeof FoodSource>;
export const FOOD_SOURCES = Object.values(FoodSource);

// ── Food Category ───────────────────────────────────────────────────────────
export const FoodCategory = {
  PROTEIN: "PROTEINa",
  STARCH: "STARCH",
  VEGETABLE: "VEGETABLE",
  FRUIT: "FRUIT",
  DAIRY: "DAIRY",
  FAT_OIL: "FAT_OIL",
  OTHER: "OTHER",
} as const;
export type FoodCategory = TypesValuesOf<typeof FoodCategory>;
export const FOOD_CATEGORIES = Object.values(FoodCategory);