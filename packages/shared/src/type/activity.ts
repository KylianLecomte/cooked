import { TypesValuesOf } from "./type";

export const ActivityLevel = {
  SEDENTARY: "SEDENTARY",
  LIGHTLY_ACTIVE: "LIGHTLY_ACTIVE",
  MODERATELY_ACTIVE: "MODERATELY_ACTIVE",
  VERY_ACTIVE: "VERY_ACTIVE",
  EXTRA_ACTIVE: "EXTRA_ACTIVE",
} as const;
export type ActivityLevel = TypesValuesOf<typeof ActivityLevel>;
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