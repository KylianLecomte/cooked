import z from "zod";
import { createFoodLogSchema } from "./create-food-log.schema";

export const updateFoodLogSchema = createFoodLogSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateFoodLog = z.infer<typeof updateFoodLogSchema>;
