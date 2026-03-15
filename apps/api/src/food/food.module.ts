import { Module } from "@nestjs/common";
import { FoodController } from "./food.controller";
import { FoodService } from "./food.service";
import { OffService } from "./off.service";
import { UsdaService } from "./usda.service";

@Module({
  controllers: [FoodController],
  providers: [FoodService, UsdaService, OffService],
  exports: [FoodService],
})
export class FoodModule {}
