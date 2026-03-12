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
├── Docker : postgres:18-alpine  ← Prisma (DATABASE_URL=postgresql://cooked:cooked_dev@localhost:5432/cooked_db)
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
| Auth               | **Better Auth**             | 1.5.5 ✅ installé                                 |
| BDD locale         | PostgreSQL (Docker)         | postgres:18-alpine                                |
| Cache              | Redis (Docker)              | redis:8-alpine                                    |
| Mobile             | Expo SDK                    | 55                                                |
| Navigation         | Expo Router                 | ^55.0.4                                           |
| Styling            | NativeWind v4 + Tailwind v3 | -                                                 |
| HTTP client mobile | **TanStack Query v5**       | à installer                                       |
| Logging            | nestjs-pino + Axiom         | -                                                 |
| Monitoring         | Sentry                      | @sentry/nestjs ✅, @sentry/react-native (à faire) |
| Qualité            | SonarCloud                  | -                                                 |

---

## État des phases

| Phase                              | Status             |
| ---------------------------------- | ------------------ |
| P0 — Setup & Architecture          | ✅ TERMINÉ (18/18) |
| **P1 — Auth & Profil Utilisateur** | 🔄 EN COURS        |
| P2 → P8                            | ⏳ À venir         |

---

## P1 — État des tâches

| ID    | Tâche                                               | Status |
| ----- | --------------------------------------------------- | ------ |
| p1-6b | Configurer EAS Dev Build                            | ✅     |
| p1-1  | Intégrer Better Auth dans NestJS                    | ✅     |
| p1-6  | Schema Prisma : User + Profile                      | ✅     |
| p1-2  | Écran Register (React Native)                       | ⬜     |
| p1-3  | Écran Login + @better-auth/expo + expo-secure-store | ⬜     |
| p1-4  | Middleware d'auth Expo Router                       | ⬜     |
| p1-5  | Initialiser Sentry React Native                     | ⬜     |
| p1-6c | Installer TanStack Query v5                         | ⬜     |
| p1-7  | Calcul automatique TDEE                             | ⬜     |
| p1-8  | Écran Onboarding multi-étapes                       | ⬜     |
| p1-9  | Écran Paramètres / Modifier profil                  | ⬜     |

---

## Configuration actuelle apps/api (état final)

### Compilateur

- **tsc** (TypeScript compiler standard) — SWC a été tenté mais abandonné pour l'instant
  - SWC sera peut-être réintroduit plus tard
  - Raison de l'abandon : conflits de config SWC entre NestJS CLI et Vitest (`es6` vs `commonjs`)

### Fichiers de configuration

**`apps/api/nest-cli.json`** :

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "tsConfigPath": "tsconfig.build.json",
    "deleteOutDir": true
  }
}
```

⚠️ Pas de `"builder": "swc"` — on utilise tsc.

**`apps/api/tsconfig.json`** :

```json
{
  "extends": "@cooked/tsconfig/node.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@cooked/shared": ["../../packages/shared/src/index.ts"]
    },
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*", "test/**/*"]
}
```

⚠️ `"rootDir": "."` et `"outDir": "./dist"` sont **obligatoires explicitement** — ne pas les hériter du tsconfig parent.

**`apps/api/tsconfig.build.json`** :

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts", "**/*.e2e-spec.ts"]
}
```

**`apps/api/package.json`** (dépendances importantes) :

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@prisma/adapter-pg": "^7.5.0",
    "@prisma/client": "^7.5.0",
    "@thallesp/nestjs-better-auth": "^2.5.1",
    "better-auth": "^1.5.5",
    "pg": "^8.20.0"
  },
  "devDependencies": {
    "prisma": "^7.5.0"
  }
}
```

⚠️ `@prisma/client` doit être en **`dependencies`** (runtime), pas `devDependencies`.

**`package.json` racine** (overrides pnpm) :

```json
{
  "pnpm": {
    "overrides": {
      "@nestjs/core": "^11.0.0",
      "@nestjs/common": "^11.0.0",
      "@nestjs/platform-express": "^11.0.0"
    }
  }
}
```

Ces overrides forcent une unique instance de `@nestjs/core` dans tout le monorepo — nécessaire pour éviter l'erreur `ApplicationConfig` avec `@thallesp/nestjs-better-auth`.

---

## Fichiers créés en P1

### `apps/api/src/auth/auth.ts`

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:8081", // Metro Expo dev server
  ],
  emailAndPassword: {
    enabled: true,
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

### `apps/api/src/prisma/prisma.service.ts`

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

### `apps/api/src/prisma/prisma.module.ts`

```ts
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

### `apps/api/src/app.module.ts`

```ts
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { SentryModule } from "@sentry/nestjs/setup";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { validateEnv } from "./config/env.validation";
import type { EnvSchema } from "./config/env.schema";
import { buildPinoConfig } from "./logger/logger.config";
import { SentryExceptionFilter } from "./filter/sentry-exception.filter";
import { PrismaModule } from "./prisma/prisma.module";
import { auth } from "./auth/auth";

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema>) =>
        buildPinoConfig({
          isDev: config.get("NODE_ENV", { infer: true }) === "development",
          axiomDataset: config.get("AXIOM_DATASET", { infer: true }),
          axiomToken: config.get("AXIOM_TOKEN", { infer: true }),
        }),
    }),
    PrismaModule,
    AuthModule.forRoot({ auth, disableGlobalAuthGuard: true }),
  ],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: SentryExceptionFilter }, AppService],
})
export class AppModule {}
```

⚠️ `disableGlobalAuthGuard: true` est obligatoire — sinon toutes les routes sont protégées par défaut.
⚠️ `bodyParser: false` dans `main.ts` est obligatoire pour `@thallesp/nestjs-better-auth`.
⚠️ Pas de `RouterModule` — inutile ici.

### `apps/api/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model user {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  sessions      session[]
  accounts      account[]
  profile       Profile?

  @@map("user")
}

model session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime
  updatedAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      user     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("session")
}

model account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  user      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime
  updatedAt             DateTime

  @@map("account")
}

model verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime?
  updatedAt  DateTime?

  @@map("verification")
}

model Profile {
  id             String         @id @default(cuid())
  userId         String         @unique
  user           user           @relation(fields: [userId], references: [id], onDelete: Cascade)
  birthDate      DateTime?
  gender         Gender?
  heightCm       Float?
  weightKg       Float?
  activityLevel  ActivityLevel?
  goal           Goal?
  tdeeKcal       Int?
  targetKcal     Int?
  targetProteinG Int?
  targetCarbsG   Int?
  targetFatG     Int?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum ActivityLevel {
  SEDENTARY
  LIGHTLY_ACTIVE
  MODERATELY_ACTIVE
  VERY_ACTIVE
  EXTRA_ACTIVE
}

enum Goal {
  LOSE_WEIGHT
  MAINTAIN
  GAIN_MUSCLE
}
```

### Migration Prisma

Créée et appliquée : `prisma/migrations/20260310091400_init_auth_profile/`

---

## Variables d'environnement ajoutées en P1

Dans `apps/api/.env` :

```
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
```

Dans `apps/api/src/config/env.schema.ts`, ajouter :

```ts
BETTER_AUTH_SECRET: z.string().min(32),
BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
```

---

## Endpoints Better Auth testés et fonctionnels

| Méthode | URL                       | Body                        | Notes                        |
| ------- | ------------------------- | --------------------------- | ---------------------------- |
| POST    | `/api/auth/sign-up/email` | `{ email, password, name }` | ✅                           |
| POST    | `/api/auth/sign-in/email` | `{ email, password }`       | ✅ — retourne cookie session |
| GET     | `/api/auth/get-session`   | —                           | ✅ — cookie requis           |
| POST    | `/api/auth/sign-out`      | —                           | ✅ — header `Origin` requis  |

⚠️ **`Origin` header obligatoire** sur toutes les requêtes POST — Better Auth protège contre le CSRF.
L'`Origin` doit correspondre à une valeur dans `trustedOrigins` de `auth.ts`.
En test depuis Insomnia/curl : ajouter `Origin: http://localhost:8081`.
En production depuis l'app mobile, Expo envoie automatiquement le bon `Origin`.

---

## Breaking changes documentés en P1

### `@thallesp/nestjs-better-auth` — double instance `@nestjs/core`

- **Symptôme** : `UnknownDependenciesException: ApplicationConfig at index [0]`
- **Cause** : pnpm installe des copies séparées de `@nestjs/core` pour le package et pour l'app
- **Fix** : `pnpm.overrides` dans `package.json` racine avec les versions NestJS explicites
- **⚠️ Syntaxe** : utiliser `"^11.0.0"` (version explicite) et non `"$@nestjs/core"` (qui cherche dans les deps racine)

### `@thallesp/nestjs-better-auth` — `forRoot` sans `disableGlobalAuthGuard`

- **Symptôme** : toutes les routes retournent 403 même sans authentification
- **Fix** : `AuthModule.forRoot({ auth, disableGlobalAuthGuard: true })`

### NestJS SWC builder — `outDir` hérité résolu depuis le mauvais répertoire

- **Symptôme** : fichiers compilés dans `packages/tsconfig/dist/` au lieu de `apps/api/dist/`
- **Cause** : NestJS CLI SWC résout `outDir` hérité depuis le fichier tsconfig parent (pas l'héritier)
- **Fix** : toujours déclarer `"outDir": "./dist"` **explicitement** dans `apps/api/tsconfig.json`
- **Contrairement à tsc** qui respecte la spec TypeScript et résout depuis le fichier héritier

### NestJS SWC builder — conflit ESM/CommonJS avec `.swcrc`

- **Symptôme** : `ERR_MODULE_NOT_FOUND` sur `instrument` — Node.js détecte le fichier comme ESM
- **Cause** : `.swcrc` avec `"module": { "type": "es6" }` — NestJS CLI lit `.swcrc` et produit de l'ESM
- **Solution théorique** : `swcOptions` dans `nest-cli.json` override `.swcrc` pour le NestJS CLI uniquement
- **Décision** : SWC abandonné pour l'instant — on reste sur tsc

### Prisma 7 — `provider = "prisma-client"` génère du TypeScript non compilé

- **Symptôme** : `Cannot find module '../../generated/prisma/client'` au runtime
- **Cause** : ce provider génère des `.ts` source — Node.js ne peut pas les charger directement
- **Fix** : utiliser `provider = "prisma-client-js"` (génère du `.js`) ou supprimer l'`output` custom
- **Décision** : suppression de l'output custom — import depuis `@prisma/client` standard

### Prisma 7 — `@prisma/client` doit être en `dependencies`

- **Mauvaise pratique** : le mettre en `devDependencies`
- **Fix** : `pnpm add @prisma/client --filter @cooked/api` (sans `-D`)

### Better Auth — `MISSING_OR_NULL_ORIGIN` sur les POST

- **Symptôme** : `403 Forbidden` avec `{ "code": "MISSING_OR_NULL_ORIGIN" }`
- **Cause** : protection CSRF de Better Auth — vérifie que l'`Origin` est dans `trustedOrigins`
- **Fix** : ajouter header `Origin: http://localhost:8081` dans Insomnia/curl
- En production depuis l'app mobile, Expo envoie automatiquement le bon `Origin`

---

## Prochaines étapes (dans l'ordre)

1. **p1-6c** — Installer TanStack Query v5 dans `apps/mobile`
2. **p1-2** — Écran Register (React Native)
3. **p1-3** — Écran Login + `@better-auth/expo` + `expo-secure-store`
4. **p1-4** — Middleware d'auth Expo Router
5. **p1-5** — Initialiser Sentry React Native
6. **p1-7** — Calcul automatique TDEE
7. **p1-8** — Écran Onboarding multi-étapes
8. **p1-9** — Écran Paramètres / Modifier profil

---

## Rappel — Breaking changes P0 (les plus importants)

- **Zod v4** : `z.prettifyError(error)` pour formatter, `error.issues` (pas `error.errors`)
- **SentryExceptionFilter** custom — incompatible avec Pino multi-transport (voir CONTEXT_phase_0.md)
- **APP_FILTER** = token importé de `@nestjs/core`, jamais la string
- **`bootstrap().catch(...)`** — jamais `void bootstrap()`
- **NativeWind v4** : tailwindcss v3 uniquement (pas v4)
- **Expo SDK 55** : New Architecture obligatoire, Expo Go APK SDK 55 depuis expo.dev/go
- **`--tunnel`** obligatoire sur tous les scripts dev mobile (WSL2)
- **`node-linker=hoisted`** dans `.npmrc` racine — obligatoire pour Gradle autolinking React Native dans monorepo pnpm
