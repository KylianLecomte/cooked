import { createFoodLogSchema } from "src/diary/schema/create-food-log.schema";
import { GlobalZodValidationPipe } from "./zod-validation.pipe";

describe("ZodValidationPipe", () => {
  it("should be defined", () => {
    expect(new GlobalZodValidationPipe(createFoodLogSchema)).toBeDefined();
  });
});
