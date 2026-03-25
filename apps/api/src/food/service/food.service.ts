import { Injectable, NotFoundException } from "@nestjs/common";
import { REDIS_CACHE_TTL_1D, REDIS_CACHE_TTL_7D } from "src/util/constant";
import type { Food } from "../../../generated/prisma/client";
import { FoodSource } from "../../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/service/redis.service";
import { normalizeOffProduct, normalizeUsdaDetail, normalizeUsdaSearch } from "../food.normalizer";
import { OffService } from "../off.service";
import { UsdaService } from "../usda.service";

// Résumé léger d'un aliment (liste de recherche)
export type FoodSummary = Pick<
  Food,
  | "id"
  | "source"
  | "sourceId"
  | "name"
  | "brand"
  | "category"
  | "kcalPer100g"
  | "proteinPer100g"
  | "carbsPer100g"
  | "fatPer100g"
  | "fiberPer100g"
>;

const SUMMARY_SELECT = {
  id: true,
  source: true,
  sourceId: true,
  name: true,
  brand: true,
  category: true,
  kcalPer100g: true,
  proteinPer100g: true,
  carbsPer100g: true,
  fatPer100g: true,
  fiberPer100g: true,
};

@Injectable()
export class FoodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly usda: UsdaService,
    private readonly off: OffService,
  ) {}

  // ── Recherche unifiée ───────────────────────────────────────────────────────
  async search(query: string): Promise<FoodSummary[]> {
    const cacheKey = `food:search:${query.toLowerCase().trim()}`;

    // 1. Cache Redis
    const cached = await this.redis.getJson<FoodSummary[]>(cacheKey);
    if (cached) return cached;

    // 2. USDA + OFF en parallèle
    const [usdaFoods, offFoods] = await Promise.all([
      this.usda.search(query, 10),
      this.off.search(query, 10),
    ]);

    // 3. Normaliser + persister en DB (upsert, ne crée pas de doublon)
    const results: FoodSummary[] = [];

    for (const raw of usdaFoods) {
      const data = normalizeUsdaSearch(raw);
      const food = await this.prisma.client.food.upsert({
        where: { source_sourceId: { source: FoodSource.USDA, sourceId: data.sourceId } },
        create: { ...(data as Parameters<typeof this.prisma.client.food.create>[0]["data"]) },
        update: {
          name: data.name,
          brand: data.brand,
          category: data.category,
          kcalPer100g: data.kcalPer100g,
          proteinPer100g: data.proteinPer100g,
          carbsPer100g: data.carbsPer100g,
          fatPer100g: data.fatPer100g,
          fiberPer100g: data.fiberPer100g,
        },
        select: SUMMARY_SELECT,
      });
      results.push(food);
    }

    for (const raw of offFoods) {
      const data = normalizeOffProduct(raw);
      if (!data) continue;
      try {
        const food = await this.prisma.client.food.upsert({
          where: { source_sourceId: { source: FoodSource.OFF, sourceId: data.sourceId } },
          create: { ...(data as Parameters<typeof this.prisma.client.food.create>[0]["data"]) },
          update: {
            name: data.name,
            brand: data.brand,
            category: data.category,
            kcalPer100g: data.kcalPer100g,
            proteinPer100g: data.proteinPer100g,
            carbsPer100g: data.carbsPer100g,
            fatPer100g: data.fatPer100g,
            fiberPer100g: data.fiberPer100g,
          },
          select: SUMMARY_SELECT,
        });
        results.push(food);
      } catch {
        // Ignore les conflits éventuels
      }
    }

    // 4. Mettre en cache (TTL réduit à 1 jour pour les recherches — résultats peuvent évoluer)
    await this.redis.setJson(cacheKey, results, REDIS_CACHE_TTL_1D);

    return results;
  }

  // ── Recherche par code-barre ────────────────────────────────────────────────
  async findByBarcode(barcode: string): Promise<FoodSummary | null> {
    const cacheKey = `food:barcode:${barcode}`;

    // 1. Cache Redis
    const cached = await this.redis.getJson<FoodSummary>(cacheKey);
    if (cached) return cached;

    // 2. DB (déjà vu ce barcode ?)
    const inDb = await this.prisma.client.food.findUnique({
      where: { source_sourceId: { source: FoodSource.OFF, sourceId: barcode } },
      select: SUMMARY_SELECT,
    });
    if (inDb) {
      await this.redis.setJson(cacheKey, inDb, REDIS_CACHE_TTL_7D);
      return inDb;
    }

    // 3. OFF API
    const raw = await this.off.getByBarcode(barcode);
    if (!raw) return null;

    const data = normalizeOffProduct(raw);
    if (!data) return null;

    const food = await this.prisma.client.food.upsert({
      where: { source_sourceId: { source: FoodSource.OFF, sourceId: barcode } },
      create: { ...(data as Parameters<typeof this.prisma.client.food.create>[0]["data"]) },
      update: {
        name: data.name,
        brand: data.brand,
        category: data.category,
        kcalPer100g: data.kcalPer100g,
        proteinPer100g: data.proteinPer100g,
        carbsPer100g: data.carbsPer100g,
        fatPer100g: data.fatPer100g,
      },
      select: SUMMARY_SELECT,
    });

    await this.redis.setJson(cacheKey, food, REDIS_CACHE_TTL_7D);
    return food;
  }

  // ── Détail complet (avec micronutriments) ───────────────────────────────────

  async findById(id: string): Promise<Food> {
    const cacheKey = `food:detail:${id}`;

    // 1. Cache Redis
    const cached = await this.redis.getJson<Food>(cacheKey);
    if (cached) return cached;

    // 2. DB
    const food = await this.prisma.client.food.findUnique({ where: { id } });
    if (!food) throw new NotFoundException(`Food ${id} not found`);

    // 3. Si USDA et micros incomplets : fetch le détail complet
    if (food.source === FoodSource.USDA && !food.microDataComplete) {
      const detail = await this.usda.getDetail(food.sourceId);
      if (detail) {
        const updated = normalizeUsdaDetail(detail);
        const full = await this.prisma.client.food.update({
          where: { id },
          data: {
            vitA: updated.vitA,
            vitB1: updated.vitB1,
            vitB2: updated.vitB2,
            vitB3: updated.vitB3,
            vitB5: updated.vitB5,
            vitB6: updated.vitB6,
            vitB9: updated.vitB9,
            vitB12: updated.vitB12,
            vitC: updated.vitC,
            vitD: updated.vitD,
            vitE: updated.vitE,
            vitK: updated.vitK,
            calcium: updated.calcium,
            iron: updated.iron,
            magnesium: updated.magnesium,
            potassium: updated.potassium,
            zinc: updated.zinc,
            phosphorus: updated.phosphorus,
            selenium: updated.selenium,
            sodium: updated.sodium,
            copper: updated.copper,
            manganese: updated.manganese,
            microDataComplete: true,
          },
        });
        await this.redis.setJson(cacheKey, full, REDIS_CACHE_TTL_7D);
        return full;
      }
    }

    await this.redis.setJson(cacheKey, food, REDIS_CACHE_TTL_7D);
    return food;
  }
}
