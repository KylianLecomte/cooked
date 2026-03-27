import { Meal } from "@cooked/shared";
import { Test } from "@nestjs/testing";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { SESSION, TEST_USER_ID } from "../../auth/fixture/auth.fixture";
import { DiaryService } from "../service/diary.service";
import { DiaryController } from "./diary.controller";

// ── Mock DiaryService ───────────────────────────────────────────────────────

const _mockDiaryService = {
  findByDate: vi.fn(),
  createFoodLog: vi.fn(),
  updateFoodLog: vi.fn(),
  deleteFoodLog: vi.fn(),
};

describe("DiaryController", () => {
  const _DATE = "2026-03-25";

  let controller: DiaryController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [DiaryController],
      providers: [{ provide: DiaryService, useValue: _mockDiaryService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(DiaryController);
  });

  it("findByDate should call diaryService.findByDate", async () => {
    _mockDiaryService.findByDate.mockResolvedValue({ id: "entry_1" });
    const result = await controller.findByDate(SESSION, _DATE);

    expect(_mockDiaryService.findByDate).toHaveBeenCalledWith(TEST_USER_ID, _DATE);
    expect(result).toEqual({ id: "entry_1" });
  });

  it("createFoodLog should call diaryService.createFoodLog", async () => {
    const dto = { foodId: "food_1", meal: Meal.BREAKFAST, quantity: 150 };
    _mockDiaryService.createFoodLog.mockResolvedValue({ id: "log_1" });

    const result = await controller.createFoodLog(SESSION, _DATE, dto);

    expect(_mockDiaryService.createFoodLog).toHaveBeenCalledWith(TEST_USER_ID, _DATE, dto);
    expect(result).toEqual({ id: "log_1" });
  });

  it("updateFoodLog should call diaryService.updateFoodLog", async () => {
    const dto = { quantity: 300 };
    _mockDiaryService.updateFoodLog.mockResolvedValue({ id: "log_1" });

    const result = await controller.updateFoodLog(SESSION, "log_1", dto);

    expect(_mockDiaryService.updateFoodLog).toHaveBeenCalledWith(TEST_USER_ID, "log_1", dto);
    expect(result).toEqual({ id: "log_1" });
  });

  it("deleteFoodLog should call diaryService.updateFoodLog", async () => {
    _mockDiaryService.deleteFoodLog.mockResolvedValue({ id: "log_1" });

    const result = await controller.deleteFoodLog(SESSION, "log_1");

    expect(_mockDiaryService.deleteFoodLog).toHaveBeenCalledWith(TEST_USER_ID, "log_1");
    expect(result).toEqual({ id: "log_1" });
  });
});
