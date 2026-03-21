import {
  ACTIVITY_MULTIPLIERS,
  type ActivityLevel,
  Gender,
  type Goal,
  GOAL_KCAL_DELTA,
  MACRO_SPLITS,
} from "@cooked/shared";

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
