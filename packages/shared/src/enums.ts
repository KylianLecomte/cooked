// ── Gender ──────────────────────────────────────────────────────────────────
//
// Pattern "const object + type éponyme" :
//   - `Gender` (valeur) = objet runtime → permet Gender.MALE dans le code
//   - `Gender` (type)   = "MALE" | "FEMALE" | "OTHER" → type-safe
//   - `GENDERS` (array) = itérable pour les boucles / selectors UI
//
// C'est le même pattern que Prisma utilise dans ses enums générés.

export const Gender = { MALE: "MALE", FEMALE: "FEMALE", OTHER: "OTHER" } as const;
export type Gender = (typeof Gender)[keyof typeof Gender];
export const GENDERS = Object.values(Gender);

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Homme",
  FEMALE: "Femme",
  OTHER: "Autre",
};

// ── Activity Level ──────────────────────────────────────────────────────────

export const ActivityLevel = {
  SEDENTARY: "SEDENTARY",
  LIGHTLY_ACTIVE: "LIGHTLY_ACTIVE",
  MODERATELY_ACTIVE: "MODERATELY_ACTIVE",
  VERY_ACTIVE: "VERY_ACTIVE",
  EXTRA_ACTIVE: "EXTRA_ACTIVE",
} as const;
export type ActivityLevel = (typeof ActivityLevel)[keyof typeof ActivityLevel];
export const ACTIVITY_LEVELS = Object.values(ActivityLevel);

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: "Sédentaire",
  LIGHTLY_ACTIVE: "Légèrement actif",
  MODERATELY_ACTIVE: "Modérément actif",
  VERY_ACTIVE: "Très actif",
  EXTRA_ACTIVE: "Extrêmement actif",
};

export const ACTIVITY_LEVEL_DETAILS: Record<ActivityLevel, string> = {
  SEDENTARY: "Bureau, peu ou pas d'exercice",
  LIGHTLY_ACTIVE: "Exercice léger 1–3 j/sem",
  MODERATELY_ACTIVE: "Exercice modéré 3–5 j/sem",
  VERY_ACTIVE: "Exercice intense 6–7 j/sem",
  EXTRA_ACTIVE: "Travail physique + sport quotidien",
};

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

// ── Goal ────────────────────────────────────────────────────────────────────

export const Goal = {
  LOSE_WEIGHT: "LOSE_WEIGHT",
  MAINTAIN: "MAINTAIN",
  GAIN_MUSCLE: "GAIN_MUSCLE",
} as const;
export type Goal = (typeof Goal)[keyof typeof Goal];
export const GOALS = Object.values(Goal);

export const GOAL_LABELS: Record<Goal, string> = {
  LOSE_WEIGHT: "Perte de poids",
  MAINTAIN: "Maintien",
  GAIN_MUSCLE: "Prise de muscle",
};

export const GOAL_KCAL_DELTA: Record<Goal, number> = {
  LOSE_WEIGHT: -500,
  MAINTAIN: 0,
  GAIN_MUSCLE: +300,
};

export const MACRO_SPLITS: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  LOSE_WEIGHT: { protein: 0.35, carbs: 0.35, fat: 0.3 },
  MAINTAIN: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  GAIN_MUSCLE: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

// ── Food Source ─────────────────────────────────────────────────────────────

export const FoodSource = { USDA: "USDA", OFF: "OFF", MANUAL: "MANUAL" } as const;
export type FoodSource = (typeof FoodSource)[keyof typeof FoodSource];
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
export type FoodCategory = (typeof FoodCategory)[keyof typeof FoodCategory];
export const FOOD_CATEGORIES = Object.values(FoodCategory);
