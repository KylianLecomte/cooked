import { createFoodLogSchema } from "src/diary/dto/create-food-log.dto";
import { GlobalZodValidationPipe } from "./zod-validation.pipe";

describe("ZodValidationPipe", () => {
  it("should be defined", () => {
    expect(new GlobalZodValidationPipe(createFoodLogSchema)).toBeDefined();
  });
});
