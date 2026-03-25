import { Test } from "@nestjs/testing";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { BetterAuthSession } from "../../type/auth.type";
import { DiaryService } from "../service/diary.service";
import { DiaryController } from "./diary.controller";

// ── Mock DiaryService ───────────────────────────────────────────────────────

const mockDiaryService = {
  findByDate: vi.fn(),
  createFoodLog: vi.fn(),
  updateFoodLog: vi.fn(),
  deleteFoodLog: vi.fn(),
};

const SESSION = {
  user: {
    id: "user_1",
    createdAt: new Date(),
    updatedAt: new Date(),
    email: "test@test.com",
    emailVerified: true,
    name: "Test User",
    image: null,
  },
} satisfies BetterAuthSession;

// ── Tests ───────────────────────────────────────────────────────────────────

describe("DiaryController", () => {
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

  it("findByDate délègue au service avec userId et date", async () => {
    mockDiaryService.findByDate.mockResolvedValue({ id: "entry_1" });

    const result = await controller.findByDate(SESSION, "2026-03-25");

    expect(mockDiaryService.findByDate).toHaveBeenCalledWith("user_1", "2026-03-25");
    expect(result).toEqual({ id: "entry_1" });
  });

  it("createFoodLog délègue au service avec userId, date et dto", async () => {
    const dto = { foodId: "food_1", meal: "BREAKFAST" as const, quantity: 150 };
    mockDiaryService.createFoodLog.mockResolvedValue({ id: "log_1" });

    const result = await controller.createFoodLog(SESSION, "2026-03-25", dto);

    expect(mockDiaryService.createFoodLog).toHaveBeenCalledWith("user_1", "2026-03-25", dto);
    expect(result).toEqual({ id: "log_1" });
  });

  it("updateFoodLog délègue au service avec userId, logId et dto", async () => {
    const dto = { quantity: 300 };
    mockDiaryService.updateFoodLog.mockResolvedValue({ id: "log_1" });

    const result = await controller.updateFoodLog(SESSION, "log_1", dto);

    expect(mockDiaryService.updateFoodLog).toHaveBeenCalledWith("user_1", "log_1", dto);
    expect(result).toEqual({ id: "log_1" });
  });

  it("deleteFoodLog délègue au service avec userId et logId", async () => {
    mockDiaryService.deleteFoodLog.mockResolvedValue({ id: "log_1" });

    const result = await controller.deleteFoodLog(SESSION, "log_1");

    expect(mockDiaryService.deleteFoodLog).toHaveBeenCalledWith("user_1", "log_1");
    expect(result).toEqual({ id: "log_1" });
  });
});
