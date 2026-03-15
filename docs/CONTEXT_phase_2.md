# CONTEXT Phase 2 — Base de données alimentaires & Micronutriments

## Statut : ✅ TERMINÉE (12/13 — p2-4 Edamam optionnel reporté)

---

## Objectif

Permettre de rechercher un aliment par nom ou code-barre, obtenir ses macros ET micronutriments, et afficher la fiche détaillée avec recalcul en temps réel selon la portion.

---

## Fichiers créés / modifiés

### Backend (`apps/api`)

| Fichier | Rôle |
|---|---|
| `prisma/schema.prisma` | +`FoodSource`, `FoodCategory` enums + modèle `Food` (45 champs) |
| `prisma/migrations/20260313000000_p2_food_model/migration.sql` | Migration PostgreSQL — 2 enums + table `food` |
| `src/config/env.schema.ts` | +`USDA_API_KEY` (default `DEMO_KEY`) |
| `src/redis/redis.module.ts` | Module Redis global (`@Global`) |
| `src/redis/redis.service.ts` | Wrapper ioredis avec `getJson`/`setJson`, silently fail si Redis down |
| `src/food/food.types.ts` | Types internes : `UsdaSearchFood`, `UsdaFoodDetail`, `OffProduct`, `USDA_NUTRIENT_IDS` |
| `src/food/food.normalizer.ts` | Normalisation USDA search/detail + OFF → `Prisma.FoodCreateInput` |
| `src/food/usda.service.ts` | Appels USDA FoodData Central (search + detail), timeout 5s, fallback vide |
| `src/food/off.service.ts` | Appels Open Food Facts (search + barcode), timeout 5s, User-Agent requis |
| `src/food/food.service.ts` | Orchestrateur : cache Redis → DB → APIs externes, upsert automatique |
| `src/food/food.controller.ts` | 3 endpoints protégés `AuthGuard` |
| `src/food/food.module.ts` | Module NestJS |
| `src/app.module.ts` | +`RedisModule`, `FoodModule` |

### Mobile (`apps/mobile`)

| Fichier | Rôle |
|---|---|
| `types/food.ts` | `FoodSummary`, `FoodDetail`, `calcMacros`, `CATEGORY_LABELS`, `SOURCE_LABELS` |
| `lib/query-keys.ts` | +`foodSearch(q)`, `foodDetail(id)` |
| `hooks/useFoodSearch.ts` | `useQuery` sur `/api/foods/search?q=`, enabled si ≥2 chars, staleTime 24h |
| `hooks/useFoodDetail.ts` | `useQuery` sur `/api/foods/:id`, staleTime 7j |
| `app/(app)/(tabs)/search.tsx` | Écran Recherche fonctionnel : debounce 300ms + FlatList + états vide/chargement/erreur |
| `app/(app)/food/[id].tsx` | Écran Détail : PortionSelector + onglets Macros/Micronutriments + bouton journal (stub P3) |
| `components/PortionSelector.tsx` | Presets 50/100/150/200g + champ libre, réutilisé en P3 |
| `.expo/types/router.d.ts` | +`/(app)/food/[id]` avec `params: { id: string }` |

---

## Architecture

### Flux de recherche

```
GET /api/foods/search?q=poulet
  → Redis cache:search:{q} (TTL 24h)
     hit  → retour immédiat
     miss → USDA search + OFF search (parallèle, 10 résultats chacun)
          → normalise + upsert en DB (dédupliqué par source+sourceId)
          → stocke en cache
          → retourne FoodSummary[]
```

### Flux détail (avec enrichissement micro)

```
GET /api/foods/:id
  → Redis cache:detail:{id} (TTL 7j)
     hit  → retour immédiat
     miss → DB findUnique
          → si USDA && microDataComplete=false : fetch USDA /food/:fdcId
          → update DB microDataComplete=true + tous les micros
          → stocke en cache
          → retourne Food complet
```

### Flux code-barre

```
GET /api/foods/barcode/:code
  → Redis cache:barcode:{code} (TTL 7j)
     hit  → retour immédiat
     miss → DB check (source=OFF, sourceId=code)
          → si absent : OFF API /api/v0/product/:code.json
          → normalise + upsert DB + cache
          → retourne FoodSummary ou 404
```

---

## Modèle Food (Prisma)

```prisma
model Food {
  id       String       @id @default(cuid())
  source   FoodSource   // USDA | OFF | MANUAL
  sourceId String       // fdcId pour USDA, barcode pour OFF

  name     String
  brand    String?
  category FoodCategory @default(OTHER)

  // Macros per 100g
  kcalPer100g    Float
  proteinPer100g Float
  carbsPer100g   Float
  fatPer100g     Float
  fiberPer100g   Float?

  // Vitamines (nullable)
  vitA Float? // µg RAE    vitB1 Float? // mg
  vitB2 Float? // mg       vitB3 Float? // mg
  vitB5 Float? // mg       vitB6 Float? // mg
  vitB9 Float? // µg       vitB12 Float? // µg
  vitC Float? // mg        vitD Float? // µg
  vitE Float? // mg        vitK Float? // µg

  // Minéraux (nullable)
  calcium Float? // mg     iron Float? // mg
  magnesium Float? // mg   potassium Float? // mg
  zinc Float? // mg        phosphorus Float? // mg
  selenium Float? // µg    sodium Float? // mg
  copper Float? // mg      manganese Float? // mg

  microDataComplete Boolean @default(false)

  @@unique([source, sourceId])
  @@index([name])
}
```

---

## Endpoints

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/foods/search?q={query}` | ✅ | Recherche unifiée USDA+OFF, retourne `FoodSummary[]` |
| GET | `/api/foods/barcode/:code` | ✅ | Lookup EAN/UPC via OFF, retourne `FoodSummary` ou 404 |
| GET | `/api/foods/:id` | ✅ | Détail complet avec micros, enrichit depuis USDA si incomplet |

---

## Variables d'environnement ajoutées

| Variable | Valeur par défaut | Description |
|---|---|---|
| `USDA_API_KEY` | `DEMO_KEY` | Clé API USDA FoodData Central (30 req/h sans clé, 1000/h avec) |

**Existantes nécessaires :** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

---

## Normalisation OFF — unités

Les valeurs OFF `nutriments.*_100g` suivent ces unités :
- **Vitamines** : déjà en µg (A, D, K) ou mg (C, E) — pas de conversion
- **Minéraux** : en g/100g → multiplié par 1000 pour obtenir mg (`gToMg()`)
- `microDataComplete = false` pour tous les produits OFF (micros généralement incomplets)

---

## Breaking changes / Pièges

### Redis silently fail
`RedisService` catch toutes les erreurs — si Redis est down, la recherche fonctionne mais est plus lente (pas de cache). Ne plante pas l'API.

### USDA DEMO_KEY limites
Sans clé API : 30 requêtes/heure, 50/jour. En développement c'est suffisant. En production, récupérer une clé gratuite sur https://fdc.nal.usda.gov/api-guide.html et la mettre dans `USDA_API_KEY`.

### Upsert concurrent
Si deux requêtes cherchent le même aliment en parallèle, les deux upserts sont idempotents (Prisma gère le conflit `source_sourceId`). Pas de race condition.

### FoodService.search — typing Prisma
L'upsert `create` utilise un cast `as Parameters<...>[0]["data"]` pour contourner le fait que `Prisma.FoodCreateInput` n'est pas directement accepté sans les champs relationnels vides. Alternative propre en P8 : refactoriser avec un DTO typé séparé.

---

## Migration

```bash
# Appliquer la migration en dev
pnpm --filter @cooked/api exec prisma migrate dev --name p2_food_model

# Ou appliquer le fichier SQL existant directement
pnpm --filter @cooked/api exec prisma migrate deploy
```

Le fichier SQL est déjà présent dans `prisma/migrations/20260313000000_p2_food_model/migration.sql`.

---

## Prochaines étapes — Phase 3

- **p3-1** : Schema Prisma `DiaryEntry + Meal + FoodLog` (journal alimentaire)
- **p3-2** : CRUD DiaryEntry (GET/POST/PATCH/DELETE `/diary/:date`)
- **p3-3** : Agrégat macros `GET /diary/:date/summary`
- **p3-4** : Agrégat micronutriments `GET /diary/:date/micros` (score /100)
- **p3-7** : Écran Journal — Card Macros (anneau SVG calories + barres macros)
- **p3-8** : Écran Journal — Card Micronutriments (score + top 5 déficits)
- **p3-11** : 4 sections repas expandables dans le journal
- **p3-14** : Optimistic updates TanStack Query (ajout instantané)
- Le `PortionSelector` déjà créé en P2 sera pleinement utilisé ici pour sélectionner la quantité et le repas cible avant de logguer
