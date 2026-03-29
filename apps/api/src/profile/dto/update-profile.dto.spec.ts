import { ActivityLevel, Gender, Goal } from "@cooked/shared";
import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "./update-profile.schema";

describe("updateProfileSchema", () => {
  describe("valid input", () => {
    it("should accept an empty object (all fields optional)", () => {
      expect(updateProfileSchema.safeParse({}).success).toBe(true);
    });

    it("should accept all fields provided", () => {
      expect(
        updateProfileSchema.safeParse({
          birthDate: "1990-06-15",
          gender: Gender.MALE,
          heightCm: 180,
          weightKg: 75,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE,
          goal: Goal.MAINTAIN,
        }).success,
      ).toBe(true);
    });
  });

  describe("birthDate", () => {
    it("should coerce an ISO date string to a Date object", () => {
      const result = updateProfileSchema.safeParse({ birthDate: "1990-06-15" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.birthDate).toBeInstanceOf(Date);
      }
    });

    it("should reject a birthDate in the future", () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(
        updateProfileSchema.safeParse({ birthDate: future.toISOString().split("T")[0] }).success,
      ).toBe(false);
    });

    it("should reject a birthDate before 1900-01-01", () => {
      expect(updateProfileSchema.safeParse({ birthDate: "1899-12-31" }).success).toBe(false);
    });

    it("should reject an invalid date string", () => {
      expect(updateProfileSchema.safeParse({ birthDate: "not-a-date" }).success).toBe(false);
    });
  });

  describe("gender", () => {
    it.each(Object.values(Gender))("should accept valid gender value '%s'", (value) => {
      expect(updateProfileSchema.safeParse({ gender: value }).success).toBe(true);
    });

    it("should reject an invalid gender value", () => {
      expect(updateProfileSchema.safeParse({ gender: "INVALID" }).success).toBe(false);
    });
  });

  describe("heightCm", () => {
    it("should accept boundary values (50 and 280)", () => {
      expect(updateProfileSchema.safeParse({ heightCm: 50 }).success).toBe(true);
      expect(updateProfileSchema.safeParse({ heightCm: 280 }).success).toBe(true);
    });

    it("should reject heightCm below 50", () => {
      expect(updateProfileSchema.safeParse({ heightCm: 49 }).success).toBe(false);
    });

    it("should reject heightCm above 280", () => {
      expect(updateProfileSchema.safeParse({ heightCm: 281 }).success).toBe(false);
    });
  });

  describe("weightKg", () => {
    it("should accept boundary values (20 and 500)", () => {
      expect(updateProfileSchema.safeParse({ weightKg: 20 }).success).toBe(true);
      expect(updateProfileSchema.safeParse({ weightKg: 500 }).success).toBe(true);
    });

    it("should reject weightKg below 20", () => {
      expect(updateProfileSchema.safeParse({ weightKg: 19 }).success).toBe(false);
    });

    it("should reject weightKg above 500", () => {
      expect(updateProfileSchema.safeParse({ weightKg: 501 }).success).toBe(false);
    });
  });

  describe("activityLevel", () => {
    it.each(
      Object.values(ActivityLevel),
    )("should accept valid activityLevel value '%s'", (value) => {
      expect(updateProfileSchema.safeParse({ activityLevel: value }).success).toBe(true);
    });

    it("should reject an invalid activityLevel value", () => {
      expect(updateProfileSchema.safeParse({ activityLevel: "INVALID" }).success).toBe(false);
    });
  });

  describe("goal", () => {
    it.each(Object.values(Goal))("should accept valid goal value '%s'", (value) => {
      expect(updateProfileSchema.safeParse({ goal: value }).success).toBe(true);
    });

    it("should reject an invalid goal value", () => {
      expect(updateProfileSchema.safeParse({ goal: "INVALID" }).success).toBe(false);
    });
  });
});
