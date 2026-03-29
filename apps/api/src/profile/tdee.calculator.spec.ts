import { describe, expect, it } from "vitest";
import { calculateTdee, type TdeeParams } from "./tdee.calculator";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

const BASE_PARAMS: TdeeParams = {
  birthDate: new Date("1996-01-01"),
  gender: "MALE",
  heightCm: 180,
  weightKg: 80,
  activityLevel: "SEDENTARY",
  goal: "MAINTAIN",
};

function expectedBmr(gender: "MALE" | "FEMALE" | "OTHER", age: number): number {
  const base = 10 * BASE_PARAMS.weightKg + 6.25 * BASE_PARAMS.heightCm - 5 * age;
  if (gender === "MALE") return Math.round(base + 5);
  if (gender === "FEMALE") return Math.round(base - 161);
  return Math.round(base - 78);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("calculateTdee", () => {
  const age = getAge(BASE_PARAMS.birthDate);

  describe("BMR calculation (Mifflin-St Jeor)", () => {
    it("should calculate correct BMR for MALE", () => {
      const result = calculateTdee({ ...BASE_PARAMS, gender: "MALE" });
      expect(result.bmrKcal).toBe(expectedBmr("MALE", age));
    });

    it("should calculate correct BMR for FEMALE", () => {
      const result = calculateTdee({ ...BASE_PARAMS, gender: "FEMALE" });
      expect(result.bmrKcal).toBe(expectedBmr("FEMALE", age));
    });

    it("should calculate correct BMR for OTHER (average of male/female)", () => {
      const result = calculateTdee({ ...BASE_PARAMS, gender: "OTHER" });
      expect(result.bmrKcal).toBe(expectedBmr("OTHER", age));
    });
  });

  describe("TDEE calculation (BMR × activity multiplier)", () => {
    it("should apply SEDENTARY multiplier (1.2)", () => {
      const result = calculateTdee({ ...BASE_PARAMS, activityLevel: "SEDENTARY" });
      expect(result.tdeeKcal).toBe(Math.round(result.bmrKcal * 1.2));
    });

    it("should apply LIGHTLY_ACTIVE multiplier (1.375)", () => {
      const result = calculateTdee({ ...BASE_PARAMS, activityLevel: "LIGHTLY_ACTIVE" });
      expect(result.tdeeKcal).toBe(Math.round(result.bmrKcal * 1.375));
    });

    it("should apply VERY_ACTIVE multiplier (1.725)", () => {
      const result = calculateTdee({ ...BASE_PARAMS, activityLevel: "VERY_ACTIVE" });
      expect(result.tdeeKcal).toBe(Math.round(result.bmrKcal * 1.725));
    });
  });

  describe("target kcal (TDEE ± goal delta)", () => {
    it("should subtract 500 kcal for LOSE_WEIGHT", () => {
      const result = calculateTdee({ ...BASE_PARAMS, goal: "LOSE_WEIGHT" });
      expect(result.targetKcal).toBe(result.tdeeKcal - 500);
    });

    it("should keep TDEE for MAINTAIN", () => {
      const result = calculateTdee({ ...BASE_PARAMS, goal: "MAINTAIN" });
      expect(result.targetKcal).toBe(result.tdeeKcal);
    });

    it("should add 300 kcal for GAIN_MUSCLE", () => {
      const result = calculateTdee({ ...BASE_PARAMS, goal: "GAIN_MUSCLE" });
      expect(result.targetKcal).toBe(result.tdeeKcal + 300);
    });

    it("should enforce minimum 1200 kcal floor", () => {
      const result = calculateTdee({
        birthDate: new Date("1996-01-01"),
        gender: "FEMALE",
        heightCm: 150,
        weightKg: 40,
        activityLevel: "SEDENTARY",
        goal: "LOSE_WEIGHT",
      });
      expect(result.targetKcal).toBe(1200);
    });
  });

  describe("macro targets", () => {
    it("should calculate MAINTAIN macros (30% P, 40% C, 30% F)", () => {
      const result = calculateTdee({ ...BASE_PARAMS, goal: "MAINTAIN" });

      expect(result.targetProteinG).toBe(Math.round((result.targetKcal * 0.3) / 4));
      expect(result.targetCarbsG).toBe(Math.round((result.targetKcal * 0.4) / 4));
      expect(result.targetFatG).toBe(Math.round((result.targetKcal * 0.3) / 9));
    });

    it("should calculate LOSE_WEIGHT macros (35% P, 35% C, 30% F)", () => {
      const result = calculateTdee({ ...BASE_PARAMS, goal: "LOSE_WEIGHT" });

      expect(result.targetProteinG).toBe(Math.round((result.targetKcal * 0.35) / 4));
      expect(result.targetCarbsG).toBe(Math.round((result.targetKcal * 0.35) / 4));
      expect(result.targetFatG).toBe(Math.round((result.targetKcal * 0.3) / 9));
    });

    it("should calculate GAIN_MUSCLE macros (30% P, 45% C, 25% F)", () => {
      const result = calculateTdee({ ...BASE_PARAMS, goal: "GAIN_MUSCLE" });

      expect(result.targetProteinG).toBe(Math.round((result.targetKcal * 0.3) / 4));
      expect(result.targetCarbsG).toBe(Math.round((result.targetKcal * 0.45) / 4));
      expect(result.targetFatG).toBe(Math.round((result.targetKcal * 0.25) / 9));
    });
  });

  describe("age calculation — birthday not yet reached this year", () => {
    it("should subtract a year when the birth month is later than current month", () => {
      // Today is March — a December birthday hasn't occurred yet this year
      const birthDate = new Date("1990-12-15");
      const expectedAge = new Date().getFullYear() - 1990 - 1;
      const result = calculateTdee({ ...BASE_PARAMS, birthDate, gender: "MALE" });
      const expectedBmrValue = Math.round(
        10 * BASE_PARAMS.weightKg + 6.25 * BASE_PARAMS.heightCm - 5 * expectedAge + 5,
      );
      expect(result.bmrKcal).toBe(expectedBmrValue);
    });

    it("should subtract a year when same month but day is later in the month", () => {
      const today = new Date();
      // Same month as today, but day = 28th of next month → use a day later than today in the same month
      // We craft a birthdate: same month as today, but day = today.getDate() + 1 (if possible)
      const birthMonth = String(today.getMonth() + 1).padStart(2, "0");
      const birthDay = String(Math.min(today.getDate() + 1, 28)).padStart(2, "0");
      const birthDate = new Date(`1990-${birthMonth}-${birthDay}`);
      // Only run this assertion if birthDay is actually after today (avoids edge case on day 28+)
      if (birthDate.getDate() > today.getDate()) {
        const expectedAge = today.getFullYear() - 1990 - 1;
        const result = calculateTdee({ ...BASE_PARAMS, birthDate, gender: "MALE" });
        const expectedBmrValue = Math.round(
          10 * BASE_PARAMS.weightKg + 6.25 * BASE_PARAMS.heightCm - 5 * expectedAge + 5,
        );
        expect(result.bmrKcal).toBe(expectedBmrValue);
      } else {
        // If we can't craft a valid future-in-month date (today is last day), just verify it doesn't throw
        expect(() => calculateTdee({ ...BASE_PARAMS, birthDate, gender: "MALE" })).not.toThrow();
      }
    });
  });

  describe("result structure", () => {
    it("should return all expected fields", () => {
      const result = calculateTdee(BASE_PARAMS);

      expect(result).toHaveProperty("bmrKcal");
      expect(result).toHaveProperty("tdeeKcal");
      expect(result).toHaveProperty("targetKcal");
      expect(result).toHaveProperty("targetProteinG");
      expect(result).toHaveProperty("targetCarbsG");
      expect(result).toHaveProperty("targetFatG");
    });

    it("should return integer values for all fields", () => {
      const result = calculateTdee(BASE_PARAMS);

      expect(Number.isInteger(result.bmrKcal)).toBe(true);
      expect(Number.isInteger(result.tdeeKcal)).toBe(true);
      expect(Number.isInteger(result.targetKcal)).toBe(true);
      expect(Number.isInteger(result.targetProteinG)).toBe(true);
      expect(Number.isInteger(result.targetCarbsG)).toBe(true);
      expect(Number.isInteger(result.targetFatG)).toBe(true);
    });
  });
});
