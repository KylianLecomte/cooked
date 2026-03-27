import { Food, FoodSummary } from "@cooked/shared";
import { BadRequestException, Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { FoodService } from "../service/food.service";

@Controller("foods")
@UseGuards(AuthGuard)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  /**
   * GET /v1/api/foods/search?q=poulet
   * Recherche unifiée USDA + Open Food Facts.
   * Retourne un tableau de FoodSummary (sans micronutriments détaillés).
   */
  @Get("search")
  async search(@Query("q") query: string): Promise<FoodSummary[]> {
    if (!query?.trim()) throw new BadRequestException("Le paramètre q est requis");
    return this.foodService.search(query.trim());
  }

  /**
   * GET /v1/api/foods/barcode/:barcode
   * Recherche par code-barre EAN/UPC via Open Food Facts.
   * Retourne un FoodSummary ou 404.
   */
  @Get("barcode/:barcode")
  async findByBarcode(@Param("barcode") barcode: string): Promise<FoodSummary | null> {
    return await this.foodService.findByBarcode(barcode);
  }

  /**
   * GET /v1/api/foods/:id
   * Détail complet d'un aliment (macros + tous les micronutriments).
   * Si USDA et micros incomplets, fetche le détail complet en temps réel.
   */
  @Get(":id")
  findById(@Param("id") id: string): Promise<Food> {
    return this.foodService.findById(id);
  }
}
