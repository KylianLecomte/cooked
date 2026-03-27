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

export interface FoodWithSource {
  id: string;
  source: FoodSource;
  sourceId: string;
  name: string;
  brand: string | null;
  category: FoodCategory;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
  // Vitamines (per 100g, nullable — données souvent partielles)
  vitA: number | null; // µg RAE
  vitB1: number | null; // mg thiamine
  vitB2: number | null; // mg riboflavine
  vitB3: number | null; // mg niacine
  vitB5: number | null; // mg acide pantothénique
  vitB6: number | null; // mg
  vitB9: number | null; // µg folate
  vitB12: number | null; // µg
  vitC: number | null; // mg
  vitD: number | null; // µg
  vitE: number | null; // mg alpha-tocophérol
  vitK: number | null; // µg phylloquinone

  // Minéraux (per 100g, nullable)
  calcium: number | null; // mg
  iron: number | null; // mg
  magnesium: number | null; // mg
  potassium: number | null; // mg
  zinc: number | null; // mg
  phosphorus: number | null; // mg
  selenium: number | null; // µg
  sodium: number | null; // mg
  copper: number | null; // mg
  manganese: number | null; // mg
}

export interface Food extends Omit<FoodWithSource, "source" | "sourceId"> {}

export interface FoodSummary
  extends Pick<
    Food,
    | "id"
    | "name"
    | "brand"
    | "category"
    | "kcalPer100g"
    | "proteinPer100g"
    | "carbsPer100g"
    | "fatPer100g"
    | "fiberPer100g"
  > {}
