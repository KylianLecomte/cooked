# COOKED — Contexte Phase 1 : Auth & Profil Utilisateur

## Instructions pour Claude

- Prendre en compte TOUS les fichiers fournis en début de conversation
- Être factuel et critique — signaler ce qui est incorrect même si ça va dans le sens de l'utilisateur
- Tout détailler : fichiers créés, options, paramètres, raisons des choix
- Vérifier les versions des outils via web search avant de les prescrire (mars 2026)
- **Maintenir à jour : CONTEXT_phase_1.md, dev-plan.html** — et créer CONTEXT_phase_2.md à la fin de P1
- La difficulté n'est pas un critère — on fait les choses bien
- Maximum de détail dans les réponses, toujours expliquer les choix
- CONTEXT_phase_0.md reste la référence pour tout ce qui concerne le setup P0 (config, conventions, breaking changes)

---

## Objectif du projet

App nutrition type MyFitnessPal. Projet d'apprentissage A→Z avec bonnes pratiques (Clean Code, sécurité, observabilité). Potentiellement utilisé en production par d'autres personnes.

---

## Environnement (résumé — détails complets dans CONTEXT_phase_0.md)

- OS : Windows + WSL2 Ubuntu 24.04 — TOUT le dev dans WSL2
- Shell : bash dans WSL2 / IDE : VS Code + Remote WSL
- Node : 24.14 LTS via fnm — `.nvmrc` contient `"24"`
- pnpm : 10.30.3
- Docker Desktop avec intégration WSL2
- Racine projet : `/home/kylian/developpement/project/cooked`
- Repo GitHub : **public**

---

## Architecture (résumé)

### Local (dev)

```
WSL2
├── NestJS (pnpm dev)
├── Docker : postgres:17-alpine  ← Prisma (DATABASE_URL=postgresql://cooked:cooked_dev@localhost:5432/cooked_db)
└── Docker : redis:8-alpine      ← NestJS Cache (REDIS_URL=redis://:cooked_dev@localhost:6379)
```

### Staging / Production (Railway)

```
Railway
├── Service NestJS
├── Service PostgreSQL (managé)
└── Service Redis (managé)
```

### Stratégie de branches — GitLab Flow

```
feature/xxx → main → staging → production
```

Branches permanentes protégées, aucun commit direct autorisé.

---

## Stack technique (résumé — détails dans stack-recap.html)

| Couche             | Techno                      | Version                                           |
| ------------------ | --------------------------- | ------------------------------------------------- |
| Monorepo           | Turborepo                   | 2.8.13                                            |
| Backend            | NestJS                      | ^11.0.1                                           |
| ORM                | Prisma                      | 7.5.0                                             |
| Auth               | **Better Auth**             | 1.5.5 ✅                                          |
| BDD locale         | PostgreSQL (Docker)         | postgres:17-alpine                                |
| Cache              | Redis (Docker)              | redis:8-alpine                                    |
| Mobile             | Expo SDK                    | 55                                                |
| Navigation         | Expo Router                 | ^55.0.4                                           |
| Styling            | NativeWind v4 + Tailwind v3 | nativewind 4.2.0                                  |
| HTTP client mobile | **TanStack Query v5**       | ✅ installé                                       |
| Auth client mobile | **@better-auth/expo**       | ✅ installé (client: `@better-auth/expo/client`)  |
| Stockage tokens    | **expo-secure-store**       | ✅ ^55.0.8                                        |
| Linting/Formatting | **Biome**                   | 2.4.6                                             |
| Logging            | nestjs-pino + Axiom         | -                                                 |
| Monitoring         | Sentry                      | @sentry/nestjs ✅, @sentry/react-native ⏳ (P2)  |
| Qualité            | SonarCloud                  | -                                                 |

---

## État des phases

| Phase                              | Status              |
| ---------------------------------- | ------------------- |
| P0 — Setup & Architecture          | ✅ TERMINÉ (18/18)  |
| **P1 — Auth & Profil Utilisateur** | ✅ TERMINÉ (10/11)  |
| P2 → P8                            | ⏳ À venir          |

⚠️ p1-5 (Sentry React Native) reporté en P2 — nécessite un Dev Build compilé pour tester.

---

## P1 — État des tâches

| ID    | Tâche                                               | Status |
| ----- | --------------------------------------------------- | ------ |
| p1-1  | Intégrer Better Auth dans NestJS + plugin expo()    | ✅     |
| p1-2  | Écran Register (React Native)                       | ✅     |
| p1-3  | Écran Login + @better-auth/expo + expo-secure-store | ✅     |
| p1-4  | Guard d'auth Expo Router — (app)/_layout.tsx        | ✅     |
| p1-5  | Initialiser Sentry React Native                     | ⏳ P2  |
| p1-6  | Schema Prisma : User + Profile                      | ✅     |
| p1-6b | Configurer EAS Dev Build                            | ✅     |
| p1-6c | Installer TanStack Query v5                         | ✅     |
| p1-7  | Calcul automatique TDEE (module Profile backend)    | ✅     |
| p1-8  | Onboarding Step 1 — Infos physiques                 | ✅     |
| p1-9  | Onboarding Step 2 — Activité & Objectif             | ✅     |
| p1-10 | Onboarding Step 3 — Résumé TDEE                     | ✅     |
| p1-11 | Écran Edit Profile                                  | ✅     |

---

## Configuration actuelle apps/api (état final)

### Compilateur

- **tsc** (TypeScript compiler standard) — SWC a été tenté mais abandonné
  - `.swcrc` reste pour Vitest uniquement (`unplugin-swc`)
  - Raison de l'abandon : conflits de config SWC entre NestJS CLI et Vitest (`es6` vs `commonjs`)

### Instance PrismaClient unique

L'application utilise une **seule instance PrismaClient**, définie dans `src/prisma/prisma.instance.ts` et partagée entre :
- **Better Auth** (`src/auth/auth.ts`) — qui en a besoin au chargement du module (avant NestJS)
- **PrismaService** (`src/prisma/prisma.service.ts`) — qui l'expose dans le conteneur DI de NestJS

Cela évite d'ouvrir deux pools de connexions PostgreSQL distincts et permet les transactions cross-modèles.

`process.env.DATABASE_URL` est lu directement dans `prisma.instance.ts` car l'instance est créée avant l'initialisation de NestJS. La validation Zod dans `env.schema.ts` vérifie la variable au boot — si elle est invalide, l'app s'arrête avec un message d'erreur clair.

---

## Fichiers créés/modifiés en P1

### Backend (apps/api)

#### `apps/api/src/auth/auth.ts` — mis à jour avec plugin expo()

```ts
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../prisma/prisma.instance";

export const auth = betterAuth({
  basePath: "/api/auth",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:8081",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) ?? []),
  ],
  emailAndPassword: { enabled: true },
  plugins: [expo()],  // ajoute exp:// aux origines de confiance
});
```

#### `apps/api/src/profile/tdee.calculator.ts` — formule Mifflin-St Jeor

Fonctions pures de calcul TDEE.

```
Hommes : BMR = 10 × poids(kg) + 6.25 × taille(cm) - 5 × âge + 5
Femmes : BMR = 10 × poids(kg) + 6.25 × taille(cm) - 5 × âge - 161
Autre  : Moyenne des deux formules
TDEE = BMR × facteur_activité
```

Multiplicateurs :
- SEDENTARY: ×1.2 · LIGHTLY_ACTIVE: ×1.375 · MODERATELY_ACTIVE: ×1.55 · VERY_ACTIVE: ×1.725 · EXTRA_ACTIVE: ×1.9

Delta calorique selon objectif :
- LOSE_WEIGHT: −500 kcal · MAINTAIN: ±0 · GAIN_MUSCLE: +300 kcal

Répartition macros (% kcal) :
- LOSE_WEIGHT: prot 35% / carb 35% / fat 30%
- MAINTAIN: prot 30% / carb 40% / fat 30%
- GAIN_MUSCLE: prot 30% / carb 45% / fat 25%

#### `apps/api/src/profile/dto/update-profile.dto.ts` — Zod v4

⚠️ `z.nativeEnum()` est **déprécié en Zod v4** — remplacé par `z.enum([...])` avec valeurs littérales.

```ts
gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
activityLevel: z.enum(["SEDENTARY", "LIGHTLY_ACTIVE", ...]).optional(),
goal: z.enum(["LOSE_WEIGHT", "MAINTAIN", "GAIN_MUSCLE"]).optional(),
```

Le type inféré est identique au type union Prisma (`Gender`, `ActivityLevel`, `Goal`).

#### `apps/api/src/profile/profile.service.ts`

- `findByUserId(userId)` : retourne le profil ou `null`
- `upsert(userId, rawDto)` : valide avec Zod, merge avec l'existant (PATCH sémantique), recalcule TDEE si tous les champs requis sont présents

#### `apps/api/src/profile/profile.controller.ts`

```ts
@Controller("api/profile")
@UseGuards(AuthGuard)  // AuthGuard de @thallesp/nestjs-better-auth
export class ProfileController {
  @Get()    getProfile(@Session() session) { ... }
  @Patch()  updateProfile(@Session() session, @Body() body) { ... }
}
```

⚠️ `@Session()` est le décorateur param de `@thallesp/nestjs-better-auth` — retourne `{ user: User }`.

#### `apps/api/src/app.module.ts` — mis à jour

`ProfileModule` ajouté aux imports.

#### `apps/api/src/config/env.schema.ts` — mis à jour

```ts
BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
// Format: "http://192.168.1.10:3000,https://abcd.ngrok.io"
```

#### `apps/api/prisma.config.ts` — fix EAS build

```ts
// process.env au lieu de env() de Prisma : env() throw si absent (crash EAS)
url: process.env.DATABASE_URL ?? "",
```

`prisma generate` n'a pas besoin d'une URL réelle — il lit le schema uniquement.

---

### Mobile (apps/mobile)

#### Structure de routes Expo Router

```
apps/mobile/app/
├── _layout.tsx                    ← root: QueryClientProvider + Stack
├── index.tsx                      ← redirect: session? → journal : login
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
└── (app)/
    ├── _layout.tsx                ← guard: session + profile check
    ├── (tabs)/
    │   ├── _layout.tsx            ← Tabs (5 onglets)
    │   ├── journal.tsx            ← stub P3
    │   ├── search.tsx             ← stub P2
    │   ├── planning.tsx           ← stub P5
    │   ├── shopping.tsx           ← stub P6
    │   └── profile.tsx            ← écran profil complet
    ├── onboarding/
    │   ├── step1.tsx              ← infos physiques
    │   ├── step2.tsx              ← activité + objectif
    │   └── step3.tsx              ← résumé TDEE
    └── profile/
        └── edit.tsx               ← modification profil
```

#### `apps/mobile/lib/auth-client.ts`

⚠️ `expoClient` est exporté depuis **`@better-auth/expo/client`** (PAS `@better-auth/expo`).

```ts
import { expoClient } from "@better-auth/expo/client";  // ← /client
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  plugins: [
    expoClient({
      scheme: "cooked",  // doit correspondre à app.json "scheme"
      storage: {
        // expo-secure-store SDK 55 : getItem et setItem sont synchrones
        getItem: SecureStore.getItem,
        setItem: SecureStore.setItem,
      },
    }),
  ],
});
```

#### `apps/mobile/lib/api-client.ts`

Wrapper fetch central qui injecte le cookie Better Auth dans chaque requête :

```ts
const cookie = authClient.getCookie();  // cookie stocké par expoClient
headers.set("Cookie", cookie);
```

React Native n'a pas de jar de cookies natif — le cookie doit être passé manuellement.

#### `apps/mobile/hooks/useProfile.ts`

Hooks TanStack Query pour lire/modifier le profil :
- `useProfile()` — GET /api/profile
- `useUpdateProfile()` — PATCH /api/profile (avec setQueryData pour éviter un refetch)

#### Guard `(app)/_layout.tsx`

```
session absent  → redirect /(auth)/login
profile.goal absent → redirect /(app)/onboarding/step1
sinon → render Stack
```

`goal` est utilisé comme sentinelle de complétude — c'est le dernier champ rempli dans l'onboarding.

#### `apps/mobile/.expo/types/router.d.ts` — mis à jour manuellement

⚠️ Ce fichier est auto-généré par `expo start`. Il a été mis à jour manuellement pour le typecheck.
À chaque ajout de route, relancer `expo start` pour le régénérer automatiquement.

---

## Variables d'environnement

### `apps/api/.env`

```env
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=  # optionnel: IP LAN, ngrok, etc.
```

### `apps/mobile/.env` (à créer localement)

```env
# IP LAN de la machine WSL2 si l'app tourne sur appareil physique
# En emulateur Android dans WSL2, localhost fonctionne
EXPO_PUBLIC_API_URL=http://localhost:3000
```

⚠️ `EXPO_PUBLIC_` est le préfixe Expo pour les variables exposées au client (Metro bundle).

---

## Endpoints API en P1

| Méthode | URL                          | Auth requis | Notes                                   |
| ------- | ---------------------------- | ----------- | --------------------------------------- |
| POST    | `/api/auth/sign-up/email`    | Non         | `{ name, email, password }`             |
| POST    | `/api/auth/sign-in/email`    | Non         | `{ email, password }` — retourne cookie |
| GET     | `/api/auth/get-session`      | Cookie      | Retourne session + user                 |
| POST    | `/api/auth/sign-out`         | Cookie      | Invalidate session                      |
| GET     | `/api/profile`               | Cookie      | Retourne profile ou null                |
| PATCH   | `/api/profile`               | Cookie      | Upsert + recalcul TDEE                  |

⚠️ **`Origin` header obligatoire** sur tous les POST — Better Auth protège contre le CSRF.

---

## Breaking changes documentés en P1

### `@better-auth/expo` — `expoClient` est dans le sous-path `/client`

- **Mauvais** : `import { expoClient } from "@better-auth/expo"`
- **Correct** : `import { expoClient } from "@better-auth/expo/client"`
- **Raison** : le module root exporte le plugin serveur (`expo()`), pas le client

### `prisma.config.ts` — `env()` de Prisma crash sur EAS build

- **Symptôme** : `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`
- **Cause** : `env()` throw si la variable est absente. EAS build installe tout le monorepo (y compris apps/api) sans avoir DATABASE_URL.
- **Fix** : `url: process.env.DATABASE_URL ?? ""`
- `prisma generate` ne se connecte pas — le fallback `""` n'est jamais utilisé

### Zod v4 — `z.nativeEnum()` est déprécié

- **Fix** : `z.enum(["VALUE1", "VALUE2"] as const)`
- Le type inféré est identique au type union Prisma

### Expo Router `typedRoutes` — `router.d.ts` non mis à jour automatiquement

- **Symptôme** : TypeScript error sur les nouveaux chemins de routes
- **Cause** : `.expo/types/router.d.ts` est généré par `expo start`, pas par `tsc`
- **Fix** : mettre à jour manuellement ou relancer `expo start`

### expo-secure-store SDK 55 — méthodes synchrones disponibles

- `SecureStore.getItem(key)` → `string | null` (synchrone)
- `SecureStore.setItem(key, value)` → `void` (synchrone)
- `expoClient` exige un `getItem` synchrone — utiliser ces méthodes (pas `getItemAsync`)

---

## Rappel — Breaking changes P0 (les plus importants)

- **Biome 2.4.6** : remplace ESLint + Prettier — `biome check --write` pour lint + format
- **Zod v4** : `z.prettifyError(error)` pour formatter, `error.issues` (pas `error.errors`)
- **SentryExceptionFilter** custom — incompatible avec Pino multi-transport (voir CONTEXT_phase_0.md)
- **APP_FILTER** = token importé de `@nestjs/core`, jamais la string
- **`bootstrap().catch(...)`** — jamais `void bootstrap()`, log l'erreur avant `process.exit(1)`
- **NativeWind v4** : tailwindcss v3 uniquement (pas v4)
- **Expo SDK 55** : New Architecture obligatoire, Expo Go APK SDK 55 depuis expo.dev/go
- **`--tunnel`** obligatoire sur tous les scripts dev mobile (WSL2)
- **`node-linker=hoisted`** dans `.npmrc` racine — obligatoire pour Gradle autolinking React Native dans monorepo pnpm
- **Instance PrismaClient unique** dans `prisma/prisma.instance.ts` — `PrismaService.client` pour y accéder
- **pnpm.overrides NestJS** obligatoires dans `package.json` racine (voir CONTEXT_phase_0.md)

---

## Prochaines étapes — Phase 2

1. Créer `docs/CONTEXT_phase_2.md`
2. **p1-5** — Sentry React Native (après premier Dev Build compilé)
3. **p2-1** — Module NestJS FoodService
4. **p2-2** — Intégrer USDA FoodData Central
5. **p2-3** — Intégrer Open Food Facts
6. **p2-5** — Modèle Prisma Food + micronutriments
7. **p2-11** — Écran Recherche mobile
