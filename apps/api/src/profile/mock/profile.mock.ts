import { vi } from "vitest";

// ── Test Data ────────────────────────────────────────────────────────────────

export const VALID_PROFILE_DTO = {
  birthDate: "1996-01-01",
  gender: "MALE",
  heightCm: 180,
  weightKg: 80,
  activityLevel: "MODERATELY_ACTIVE",
  goal: "MAINTAIN",
};

export const createMockProfile = (overrides?: Record<string, unknown>) => ({
  id: "profile_001",
  userId: "test_user_1",
  birthDate: new Date("1996-01-01"),
  gender: "MALE",
  heightCm: 180,
  weightKg: 80,
  activityLevel: "MODERATELY_ACTIVE",
  goal: "MAINTAIN",
  bmrKcal: null,
  tdeeKcal: 2790,
  targetKcal: 2790,
  targetProteinG: 209,
  targetCarbsG: 279,
  targetFatG: 93,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createPartialMockProfile = (overrides?: Record<string, unknown>) => ({
  id: "profile_001",
  userId: "test_user_1",
  birthDate: new Date("1996-01-01"),
  gender: "MALE",
  heightCm: 180,
  weightKg: null,
  activityLevel: null,
  goal: null,
  tdeeKcal: null,
  targetKcal: null,
  targetProteinG: null,
  targetCarbsG: null,
  targetFatG: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ── Mock Services ────────────────────────────────────────────────────────────

export interface MockProfileServices {
  prisma: {
    client: {
      profile: {
        findUnique: ReturnType<typeof vi.fn>;
        upsert: ReturnType<typeof vi.fn>;
      };
    };
  };
}

export const createMockProfileServices = (): MockProfileServices => ({
  prisma: {
    client: {
      profile: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
    },
  },
});
