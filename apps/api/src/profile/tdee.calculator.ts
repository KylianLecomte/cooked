import { ActivityLevel, Gender, Goal } from "../../generated/prisma/client";

// ── Paramètres du calculateur ─────────────────────────────────────────────────
export interface TdeeParams {
  birthDate: Date;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface TdeeResult {
  /** Métabolisme de base (Mifflin-St Jeor) en kcal */
  bmrKcal: number;
  /** TDEE = BMR × facteur d'activité */
  tdeeKcal: number;
  /** Objectif calorique = TDEE ± ajustement selon le goal */
  targetKcal: number;
  /** Protéines cibles en grammes */
  targetProteinG: number;
  /** Glucides cibles en grammes */
  targetCarbsG: number;
  /** Lipides cibles en grammes */
  targetFatG: number;
}

// ── Facteurs multiplicateurs par niveau d'activité ────────────────────────────
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2, // Bureau, peu ou pas d'exercice
  LIGHTLY_ACTIVE: 1.375, // Exercice léger 1–3 j/sem
  MODERATELY_ACTIVE: 1.55, // Exercice modéré 3–5 j/sem
  VERY_ACTIVE: 1.725, // Exercice intense 6–7 j/sem
  EXTRA_ACTIVE: 1.9, // Très intense ou travail physique
};

// ── Ajustement calorique selon l'objectif ─────────────────────────────────────
const GOAL_KCAL_DELTA: Record<Goal, number> = {
  LOSE_WEIGHT: -500, // Déficit de 500 kcal ≈ perte de 0.5 kg/semaine
  MAINTAIN: 0,
  GAIN_MUSCLE: +300, // Surplus modéré pour la prise de masse
};

// ── Répartition des macros selon l'objectif (en % des kcal) ──────────────────
const MACRO_SPLITS: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  LOSE_WEIGHT: { protein: 0.35, carbs: 0.35, fat: 0.3 },
  MAINTAIN: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  GAIN_MUSCLE: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

// ── Densité calorique par macronutriment (kcal/g) ─────────────────────────────
const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARBS = 4;
const KCAL_PER_G_FAT = 9;

// ── Calcul de l'âge depuis la date de naissance ───────────────────────────────
function getAgeYears(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

// ── Formule de Mifflin-St Jeor ────────────────────────────────────────────────
//
// Hommes : BMR = 10 × poids(kg) + 6.25 × taille(cm) - 5 × âge + 5
// Femmes : BMR = 10 × poids(kg) + 6.25 × taille(cm) - 5 × âge - 161
// Autre  : Moyenne des deux (estimation neutre)
function calculateBmr(params: TdeeParams): number {
  const { gender, heightCm, weightKg, birthDate } = params;
  const age = getAgeYears(birthDate);

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === Gender.MALE) return base + 5;
  if (gender === Gender.FEMALE) return base - 161;
  // Gender.OTHER : moyenne des deux formules
  return base - 78;
}

// ── Fonction principale ───────────────────────────────────────────────────────
export function calculateTdee(params: TdeeParams): TdeeResult {
  const bmrKcal = Math.round(calculateBmr(params));
  const tdeeKcal = Math.round(bmrKcal * ACTIVITY_MULTIPLIERS[params.activityLevel]);
  const targetKcal = Math.max(1200, tdeeKcal + GOAL_KCAL_DELTA[params.goal]);

  const split = MACRO_SPLITS[params.goal];
  const targetProteinG = Math.round((targetKcal * split.protein) / KCAL_PER_G_PROTEIN);
  const targetCarbsG = Math.round((targetKcal * split.carbs) / KCAL_PER_G_CARBS);
  const targetFatG = Math.round((targetKcal * split.fat) / KCAL_PER_G_FAT);

  return { bmrKcal, tdeeKcal, targetKcal, targetProteinG, targetCarbsG, targetFatG };
}
