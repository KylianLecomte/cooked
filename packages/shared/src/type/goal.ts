import { TypesValuesOf } from "./type";

// ── Goal ────────────────────────────────────────────────────────────────────
export const Goal = {
  LOSE_WEIGHT: "LOSE_WEIGHT",
  MAINTAIN: "MAINTAIN",
  GAIN_MUSCLE: "GAIN_MUSCLE",
} as const;
export type Goal = TypesValuesOf<typeof Goal>;
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