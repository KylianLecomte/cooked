import type { Prisma } from "../../generated/prisma/client";
import { FoodCategory, FoodSource } from "../../generated/prisma/client";
import {
  USDA_NUTRIENT_IDS,
  type OffProduct,
  type UsdaFoodDetail,
  type UsdaSearchFood,
} from "./food.types";

// ── USDA category → FoodCategory ─────────────────────────────────────────────

const USDA_CATEGORY_MAP: Record<string, FoodCategory> = {
  "Beef Products": FoodCategory.PROTEIN,
  "Pork Products": FoodCategory.PROTEIN,
  "Poultry Products": FoodCategory.PROTEIN,
  "Finfish and Shellfish Products": FoodCategory.PROTEIN,
  "Lamb, Veal, and Game Products": FoodCategory.PROTEIN,
  "Legumes and Legume Products": FoodCategory.PROTEIN,
  "Sausages and Luncheon Meats": FoodCategory.PROTEIN,
  "Cereal Grains and Pasta": FoodCategory.STARCH,
  "Baked Products": FoodCategory.STARCH,
  "Vegetables and Vegetable Products": FoodCategory.VEGETABLE,
  "Fruits and Fruit Juices": FoodCategory.FRUIT,
  "Dairy and Egg Products": FoodCategory.DAIRY,
  "Fats and Oils": FoodCategory.FAT_OIL,
  "Nut and Seed Products": FoodCategory.FAT_OIL,
};

function mapUsdaCategory(raw?: string): FoodCategory {
  if (!raw) return FoodCategory.OTHER;
  for (const [key, value] of Object.entries(USDA_CATEGORY_MAP)) {
    if (raw.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return FoodCategory.OTHER;
}

// ── OFF pnns_groups_1 → FoodCategory ─────────────────────────────────────────

const OFF_PNNS_MAP: Record<string, FoodCategory> = {
  "Cereals and potatoes": FoodCategory.STARCH,
  Vegetables: FoodCategory.VEGETABLE,
  Fruits: FoodCategory.FRUIT,
  "Milk and dairy products": FoodCategory.DAIRY,
  Meat: FoodCategory.PROTEIN,
  "Fish and seafood": FoodCategory.PROTEIN,
  Legumes: FoodCategory.PROTEIN,
  Eggs: FoodCategory.PROTEIN,
  "Fats and sauces": FoodCategory.FAT_OIL,
};

function mapOffCategory(pnns?: string): FoodCategory {
  if (!pnns) return FoodCategory.OTHER;
  return OFF_PNNS_MAP[pnns] ?? FoodCategory.OTHER;
}

// ── Helpers nutrient extraction ───────────────────────────────────────────────

function getSearchNutrient(
  nutrients: UsdaSearchFood["foodNutrients"],
  id: number,
): number | null {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? null;
}

function getDetailNutrient(
  nutrients: UsdaFoodDetail["foodNutrients"],
  id: number,
): number | null {
  return nutrients.find((n) => n.nutrient.id === id)?.amount ?? null;
}

// ── Normalizers ───────────────────────────────────────────────────────────────

/** Transforme un résultat de recherche USDA en données Food (sans micros complets) */
export function normalizeUsdaSearch(
  food: UsdaSearchFood,
): Prisma.FoodCreateInput {
  const n = food.foodNutrients;
  const kcal = getSearchNutrient(n, USDA_NUTRIENT_IDS.ENERGY) ?? 0;
  const protein = getSearchNutrient(n, USDA_NUTRIENT_IDS.PROTEIN) ?? 0;
  const carbs = getSearchNutrient(n, USDA_NUTRIENT_IDS.CARBS) ?? 0;
  const fat = getSearchNutrient(n, USDA_NUTRIENT_IDS.FAT) ?? 0;

  return {
    source: FoodSource.USDA,
    sourceId: String(food.fdcId),
    name: food.description,
    brand: food.brandOwner ?? food.brandName ?? null,
    category: mapUsdaCategory(food.foodCategory),
    kcalPer100g: kcal,
    proteinPer100g: protein,
    carbsPer100g: carbs,
    fatPer100g: fat,
    fiberPer100g: getSearchNutrient(n, USDA_NUTRIENT_IDS.FIBER),
    microDataComplete: false,
  };
}

/** Transforme un détail USDA complet en données Food (avec tous les micros) */
export function normalizeUsdaDetail(
  food: UsdaFoodDetail,
): Prisma.FoodCreateInput {
  const n = food.foodNutrients;
  const get = (id: number) => getDetailNutrient(n, id);

  return {
    source: FoodSource.USDA,
    sourceId: String(food.fdcId),
    name: food.description,
    brand: food.brandOwner ?? food.brandName ?? null,
    category: mapUsdaCategory(food.foodCategory),
    kcalPer100g: get(USDA_NUTRIENT_IDS.ENERGY) ?? 0,
    proteinPer100g: get(USDA_NUTRIENT_IDS.PROTEIN) ?? 0,
    carbsPer100g: get(USDA_NUTRIENT_IDS.CARBS) ?? 0,
    fatPer100g: get(USDA_NUTRIENT_IDS.FAT) ?? 0,
    fiberPer100g: get(USDA_NUTRIENT_IDS.FIBER),
    vitA: get(USDA_NUTRIENT_IDS.VIT_A),
    vitB1: get(USDA_NUTRIENT_IDS.VIT_B1),
    vitB2: get(USDA_NUTRIENT_IDS.VIT_B2),
    vitB3: get(USDA_NUTRIENT_IDS.VIT_B3),
    vitB5: get(USDA_NUTRIENT_IDS.VIT_B5),
    vitB6: get(USDA_NUTRIENT_IDS.VIT_B6),
    vitB9: get(USDA_NUTRIENT_IDS.VIT_B9),
    vitB12: get(USDA_NUTRIENT_IDS.VIT_B12),
    vitC: get(USDA_NUTRIENT_IDS.VIT_C),
    vitD: get(USDA_NUTRIENT_IDS.VIT_D),
    vitE: get(USDA_NUTRIENT_IDS.VIT_E),
    vitK: get(USDA_NUTRIENT_IDS.VIT_K),
    calcium: get(USDA_NUTRIENT_IDS.CALCIUM),
    iron: get(USDA_NUTRIENT_IDS.IRON),
    magnesium: get(USDA_NUTRIENT_IDS.MAGNESIUM),
    potassium: get(USDA_NUTRIENT_IDS.POTASSIUM),
    zinc: get(USDA_NUTRIENT_IDS.ZINC),
    phosphorus: get(USDA_NUTRIENT_IDS.PHOSPHORUS),
    selenium: get(USDA_NUTRIENT_IDS.SELENIUM),
    sodium: get(USDA_NUTRIENT_IDS.SODIUM),
    copper: get(USDA_NUTRIENT_IDS.COPPER),
    manganese: get(USDA_NUTRIENT_IDS.MANGANESE),
    microDataComplete: true,
  };
}

/** OFF stocke les minéraux en g/100g — convertit en mg */
function gToMg(v: number | undefined): number | null {
  return v == null ? null : v * 1000;
}

/** Transforme un produit Open Food Facts en données Food */
export function normalizeOffProduct(
  product: OffProduct,
): Prisma.FoodCreateInput | null {
  const nm = product.nutriments;
  const kcal = nm?.["energy-kcal_100g"];

  // Produit inutilisable sans les macros de base
  if (!product.product_name || kcal == null) return null;

  return {
    source: FoodSource.OFF,
    sourceId: product.code,
    name: product.product_name,
    brand: product.brands ?? null,
    category: mapOffCategory(product.pnns_groups_1),
    kcalPer100g: kcal,
    proteinPer100g: nm?.proteins_100g ?? 0,
    carbsPer100g: nm?.carbohydrates_100g ?? 0,
    fatPer100g: nm?.fat_100g ?? 0,
    fiberPer100g: nm?.fiber_100g ?? null,
    // OFF fournit rarement les micros — on prend ce qui est disponible.
    // Vitamines : OFF stocke directement en µg (vitA, vitD, vitK) ou mg (vitC, vitE) — pas de conversion.
    // Minéraux : OFF stocke en g/100g → conversion *1000 pour obtenir mg.
    vitA: nm?.vitamin_a_100g ?? null, // µg
    vitC: nm?.vitamin_c_100g ?? null, // mg
    vitD: nm?.vitamin_d_100g ?? null, // µg
    vitE: nm?.vitamin_e_100g ?? null, // mg
    vitK: nm?.vitamin_k_100g ?? null, // µg
    calcium: gToMg(nm?.calcium_100g),
    iron: gToMg(nm?.iron_100g),
    magnesium: gToMg(nm?.magnesium_100g),
    potassium: gToMg(nm?.potassium_100g),
    zinc: gToMg(nm?.zinc_100g),
    phosphorus: gToMg(nm?.phosphorus_100g),
    sodium: gToMg(nm?.sodium_100g),
    microDataComplete: false,
  };
}
