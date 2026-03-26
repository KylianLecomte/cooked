import { createEmptySummary } from "@cooked/shared";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { ERROR_DIARY_ENTRY_NOT_FOUND, ERROR_FOOD_LOG_NOT_OWNED } from "../util/diary.constant";
import { DiaryService } from "./diary.service";

// ── Fixtures ────────────────────────────────────────────────────────────────

const USER_ID = "user_1";
const OTHER_USER_ID = "user_2";
const DATE_STR = "2026-03-25";
const DATE_OBJ = new Date(DATE_STR);

const makeFoodLog = (overrides: Record<string, unknown> = {}) => ({
  id: "log_1",
  diaryEntryId: "entry_1",
  foodId: "food_1",
  meal: "BREAKFAST",
  quantity: 200,
  food: {
    id: "food_1",
    name: "Poulet",
    kcalPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
  },
  ...overrides,
});

const makeDiaryEntry = (foodLogs = [makeFoodLog()]) => ({
  id: "entry_1",
  userId: USER_ID,
  date: DATE_OBJ,
  foodLogs,
});

// ── Mock Prisma ─────────────────────────────────────────────────────────────

const mockPrismaClient = {
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

const mockPrismaService = { client: mockPrismaClient };

// ── Tests ───────────────────────────────────────────────────────────────────

describe("DiaryService", () => {
  let service: DiaryService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [DiaryService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get(DiaryService);
  });

  // ── findByDate ──────────────────────────────────────────────────────────

  describe("findByDate", () => {
    it("retourne un résumé vide quand aucun diary entry n'existe", async () => {
      mockPrismaClient.diaryEntry.findUnique.mockResolvedValue(null);

      const result = await service.findByDate(USER_ID, DATE_STR);

      expect(result).toEqual({
        id: null,
        date: DATE_OBJ,
        foodLogs: [],
        ...createEmptySummary(),
      });

      expect(mockPrismaClient.diaryEntry.findUnique).toHaveBeenCalledWith({
        where: { userId_date: { userId: USER_ID, date: DATE_OBJ } },
        include: { foodLogs: { include: { food: true } } },
      });
    });

    it("retourne les foodLogs avec les macros calculées", async () => {
      mockPrismaClient.diaryEntry.findUnique.mockResolvedValue(makeDiaryEntry());

      const result = await service.findByDate(USER_ID, DATE_STR);

      // 200g de poulet : 165 * 2 = 330 kcal, 31 * 2 = 62 protein, 0 carbs, 3.6 * 2 = 7.2 ≈ 7 fat
      expect(result.macrosTotals.calories).toBe(Math.round(165 * 2));
      expect(result.macrosTotals.protein).toBe(Math.round(31 * 2));
      expect(result.macrosTotals.carbs).toBe(0);
      expect(result.macrosTotals.fat).toBe(Math.round(3.6 * 2));
    });

    it("répartit les macros par repas", async () => {
      const foodLogs = [
        makeFoodLog({ id: "log_1", meal: "BREAKFAST", quantity: 100 }),
        makeFoodLog({ id: "log_2", meal: "LUNCH", quantity: 200 }),
      ];
      mockPrismaClient.diaryEntry.findUnique.mockResolvedValue(makeDiaryEntry(foodLogs));

      const result = await service.findByDate(USER_ID, DATE_STR);

      expect(result.macrosByMeal.BREAKFAST.calories).toBe(Math.round(165));
      expect(result.macrosByMeal.LUNCH.calories).toBe(Math.round(165 * 2));
      expect(result.macrosByMeal.DINNER.calories).toBe(0);
      expect(result.macrosByMeal.SNACK.calories).toBe(0);
    });
  });

  // ── createFoodLog ───────────────────────────────────────────────────────

  describe("createFoodLog", () => {
    const dto = { foodId: "food_1", meal: "BREAKFAST" as const, quantity: 150 };

    it("upsert le diary entry puis crée le food log", async () => {
      mockPrismaClient.diaryEntry.upsert.mockResolvedValue({ id: "entry_1" });
      mockPrismaClient.foodLog.create.mockResolvedValue(makeFoodLog());

      await service.createFoodLog(USER_ID, DATE_STR, dto);

      expect(mockPrismaClient.diaryEntry.upsert).toHaveBeenCalledWith({
        where: { userId_date: { userId: USER_ID, date: DATE_OBJ } },
        create: { userId: USER_ID, date: DATE_OBJ },
        update: {},
      });

      expect(mockPrismaClient.foodLog.create).toHaveBeenCalledWith({
        data: { diaryEntryId: "entry_1", ...dto },
        include: { food: true },
      });
    });
  });

  // ── updateFoodLog ─────────────────────────────────────────────────────

  describe("updateFoodLog", () => {
    const dto = { quantity: 300 };

    it("met à jour le food log si le user en est propriétaire", async () => {
      mockPrismaClient.foodLog.findUnique.mockResolvedValue({
        ...makeFoodLog(),
        diaryEntry: { userId: USER_ID },
      });
      mockPrismaClient.foodLog.update.mockResolvedValue(makeFoodLog({ quantity: 300 }));

      const result = await service.updateFoodLog(USER_ID, "log_1", dto);

      expect(mockPrismaClient.foodLog.update).toHaveBeenCalledWith({
        where: { id: "log_1" },
        data: dto,
        include: { food: true },
      });
      expect(result.quantity).toBe(300);
    });

    it("throw NotFoundException si le log n'existe pas", async () => {
      mockPrismaClient.foodLog.findUnique.mockResolvedValue(null);

      await expect(service.updateFoodLog(USER_ID, "inexistant", dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateFoodLog(USER_ID, "inexistant", dto)).rejects.toThrow(
        ERROR_DIARY_ENTRY_NOT_FOUND,
      );
    });

    it("throw ForbiddenException si le log appartient à un autre user", async () => {
      mockPrismaClient.foodLog.findUnique.mockResolvedValue({
        ...makeFoodLog(),
        diaryEntry: { userId: OTHER_USER_ID },
      });

      await expect(service.updateFoodLog(USER_ID, "log_1", dto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.updateFoodLog(USER_ID, "log_1", dto)).rejects.toThrow(
        ERROR_FOOD_LOG_NOT_OWNED,
      );
    });
  });

  // ── deleteFoodLog ─────────────────────────────────────────────────────

  describe("deleteFoodLog", () => {
    it("supprime le food log si le user en est propriétaire", async () => {
      const logWithoutFood = { id: "log_1", foodId: "food_1", meal: "BREAKFAST", quantity: 200 };
      mockPrismaClient.foodLog.findUnique.mockResolvedValue({
        ...makeFoodLog(),
        diaryEntry: { userId: USER_ID },
      });
      mockPrismaClient.foodLog.delete.mockResolvedValue(logWithoutFood);

      const result = await service.deleteFoodLog(USER_ID, "log_1");

      expect(mockPrismaClient.foodLog.delete).toHaveBeenCalledWith({ where: { id: "log_1" } });
      expect(result).toEqual(logWithoutFood);
    });

    it("throw NotFoundException si le log n'existe pas", async () => {
      mockPrismaClient.foodLog.findUnique.mockResolvedValue(null);

      await expect(service.deleteFoodLog(USER_ID, "inexistant")).rejects.toThrow(NotFoundException);
    });

    it("throw ForbiddenException si le log appartient à un autre user", async () => {
      mockPrismaClient.foodLog.findUnique.mockResolvedValue({
        ...makeFoodLog(),
        diaryEntry: { userId: OTHER_USER_ID },
      });

      await expect(service.deleteFoodLog(USER_ID, "log_1")).rejects.toThrow(ForbiddenException);
    });
  });
});
