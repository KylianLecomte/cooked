import { Module } from "@nestjs/common";
import { FoodController } from "./controller/food.controller";
import { FoodService } from "./service/food.service";
import { OffService } from "./service/off.service";
import { UsdaService } from "./service/usda.service";

@Module({
  controllers: [FoodController],
  providers: [FoodService, UsdaService, OffService],
  exports: [FoodService],
})
export class FoodModule {}
