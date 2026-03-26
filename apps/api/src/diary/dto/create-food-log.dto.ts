import { Meal } from "@cooked/shared";
import z from "zod";

export const createFoodLogSchema = z
  .object({
    foodId: z.uuid("ID de nourriture invalide"),
    meal: z.enum(Meal),
    quantity: z
      .number()
      .min(0, "La quantité doit être un nombre positif")
      .max(Number.MAX_SAFE_INTEGER, "La quantité est trop grande"),
  })
  .strict();

export type CreateFoodLogDto = z.infer<typeof createFoodLogSchema>;
