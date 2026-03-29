import { Meal } from "@cooked/shared";
import { describe, expect, it } from "vitest";
import { updateFoodLogSchema } from "./update-food-log.schema";

describe("updateFoodLogSchema", () => {
  describe("valid input", () => {
    it("should accept a payload with only quantity", () => {
      expect(updateFoodLogSchema.safeParse({ quantity: 200 }).success).toBe(true);
    });

    it("should accept a payload with only meal", () => {
      expect(updateFoodLogSchema.safeParse({ meal: Meal.BREAKFAST }).success).toBe(true);
    });

    it("should accept a payload with only foodId", () => {
      expect(
        updateFoodLogSchema.safeParse({ foodId: "b0a8c2d4-b239-47b6-b276-14afffc872c9" }).success,
      ).toBe(true);
    });

    it("should accept all fields provided together", () => {
      expect(
        updateFoodLogSchema.safeParse({
          foodId: "b0a8c2d4-b239-47b6-b276-14afffc872c9",
          meal: Meal.BREAKFAST,
          quantity: 100,
        }).success,
      ).toBe(true);
    });
  });

  describe("refine — at least one field required", () => {
    it("should reject an empty object", () => {
      const result = updateFoodLogSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("field validation still applies on partial", () => {
    it("should reject an invalid meal value", () => {
      expect(updateFoodLogSchema.safeParse({ meal: "INVALID" }).success).toBe(false);
    });

    it("should reject a negative quantity", () => {
      expect(updateFoodLogSchema.safeParse({ quantity: -1 }).success).toBe(false);
    });

    it("should reject an invalid foodId UUID", () => {
      expect(updateFoodLogSchema.safeParse({ foodId: "not-a-uuid" }).success).toBe(false);
    });
  });
});
