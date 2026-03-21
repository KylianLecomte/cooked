// ── Types internes pour les réponses des APIs externes ───────────────────────

// USDA FoodData Central — réponse d'un aliment dans une recherche
export interface UsdaSearchFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  foodCategory?: string;
  foodNutrients: Array<{
    nutrientId: number;
    value: number;
  }>;
}

// USDA FoodData Central — réponse détaillée d'un aliment (GET /food/:fdcId)
export interface UsdaFoodDetail {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  foodCategory?: string;
  foodNutrients: Array<{
    nutrient: { id: number; name: string; unitName: string };
    amount: number;
  }>;
}

// Open Food Facts — produit
export interface OffProduct {
  code: string;
  product_name?: string;
  brands?: string;
  pnns_groups_1?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    // Quelques micros quand disponibles
    vitamin_a_100g?: number;
    vitamin_c_100g?: number;
    vitamin_d_100g?: number;
    vitamin_e_100g?: number;
    vitamin_k_100g?: number;
    calcium_100g?: number;
    iron_100g?: number;
    magnesium_100g?: number;
    potassium_100g?: number;
    zinc_100g?: number;
    phosphorus_100g?: number;
    sodium_100g?: number;
  };
}

// ── USDA nutrient IDs (per 100g) ─────────────────────────────────────────────

export const USDA_NUTRIENT_IDS = {
  ENERGY: 1008,
  PROTEIN: 1003,
  CARBS: 1005,
  FAT: 1004,
  FIBER: 1079,
  VIT_A: 1106, // µg RAE
  VIT_B1: 1165, // mg
  VIT_B2: 1166, // mg
  VIT_B3: 1167, // mg
  VIT_B5: 1170, // mg
  VIT_B6: 1175, // mg
  VIT_B9: 1177, // µg folate total
  VIT_B12: 1178, // µg
  VIT_C: 1162, // mg
  VIT_D: 1114, // µg
  VIT_E: 1109, // mg
  VIT_K: 1185, // µg phylloquinone
  CALCIUM: 1087, // mg
  IRON: 1089, // mg
  MAGNESIUM: 1090, // mg
  POTASSIUM: 1092, // mg
  ZINC: 1095, // mg
  PHOSPHORUS: 1091, // mg
  SELENIUM: 1103, // µg
  SODIUM: 1093, // mg
  COPPER: 1098, // mg
  MANGANESE: 1101, // mg
} as const;
