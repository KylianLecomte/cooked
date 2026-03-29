import { createZodDto } from "src/zod/util/zod.util";
import { createFoodLogSchema } from "../schema/create-food-log.schema";

export class CreateFoodLogDto extends createZodDto(createFoodLogSchema) {}
