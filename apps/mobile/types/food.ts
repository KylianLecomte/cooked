// Types Food côté mobile — miroir du modèle Prisma Food du backend

export type FoodSource = "USDA" | "OFF" | "MANUAL";

export type FoodCategory =
  | "PROTEIN"
  | "STARCH"
  | "VEGETABLE"
  | "FRUIT"
  | "DAIRY"
  | "FAT_OIL"
  | "OTHER";

/** Résumé léger — retourné par GET /api/foods/search et /api/foods/barcode/:code */
export interface FoodSummary {
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
}

/** Détail complet — retourné par GET /api/foods/:id */
export interface FoodDetail extends FoodSummary {
  // Vitamines (per 100g)
  vitA: number | null; // µg RAE
  vitB1: number | null; // mg
  vitB2: number | null; // mg
  vitB3: number | null; // mg
  vitB5: number | null; // mg
  vitB6: number | null; // mg
  vitB9: number | null; // µg folate
  vitB12: number | null; // µg
  vitC: number | null; // mg
  vitD: number | null; // µg
  vitE: number | null; // mg
  vitK: number | null; // µg
  // Minéraux (per 100g)
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
  // true = données micro fiables (fetch USDA complet effectué)
  microDataComplete: boolean;
}

/** Macros recalculées pour une quantité donnée en grammes */
export interface MacrosForQuantity {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
}

export function calcMacros(food: FoodSummary, quantityG: number): MacrosForQuantity {
  const factor = quantityG / 100;
  return {
    kcal: Math.round(food.kcalPer100g * factor),
    protein: Math.round(food.proteinPer100g * factor * 10) / 10,
    carbs: Math.round(food.carbsPer100g * factor * 10) / 10,
    fat: Math.round(food.fatPer100g * factor * 10) / 10,
    fiber: food.fiberPer100g != null ? Math.round(food.fiberPer100g * factor * 10) / 10 : null,
  };
}

/** Labels lisibles pour les catégories */
export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  PROTEIN: "Protéines",
  STARCH: "Féculents",
  VEGETABLE: "Légumes",
  FRUIT: "Fruits",
  DAIRY: "Laitiers",
  FAT_OIL: "Matières grasses",
  OTHER: "Autre",
};

/** Labels lisibles pour les sources */
export const SOURCE_LABELS: Record<FoodSource, string> = {
  USDA: "USDA",
  OFF: "Open Food Facts",
  MANUAL: "Manuel",
};
