import z from "zod";
import { createFoodLogSchema } from "./create-food-log.dto";

export const updateFoodLogSchema = createFoodLogSchema.partial();

export type UpdateFoodLogDto = z.infer<typeof updateFoodLogSchema>;
