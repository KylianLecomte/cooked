import { FoodWithSource } from "../../food/type/food.type";
import { Meal } from "./meal.type";

export interface FoodLog {
  id: string;
  foodId: string;
  quantity: number;
  meal: Meal;
  food: FoodWithSource;
}

export interface FoodLogWithoutFood extends Omit<FoodLog, "food"> {}
