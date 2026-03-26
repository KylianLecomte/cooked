export const ERROR_FOOD_LOG_NOT_OWNED =
  "Vous n'avez pas la permission de modifier ce journal alimentaire";
export const ERROR_DIARY_ENTRY_NOT_FOUND = "Le journal alimentaire que vous cherchez n'existe pas";

// Constants for tests
export const mockPrismaClient = {
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
};

export const mockPrismaService = { client: mockPrismaClient };
