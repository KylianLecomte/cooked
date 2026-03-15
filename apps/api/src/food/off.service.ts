import { Injectable, Logger } from "@nestjs/common";
import type { OffProduct } from "./food.types";

const OFF_BASE = "https://world.openfoodfacts.org";

// Champs demandés à l'API pour limiter la taille de la réponse
const OFF_FIELDS =
  "code,product_name,brands,pnns_groups_1,nutriments";

@Injectable()
export class OffService {
  private readonly logger = new Logger(OffService.name);

  /** Recherche par nom — retourne jusqu'à `limit` produits */
  async search(query: string, limit = 10): Promise<OffProduct[]> {
    const url = new URL(`${OFF_BASE}/cgi/search.pl`);
    url.searchParams.set("search_terms", query);
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", String(limit));
    url.searchParams.set("fields", OFF_FIELDS);
    // Filtre sur les produits avec des données nutritionnelles
    url.searchParams.set("action", "process");

    try {
      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(5000),
        headers: {
          // OFF recommande d'identifier le client
          "User-Agent": "COOKED-App/1.0 (contact@cooked.app)",
        },
      });
      if (!res.ok) {
        this.logger.warn(`OFF search error ${res.status} for "${query}"`);
        return [];
      }
      const data = (await res.json()) as { products?: OffProduct[] };
      return data.products ?? [];
    } catch (err) {
      this.logger.error(`OFF search timeout/error for "${query}": ${err}`);
      return [];
    }
  }

  /** Recherche par code-barre */
  async getByBarcode(barcode: string): Promise<OffProduct | null> {
    const url = `${OFF_BASE}/api/v0/product/${barcode}.json?fields=${OFF_FIELDS}`;

    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "COOKED-App/1.0 (contact@cooked.app)" },
      });
      if (!res.ok) return null;

      const data = (await res.json()) as { status: number; product?: OffProduct };
      if (data.status !== 1 || !data.product) return null;
      return data.product;
    } catch (err) {
      this.logger.error(`OFF barcode timeout/error for ${barcode}: ${err}`);
      return null;
    }
  }
}
