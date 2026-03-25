import { FoodLog } from "./food-log.type";
import { Meal } from "./meal.type";

export interface MacrosSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DiaryEntryResponse {
  id: string | null;
  date: Date;
  logs: FoodLog[];
  macrosTotals: MacrosSummary;
  macrosByMeal: Record<Meal, MacrosSummary>;
}
