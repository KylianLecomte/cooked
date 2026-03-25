import { Module } from "@nestjs/common";
import { FoodController } from "./controller/food.controller";
import { OffService } from "./off.service";
import { FoodService } from "./service/food.service";
import { UsdaService } from "./usda.service";

@Module({
  controllers: [FoodController],
  providers: [FoodService, UsdaService, OffService],
  exports: [FoodService],
})
export class FoodModule {}
