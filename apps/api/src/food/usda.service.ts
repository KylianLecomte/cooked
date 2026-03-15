import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { EnvSchema } from "../config/env.schema";
import type { UsdaFoodDetail, UsdaSearchFood } from "./food.types";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

@Injectable()
export class UsdaService {
  private readonly logger = new Logger(UsdaService.name);

  constructor(private readonly config: ConfigService<EnvSchema>) {}

  private get apiKey(): string {
    return this.config.get("USDA_API_KEY", { infer: true }) ?? "DEMO_KEY";
  }

  /** Recherche par mot-clé — retourne jusqu'à `limit` aliments */
  async search(query: string, limit = 10): Promise<UsdaSearchFood[]> {
    const url = new URL(`${USDA_BASE}/foods/search`);
    url.searchParams.set("query", query);
    url.searchParams.set("api_key", this.apiKey);
    url.searchParams.set("pageSize", String(limit));
    // Foundation + SR Legacy = aliments de base avec micros complets
    // Branded = produits de marque avec données OFF-like
    url.searchParams.set(
      "dataType",
      "Foundation,SR Legacy,Survey (FNDDS),Branded",
    );

    try {
      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        this.logger.warn(`USDA search error ${res.status} for query "${query}"`);
        return [];
      }
      const data = (await res.json()) as { foods?: UsdaSearchFood[] };
      return data.foods ?? [];
    } catch (err) {
      this.logger.error(`USDA search timeout/error for "${query}": ${err}`);
      return [];
    }
  }

  /** Récupère le détail complet d'un aliment (avec tous les micronutriments) */
  async getDetail(fdcId: string): Promise<UsdaFoodDetail | null> {
    const url = `${USDA_BASE}/food/${fdcId}?api_key=${this.apiKey}`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        this.logger.warn(`USDA detail error ${res.status} for fdcId ${fdcId}`);
        return null;
      }
      return (await res.json()) as UsdaFoodDetail;
    } catch (err) {
      this.logger.error(`USDA detail timeout/error for ${fdcId}: ${err}`);
      return null;
    }
  }
}
