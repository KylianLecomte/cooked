import { createZodDto } from "src/zod/util/zod.util";
import { updateFoodLogSchema } from "../schema/update-food-log.schema";

export class UpdateFoodLogDto extends createZodDto(updateFoodLogSchema) {}
