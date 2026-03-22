import { createFoodLogSchema } from "src/diary/dto/create-food-log.dto";
import { ZodValidationPipe } from "./zod-validation.pipe";

describe("ZodValidationPipe", () => {
  it("should be defined", () => {
    expect(new ZodValidationPipe(createFoodLogSchema)).toBeDefined();
  });
});
