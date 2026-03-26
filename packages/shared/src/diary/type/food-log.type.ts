import { Food } from "../../food/type/food.type";
import { Meal } from "./meal.type";

export interface FoodLog {
  id: string;
  quantity: number;
  meal: Meal;
  food: Food;
  foodId: string;
}

export interface FoodLogWithoutFood extends Omit<FoodLog, "food"> {}
