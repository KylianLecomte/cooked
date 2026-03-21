import { TypesValuesOf } from "./type";

export const Meal = {
  BREAKFEAST: "BREAKFEAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
  SNACK: "SNACK",
} as const;
export type Meal = TypesValuesOf<typeof Meal>;
export const MEALS = Object.values(Meal);