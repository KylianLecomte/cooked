import { Test } from "@nestjs/testing";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { FoodService } from "../service/food.service";
import { FoodController } from "./food.controller";

const mockFoodService = {
  search: vi.fn(),
  findByBarcode: vi.fn(),
  findById: vi.fn(),
};

describe("DiaryController", () => {
  let controller: FoodController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [FoodController],
      providers: [{ provide: FoodService, useValue: mockFoodService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(FoodController);
  });

  it("search should call foodService.search", async () => {
    const expectedResult = [{ id: "1" }, { id: "2" }];
    mockFoodService.search.mockResolvedValue(expectedResult);
    const result = await controller.search("query   ");

    expect(mockFoodService.search).toHaveBeenCalledWith("query");
    expect(result).toEqual(expectedResult);
  });

  it("findByBarcode should call foodService.findByBarcode", async () => {
    const param = "barcode";
    mockFoodService.findByBarcode.mockResolvedValue({ id: "log_1" });

    const result = await controller.findByBarcode(param);

    expect(mockFoodService.findByBarcode).toHaveBeenCalledWith(param);
    expect(result).toEqual({ id: "log_1" });
  });

  it("findById should call foodService.findById", async () => {
    const param = "id";
    mockFoodService.findById.mockResolvedValue({ id: "log_1" });

    const result = await controller.findById(param);

    expect(mockFoodService.findById).toHaveBeenCalledWith(param);
    expect(result).toEqual({ id: "log_1" });
  });
});
