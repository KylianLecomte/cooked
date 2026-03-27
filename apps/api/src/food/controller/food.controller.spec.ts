import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { FoodService } from "../service/food.service";
import { FoodController } from "./food.controller";

const mockFoodService = {
  search: vi.fn(),
  findByBarcode: vi.fn(),
  findById: vi.fn(),
};

describe("FoodController", () => {
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

  describe("search", () => {
    it("should call foodService.search with trimmed query", async () => {
      const expectedResult = [{ id: "1" }, { id: "2" }];
      mockFoodService.search.mockResolvedValue(expectedResult);

      const result = await controller.search("  chicken breast  ");

      expect(mockFoodService.search).toHaveBeenCalledWith("chicken breast");
      expect(result).toEqual(expectedResult);
    });

    it("should throw BadRequestException when query is undefined", async () => {
      await expect(controller.search(undefined as unknown as string)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockFoodService.search).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when query is empty string", async () => {
      await expect(controller.search("")).rejects.toThrow(BadRequestException);
      expect(mockFoodService.search).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when query is only whitespace", async () => {
      await expect(controller.search("   ")).rejects.toThrow(BadRequestException);
      expect(mockFoodService.search).not.toHaveBeenCalled();
    });
  });

  describe("findByBarcode", () => {
    it("should call foodService.findByBarcode with given barcode", async () => {
      mockFoodService.findByBarcode.mockResolvedValue({ id: "food_1" });

      const result = await controller.findByBarcode("5000112126619");

      expect(mockFoodService.findByBarcode).toHaveBeenCalledWith("5000112126619");
      expect(result).toEqual({ id: "food_1" });
    });
  });

  describe("findById", () => {
    it("should call foodService.findById with given id", async () => {
      mockFoodService.findById.mockResolvedValue({ id: "food_1" });

      const result = await controller.findById("food_1");

      expect(mockFoodService.findById).toHaveBeenCalledWith("food_1");
      expect(result).toEqual({ id: "food_1" });
    });
  });
});
