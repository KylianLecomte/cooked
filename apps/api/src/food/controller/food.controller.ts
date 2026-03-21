import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { FoodService } from "../service/food.service";

@Controller("api/foods")
@UseGuards(AuthGuard)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  /**
   * GET /api/foods/search?q=poulet
   * Recherche unifiée USDA + Open Food Facts.
   * Retourne un tableau de FoodSummary (sans micronutriments détaillés).
   */
  @Get("search")
  async search(@Query("q") query: string) {
    if (!query?.trim()) throw new BadRequestException("Le paramètre q est requis");
    return this.foodService.search(query.trim());
  }

  /**
   * GET /api/foods/barcode/:code
   * Recherche par code-barre EAN/UPC via Open Food Facts.
   * Retourne un FoodSummary ou 404.
   */
  @Get("barcode/:code")
  async barcode(@Param("code") code: string) {
    const food = await this.foodService.findByBarcode(code);
    if (!food) throw new BadRequestException(`Produit ${code} introuvable`);
    return food;
  }

  /**
   * GET /api/foods/:id
   * Détail complet d'un aliment (macros + tous les micronutriments).
   * Si USDA et micros incomplets, fetche le détail complet en temps réel.
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.foodService.findById(id);
  }
}
