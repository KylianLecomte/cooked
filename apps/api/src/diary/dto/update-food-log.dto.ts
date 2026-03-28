import { createZodDto } from "src/zod/util/zod.util";
import z from "zod";
import { createFoodLogSchema } from "./create-food-log.dto";

export const updateFoodLogSchema = createFoodLogSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateFoodLog = z.infer<typeof updateFoodLogSchema>;

export class UpdateFoodLogDto extends createZodDto(updateFoodLogSchema) {}
