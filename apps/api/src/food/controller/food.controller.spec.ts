import { Test } from "@nestjs/testing";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { FoodService } from "../service/food.service";
import { FoodController } from "./food.controller";

const _mockFoodService = {
  search: vi.fn(),
  findByBarcode: vi.fn(),
  findById: vi.fn(),
};

describe("DiaryController", () => {
  const _DATE = "2026-03-25";

  let controller: FoodController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [FoodController],
      providers: [{ provide: FoodService, useValue: _mockFoodService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(FoodController);
  });

  it("search should call foodService.search", async () => {
    const _expectedResult = [{ id: "1" }, { id: "2" }];
    _mockFoodService.search.mockResolvedValue(_expectedResult);
    const result = await controller.search("query   ");

    expect(_mockFoodService.search).toHaveBeenCalledWith("query");
    expect(result).toEqual(_expectedResult);
  });

  it("findByBarcode should call foodService.findByBarcode", async () => {
    const _param = "barcode";
    _mockFoodService.findByBarcode.mockResolvedValue({ id: "log_1" });

    const result = await controller.findByBarcode(_param);

    expect(_mockFoodService.findByBarcode).toHaveBeenCalledWith(_param);
    expect(result).toEqual({ id: "log_1" });
  });

  it("findById should call foodService.findById", async () => {
    const _param = "id";
    _mockFoodService.findById.mockResolvedValue({ id: "log_1" });

    const result = await controller.findById(_param);

    expect(_mockFoodService.findById).toHaveBeenCalledWith(_param);
    expect(result).toEqual({ id: "log_1" });
  });
});
