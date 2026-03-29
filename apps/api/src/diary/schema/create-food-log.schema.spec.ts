import { Meal } from "@cooked/shared";
import { describe, expect, it } from "vitest";
import { createFoodLogSchema } from "./create-food-log.schema";

const VALID_INPUT = {
  foodId: "b0a8c2d4-b239-47b6-b276-14afffc872c9",
  meal: Meal.BREAKFAST,
  quantity: 150,
};

describe("createFoodLogSchema", () => {
  describe("valid input", () => {
    it("should accept a valid payload", () => {
      expect(createFoodLogSchema.safeParse(VALID_INPUT).success).toBe(true);
    });

    it("should accept quantity = 0 (boundary)", () => {
      expect(createFoodLogSchema.safeParse({ ...VALID_INPUT, quantity: 0 }).success).toBe(true);
    });
  });

  describe("foodId", () => {
    it("should reject an invalid UUID", () => {
      expect(createFoodLogSchema.safeParse({ ...VALID_INPUT, foodId: "not-a-uuid" }).success).toBe(
        false,
      );
    });

    it("should reject a missing foodId", () => {
      const { foodId: _, ...rest } = VALID_INPUT;
      expect(createFoodLogSchema.safeParse(rest).success).toBe(false);
    });
  });

  describe("meal", () => {
    it("should reject an invalid meal value", () => {
      expect(createFoodLogSchema.safeParse({ ...VALID_INPUT, meal: "INVALID_MEAL" }).success).toBe(
        false,
      );
    });

    it("should reject a missing meal", () => {
      const { meal: _, ...rest } = VALID_INPUT;
      expect(createFoodLogSchema.safeParse(rest).success).toBe(false);
    });
  });

  describe("quantity", () => {
    it("should reject a negative quantity", () => {
      expect(createFoodLogSchema.safeParse({ ...VALID_INPUT, quantity: -1 }).success).toBe(false);
    });

    it("should reject a missing quantity", () => {
      const { quantity: _, ...rest } = VALID_INPUT;
      expect(createFoodLogSchema.safeParse(rest).success).toBe(false);
    });
  });

  describe("strict mode", () => {
    it("should reject unknown extra fields", () => {
      expect(createFoodLogSchema.safeParse({ ...VALID_INPUT, unknownField: "value" }).success).toBe(
        false,
      );
    });
  });
});
