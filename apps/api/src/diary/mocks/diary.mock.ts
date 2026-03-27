import { Meal } from "@cooked/shared";
import { vi } from "vitest";

/**
 * Diary Test Mocks
 * Contains factory functions for diary test data and mock services
 */

// ══════════════════════════════════════════════════════════════════════════════
// Test Data Types
// ══════════════════════════════════════════════════════════════════════════════

interface MockFood {
  id: string;
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface MockFoodLog {
  id: string;
  diaryEntryId: string;
  foodId: string;
  meal: Meal;
  quantity: number;
  food: MockFood;
}

interface MockDiaryEntryOptions {
  userId?: string;
  date?: Date;
  foodLogs?: MockFoodLog[];
}

export const createMockFood = (overrides?: Record<string, unknown>): MockFood => ({
  id: "food_1",
  name: "Poulet",
  kcalPer100g: 165,
  proteinPer100g: 31,
  carbsPer100g: 0,
  fatPer100g: 3.6,
  ...overrides,
});

export const createMockFoodLog = (overrides?: Record<string, unknown>): MockFoodLog => ({
  id: "log_1",
  diaryEntryId: "entry_1",
  foodId: "food_1",
  meal: Meal.BREAKFAST,
  quantity: 200,
  food: createMockFood(),
  ...overrides,
});

export const createMockDiaryEntry = (overrides?: MockDiaryEntryOptions) => {
  const defaults = {
    userId: "user_1",
    date: new Date("2026-03-25"),
    foodLogs: [createMockFoodLog()],
  };

  return {
    id: "entry_1",
    ...defaults,
    ...overrides,
  };
};

export interface MockDiaryServices {
  prisma: {
    client: {
      diaryEntry: {
        findUnique: ReturnType<typeof vi.fn>;
        upsert: ReturnType<typeof vi.fn>;
      };
      foodLog: {
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
      };
    };
  };
}

export const createMockDiaryServices = (): MockDiaryServices => ({
  prisma: {
    client: {
      diaryEntry: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      foodLog: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
      },
    },
  },
});
