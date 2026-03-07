# COOKED — Contexte projet

## Instructions pour Claude

- Prendre en compte TOUS les fichiers fournis en début de conversation
- Être factuel et critique — signaler ce qui est incorrect même si ça va dans le sens de l'utilisateur
- Tout détailler : fichiers créés, options, paramètres, raisons des choix
- Vérifier les versions des outils via web search avant de les prescrire (mars 2026)
- **Maintenir à jour à chaque fin de phase (ou quand pertinent) : CONTEXT.md, p0-setup-doc.html, stack-recap.html, dev-plan.html**
- La difficulté n'est pas un critère — on fait les choses bien
- Maximum de détail dans les réponses

## Objectif

App nutrition type MyFitnessPal. Projet d'apprentissage A→Z avec bonnes pratiques (Clean Code, sécurité, observabilité...). Potentiellement utilisé en production par d'autres personnes.

## Environnement

- OS : Windows + WSL2 Ubuntu 24.04 — TOUT le dev dans WSL2, jamais depuis Windows
- Shell : bash dans WSL2
- IDE : VS Code + extension Remote WSL
- Node : 24.14 LTS via fnm — `.nvmrc` contient `"24"`
- pnpm : 10.30.3
- Docker Desktop avec intégration WSL2
- Racine projet : /home/kylian/developpement/project/cooked
- Repo GitHub : **public** (important pour SonarCloud gratuit)

## Stratégie de branches — GitLab Flow (environment branches)

Décision : **GitLab Flow avec branches d'environnement**.

### Flux de code — unidirectionnel strict

```
feature/xxx → main → staging → production
```

On ne merge jamais en arrière. Un commit ne peut remonter la chaîne que vers l'avant.

### Branches permanentes et environnements associés

- `main` → environnement **develop** (intégration continue, toujours vert)
- `staging` → environnement **recette** (iso-prod, validation avant prod)
- `production` → environnement **prod**

### Règle de protection — aucun commit direct autorisé

Toutes les branches permanentes sont protégées. Le seul chemin possible est via PR avec CI verte :

- `feature/xxx` → PR → `main`
- `main` → PR → `staging`
- `staging` → PR → `production`

Pour un hotfix urgent : créer `hotfix/xxx` depuis `production`, PR sur `production`, puis reporter obligatoirement sur `main` (et `staging`) via PR séparée. Jamais de commit direct même pour un fix critique — c'est la règle qui empêche les régressions silencieuses au prochain déploiement.

### Démarrage progressif

Aujourd'hui (solo, pas de prod réelle) : seule `main` existe. Les branches `staging` et `production` seront ajoutées quand les environnements correspondants seront mis en place (P8+), sans changer de modèle ni de convention CI.

### Pourquoi pas les autres

- **Gitflow** : trop verbeux pour un projet solo, pensé pour des cycles de release longs sans CD
- **GitHub Flow** : pas conçu pour multi-environnements, forcerait une migration mid-project
- **Trunk-Based Development** : demande des feature flags et une maturité de test qu'on n'a pas encore besoin d'imposer

## Phase actuelle : P0 — EN COURS (11/18 tâches)

Voir dev-plan.html pour le plan complet P0→P8 et l'état détaillé de chaque tâche.

## État P0 — EN COURS ⏳

### Tâches terminées

- [x] Monorepo Turborepo 2.8.13 + pnpm 10.30.3 workspaces
- [x] packages/tsconfig, packages/eslint-config (index.js + index.d.ts), packages/shared
- [x] NestJS ^11.0.0 scaffoldé dans apps/api
- [x] Docker Compose : postgres:18-alpine (18.3 GA) + redis:8-alpine, healthchecks
- [x] Husky 9.1.7 + lint-staged 16.3.2 (--max-warnings=0) + commitlint 20.4.3
- [x] ESLint 10.0.2 flat config — config CLI NestJS (recommendedTypeChecked + projectService)
- [x] Vitest 3.2.4 + SWC — décorateurs NestJS OK, module: es6 aligné sur les deux configs
- [x] Prisma 7.4.2 — prisma.config.ts + schema.prisma vide
- [x] @nestjs/config 4.0.3 + Zod 4.3.6 — validateEnv au boot
- [x] nestjs-pino 4.6.0 + pino-http 11 — JSON structuré, pino-pretty en dev
- [x] Sentry @sentry/nestjs + @sentry/profiling-node 10.42.0 — installé, DSN vide (désactivé)
- [x] GitHub Actions CI — lint + typecheck + test

### Tâches restantes (à faire dans la prochaine session)

- [ ] P0-06 : SonarCloud — non intégré, SONAR_TOKEN manquant
- [ ] P0-07 : Secrets GitHub Actions — SUPABASE_URL, RAILWAY_TOKEN, EAS_TOKEN, SONAR_TOKEN
- [ ] P0-08 : App Expo SDK 51+ Managed Workflow — apps/mobile/ vide
- [ ] P0-09 : Expo Router — file-based routing (dépend P0-08)
- [ ] P0-10 : NativeWind — Tailwind sur React Native (dépend P0-08)
- [ ] P0-11 : Test sur émulateur Android via Expo Go (dépend P0-08 à P0-10)
- [ ] P0-16 : Pino → Axiom — pino-axiom transport non configuré, logs non envoyés vers Axiom
- [ ] P0-17 : Sentry DSN — créer le projet sentry.io + renseigner SENTRY_DSN dans .env

## Structure complète du monorepo

```
cooked/
├── .github/workflows/ci.yml
├── .husky/
│   ├── commit-msg          → pnpm exec commitlint --edit "$1"
│   └── pre-commit          → pnpm exec lint-staged
├── apps/
│   ├── api/                → @cooked/api (NestJS)
│   │   ├── generated/prisma/   ← client Prisma 7 (gitignored)
│   │   ├── prisma/
│   │   │   └── schema.prisma   ← vide, modèles en P1+
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── env.schema.ts
│   │   │   │   └── env.validation.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.controller.spec.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.service.ts
│   │   │   ├── instrument.ts   ← Sentry.init() — PREMIER import main.ts
│   │   │   └── main.ts
│   │   ├── test/app.e2e-spec.ts
│   │   ├── .env               (gitignored)
│   │   ├── .env.template
│   │   ├── .gitignore
│   │   ├── .swcrc
│   │   ├── eslint.config.mjs
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── prisma.config.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── vitest.config.ts
│   │   └── vitest.e2e.config.ts
│   ├── mobile/             → VIDE (Expo — P0-08 à P0-11, tâches restantes)
│   └── web/                → VIDE (React+Vite — P8)
├── docs/
│   ├── CONTEXT.md
│   ├── dev-plan.html
│   ├── p0-setup-doc.html
│   └── stack-recap.html
├── packages/
│   ├── eslint-config/      → @cooked/eslint-config (index.js + index.d.ts)
│   ├── shared/             → @cooked/shared (src/index.ts)
│   └── tsconfig/           → @cooked/tsconfig (base.json, node.json, react.json)
├── .gitignore              ← inclut *:Zone.Identifier
├── .npmrc
├── .nvmrc                  ← "24"
├── .prettierignore
├── .prettierrc
├── commitlint.config.js
├── docker-compose.yml
├── eslint.config.mjs
├── package.json            ← name:cooked, packageManager:pnpm@10.30.3
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json
```

## Fichiers de configuration — racine

### package.json (racine)

```json
{
  "name": "cooked",
  "private": true,
  "packageManager": "pnpm@10.30.3",
  "scripts": {
    "dev:api": "turbo run dev --filter=@cooked/api",
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "prepare": "husky"
  },
  "engines": { "node": ">=22", "pnpm": ">=10" },
  "devDependencies": {
    "@cooked/eslint-config": "workspace:*",
    "@cooked/tsconfig": "workspace:*",
    "@commitlint/cli": "^20.4.3",
    "@commitlint/config-conventional": "^20.4.3",
    "@eslint/js": "^10.0.1",
    "eslint": "^10.0.2",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.5",
    "globals": "^17.4.0",
    "husky": "^9.1.7",
    "lint-staged": "^16.3.2",
    "prettier": "^3.8.1",
    "turbo": "^2.8.13",
    "typescript-eslint": "^8.56.1"
  },
  "lint-staged": {
    "**/*.{ts,tsx}": ["pnpm exec eslint --fix --max-warnings=0", "pnpm exec prettier --write"],
    "**/*.{js,mjs,json,md,yml,yaml}": ["pnpm exec prettier --write"]
  }
}
```

### turbo.json

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"] },
    "dev": { "persistent": true, "cache": false },
    "lint": { "outputs": [] },
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "test": {
      "outputs": [],
      "inputs": ["src/**/*.ts", "test/**/*.ts", "vitest.config.ts", "vitest.e2e.config.ts"]
    }
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - apps/*
  - packages/*
ignoredBuiltDependencies:
  - "@prisma/engines"
  - "@sentry-internal/node-cpu-profiler"
  - "@swc/core"
  - prisma
```

⚠️ `ignoredBuiltDependencies` = **blacklist** (ces packages NE lancent PAS leur postinstall)
≠ `onlyBuiltDependencies` = **whitelist** (SEULS ceux-là PEUVENT lancer leur postinstall)

### .npmrc

```
shamefully-hoist=false
strict-peer-dependencies=false
link-workspace-packages=true
```

### .prettierrc

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

### .prettierignore

```
node_modules / dist / build / .turbo / coverage / pnpm-lock.yaml / *.generated.ts
```

### eslint.config.mjs (racine)

```js
// @ts-check
import { baseConfig } from "@cooked/eslint-config";
export default baseConfig;
```

### docker-compose.yml

- `postgres:18-alpine` — container: cooked_postgres, user/pass: cooked/cooked_dev, db: cooked_db, port: 5432
- `redis:8-alpine` — container: cooked_redis, pass: cooked_dev, port: 6379, `--appendonly yes`
- Named volumes: cooked_postgres_data, cooked_redis_data — healthchecks sur les deux

### commitlint.config.js

Types : feat, fix, chore, docs, style, refactor, test, perf, ci, build, revert
subject-case: lower-case, subject-max-length: 100

## Fichiers de configuration — apps/api

### package.json (@cooked/api)

```json
{
  "name": "@cooked/api",
  "version": "0.0.1",
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "vitest run --config vitest.e2e.config.ts",
    "test:cov": "vitest run --coverage",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.3",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@prisma/client": "^7.4.2",
    "@sentry/nestjs": "^10.42.0",
    "@sentry/profiling-node": "^10.42.0",
    "nestjs-pino": "^4.6.0",
    "pino-http": "^11.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@cooked/eslint-config": "workspace:*",
    "@cooked/tsconfig": "workspace:*",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@swc/core": "^1.15.18",
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/supertest": "^7.2.0",
    "dotenv": "^17.3.1",
    "pino-pretty": "^13.1.3",
    "prisma": "^7.4.2",
    "supertest": "^7.2.2",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.56.1",
    "unplugin-swc": "^1.5.9",
    "vitest": "^3.0.0"
  }
}
```

### tsconfig.json (IDE — inclut tests)

```json
{
  "extends": "@cooked/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": { "@cooked/shared": ["../../packages/shared/src/index.ts"] },
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*", "test/**/*"]
}
```

### tsconfig.build.json (nest build — exclut tests)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "rootDir": "./src" },
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts", "**/*.e2e-spec.ts"]
}
```

### .swcrc

```json
{
  "jsc": {
    "parser": { "syntax": "typescript", "decorators": true, "dynamicImport": true },
    "transform": { "decoratorMetadata": true, "legacyDecorator": true },
    "target": "es2022",
    "keepClassNames": true
  },
  "module": { "type": "es6" }
}
```

### vitest.config.ts (tests unitaires)

```ts
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    exclude: ["test/**/*", "node_modules/**/*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/**/*.module.ts", "src/main.ts"],
    },
  },
});
```

### vitest.e2e.config.ts ✅ corrigé

```ts
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })], // aligné sur vitest.config.ts et .swcrc
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.e2e-spec.ts"],
    testTimeout: 30000,
  },
});
```

### eslint.config.mjs (apps/api)

```js
// @ts-check
import { baseConfig } from "@cooked/eslint-config";
import tseslint from "typescript-eslint";
export default tseslint.config(...baseConfig, {
  rules: {
    "@typescript-eslint/no-empty-function": "off", // lifecycle methods NestJS
    "@typescript-eslint/no-extraneous-class": "off", // module classes NestJS
  },
});
```

### nest-cli.json

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "tsConfigPath": "tsconfig.build.json",
    "deleteOutDir": true,
    "assets": ["**/*.json"],
    "watchAssets": true
  }
}
```

### prisma.config.ts (Prisma 7 — à la racine de apps/api/)

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") }, // env() throw si DATABASE_URL absent
});
```

### prisma/schema.prisma (vide — modèles en P1+)

```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  // Pas de url ici en Prisma 7 — géré par prisma.config.ts
}
```

### .env (dev local, gitignored)

```
PORT=3000 / NODE_ENV=development
DATABASE_URL="postgresql://cooked:cooked_dev@localhost:5432/cooked_db"
REDIS_HOST=localhost / REDIS_PORT=6379 / REDIS_PASSWORD=cooked_dev
SENTRY_DSN=
```

### .gitignore (apps/api)

```
node_modules
.env
/generated/prisma
generated/
```

## Fichiers source — apps/api/src

### instrument.ts — PREMIER import dans main.ts

```ts
import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
Sentry.init({
  dsn: process.env["SENTRY_DSN"] || undefined,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: process.env["NODE_ENV"] === "production" ? 0.1 : 1.0,
  profilesSampleRate: 1.0,
  environment: process.env["NODE_ENV"] || "development",
  enabled: !!process.env["SENTRY_DSN"], // désactivé si pas de DSN
});
```

### main.ts

```ts
import "./instrument"; // DOIT être absolument en premier
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger as PinoLogger } from "nestjs-pino";
import { AppModule } from "./app.module";
import type { EnvSchema } from "./config/env.schema";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger)); // bufferLogs + useLogger toujours ensemble
  const configService = app.get(ConfigService<EnvSchema>);
  const port = configService.get("PORT", { infer: true });
  await app.listen(port ?? 3000);
  const logger = new Logger("Bootstrap");
  logger.log(`API running on port ${port}`);
  logger.log(`Environment: ${configService.get("NODE_ENV", { infer: true })}`);
}
bootstrap();
```

### app.module.ts

```ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { validateEnv } from "./config/env.validation";
import type { EnvSchema } from "./config/env.schema";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env", validate: validateEnv }),
    SentryModule.forRoot(), // AVANT LoggerModule
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema>) => {
        const isDev = config.get("NODE_ENV", { infer: true }) === "development";
        return {
          pinoHttp: {
            transport: isDev
              ? {
                  target: "pino-pretty",
                  options: {
                    colorize: true,
                    translateTime: "HH:MM:ss",
                    ignore: "pid,hostname,req,res",
                  },
                }
              : undefined,
            level: isDev ? "debug" : "info",
            base: isDev ? undefined : { env: "production" },
            customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
            customErrorMessage: (req, res, err) =>
              `${req.method} ${req.url} ${res.statusCode} — ${err.message}`,
            autoLogging: { ignore: (req) => req.url === "/health" },
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### config/env.schema.ts (Zod v4)

```ts
import { z } from "zod";
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().regex(/^\d+$/).default("3000").transform(Number),
  DATABASE_URL: z
    .url("DATABASE_URL doit être une URL valide")
    .refine((url) => url.startsWith("postgresql://"), "Doit commencer par postgresql://"),
  REDIS_HOST: z.string().min(1, "REDIS_HOST est requis"),
  REDIS_PORT: z.string().regex(/^\d+$/).default("6379").transform(Number),
  REDIS_PASSWORD: z.string().min(1, "REDIS_PASSWORD est requis"),
  SENTRY_DSN: z.string().url().optional().or(z.literal("")),
});
export type EnvSchema = z.infer<typeof envSchema>;
```

### config/env.validation.ts

```ts
import { z } from "zod";
import { envSchema } from "./env.schema";
export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      `\n❌ Variables d'environnement invalides :\n${z.prettifyError(result.error)}\n`,
    );
  }
  return result.data;
}
```

## Import Prisma Client — BREAKING CHANGE Prisma 7

```ts
// ❌ Prisma < 7 (ne plus utiliser)
import { PrismaClient } from "@prisma/client";

// ✅ Prisma 7 — client dans generated/prisma/
import { PrismaClient } from "../generated/prisma";
// depuis src/xxx/ : import { PrismaClient } from '../../generated/prisma'
```

Le dossier `generated/` est gitignored — regénéré via `postinstall: prisma generate`.

## GitHub Actions CI

Fichier `.github/workflows/ci.yml` — variables fictives obligatoires pour `prisma generate` :

```yaml
env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cooked_ci
  REDIS_HOST: localhost
  REDIS_PORT: "6379"
  REDIS_PASSWORD: placeholder
```

`concurrency.cancel-in-progress: true` — annule les runs en cours sur nouveau push.
Steps : checkout → setup pnpm (lit packageManager) → setup node (lit .nvmrc) → install --frozen-lockfile → lint → typecheck → test
`fetch-depth: 0` — obligatoire pour SonarCloud (analyse différentielle).
`timeout-minutes: 15` — évite les runs bloqués indéfiniment.

Steps : checkout (fetch-depth:0) → setup pnpm (lit packageManager) → setup node (lit .nvmrc)
→ install --frozen-lockfile → lint → typecheck → test → coverage LCOV → SonarCloud scan

Les `env` sont au niveau du **job** (pas du workflow) — volontaire : les variables ne sont
nécessaires que pour ce job, pas à l'échelle globale du fichier.

## Breaking changes documentés

### Prisma 7

- `url = env(...)` supprimé de `schema.prisma` → dans `prisma.config.ts` via `env()` de `prisma/config`
- Client généré dans `generated/prisma/` (pas `node_modules/@prisma/client`)
- `prisma migrate dev` et `db push` ne lancent plus `prisma generate` auto
- `env()` throw si variable absente — problème CI → var fictive dans le job

### Zod v4

- `error.errors` → `error.issues`
- `z.string().url()` → `z.url()` (top-level)
- `z.string().startsWith()` → `.refine()`
- `z.prettifyError(error)` pour formatter les erreurs

### ESLint v10

- `.eslintrc` définitivement supprimé → uniquement flat config `eslint.config.mjs`
- Config CLI NestJS conservée (`recommendedTypeChecked` + `projectService`) — plus complète
- Ne jamais mettre `"prettier/prettier": ["error", { endOfLine: "auto" }]` → écrase `.prettierrc`

### Vitest + NestJS

- esbuild (défaut Vitest) ne supporte pas `emitDecoratorMetadata` → injection NestJS silencieusement cassée
- Fix : `unplugin-swc` + `@swc/core`, `module: { type: 'es6' }` dans `swc.vite()` — les DEUX configs vitest utilisent es6

### pnpm 10

- `ignoredBuiltDependencies` ≠ `onlyBuiltDependencies` (sémantique inversée)

## Conventions

- Conventional Commits : feat/fix/chore/docs/style/refactor/test/perf/ci/build/revert
- `.env.template` (pas `.env.example`)
- BDD locale = Docker en dev / Supabase = staging+prod uniquement
- **Jamais `console.log`** dans NestJS → toujours `Logger` de `@nestjs/common`
- `--max-warnings=0` ESLint — les warnings bloquent les commits
- `instrument.ts` TOUJOURS premier import dans `main.ts`
- `bufferLogs: true` + `app.useLogger(app.get(PinoLogger))` — toujours ensemble
- `SentryModule.forRoot()` AVANT `LoggerModule` dans `app.module.ts`
- Branching : GitLab Flow — `main`/`staging`/`production` protégées, merge unidirectionnel strict, aucun commit direct sur les branches permanentes
