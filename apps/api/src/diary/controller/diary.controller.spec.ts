import { Meal } from "@cooked/shared";
import { Test } from "@nestjs/testing";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { SESSION, TEST_USER_ID } from "../../auth/fixture/auth.fixture";
import { DiaryService } from "../service/diary.service";
import { DiaryController } from "./diary.controller";

const mockDiaryService = {
  findByDate: vi.fn(),
  createFoodLog: vi.fn(),
  updateFoodLog: vi.fn(),
  deleteFoodLog: vi.fn(),
};

describe("DiaryController", () => {
  const DATE = "2026-03-25";

  let controller: DiaryController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [DiaryController],
      providers: [{ provide: DiaryService, useValue: mockDiaryService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(DiaryController);
  });

  describe("findByDate", () => {
    it("should extract userId from session and delegate to diaryService", async () => {
      mockDiaryService.findByDate.mockResolvedValue({ id: "entry_1" });

      const result = await controller.findByDate(SESSION, DATE);

      expect(mockDiaryService.findByDate).toHaveBeenCalledWith(TEST_USER_ID, DATE);
      expect(result).toEqual({ id: "entry_1" });
    });
  });

  describe("createFoodLog", () => {
    it("should extract userId from session and delegate to diaryService with date and dto", async () => {
      const dto = { foodId: "food_1", meal: Meal.BREAKFAST, quantity: 150 };
      mockDiaryService.createFoodLog.mockResolvedValue({ id: "log_1" });

      const result = await controller.createFoodLog(SESSION, DATE, dto);

      expect(mockDiaryService.createFoodLog).toHaveBeenCalledWith(TEST_USER_ID, DATE, dto);
      expect(result).toEqual({ id: "log_1" });
    });
  });

  describe("updateFoodLog", () => {
    it("should extract userId from session and delegate to diaryService with logId and dto", async () => {
      const dto = { quantity: 300 };
      mockDiaryService.updateFoodLog.mockResolvedValue({ id: "log_1" });

      const result = await controller.updateFoodLog(SESSION, "log_1", dto);

      expect(mockDiaryService.updateFoodLog).toHaveBeenCalledWith(TEST_USER_ID, "log_1", dto);
      expect(result).toEqual({ id: "log_1" });
    });
  });

  describe("deleteFoodLog", () => {
    it("should extract userId from session and delegate to diaryService with logId", async () => {
      mockDiaryService.deleteFoodLog.mockResolvedValue({ id: "log_1" });

      const result = await controller.deleteFoodLog(SESSION, "log_1");

      expect(mockDiaryService.deleteFoodLog).toHaveBeenCalledWith(TEST_USER_ID, "log_1");
      expect(result).toEqual({ id: "log_1" });
    });
  });
});
