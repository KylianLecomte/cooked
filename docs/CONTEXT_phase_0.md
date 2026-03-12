# COOKED — Contexte projet (Phase 0)

## Instructions pour Claude

- Prendre en compte TOUS les fichiers fournis en début de conversation
- Être factuel et critique — signaler ce qui est incorrect même si ça va dans le sens de l'utilisateur
- Tout détailler : fichiers créés, options, paramètres, raisons des choix
- Vérifier les versions des outils via web search avant de les prescrire (mars 2026)
- **Maintenir à jour : CONTEXT_phase_0.md, CONTEXT_phase_1.md, dev-plan.html, stack-recap.html**
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

## Architecture d'hébergement

### Local (dev)

```
WSL2
├── NestJS (pnpm dev)
├── Docker : postgres:18-alpine  ←── Prisma (DATABASE_URL=postgresql://cooked:cooked_dev@localhost:5432/cooked_db)
└── Docker : redis:8-alpine      ←── NestJS Cache (REDIS_URL=redis://:cooked_dev@localhost:6379)
```

### Staging / Production (Railway)

```
Railway
├── Service NestJS      — déployé depuis GitHub, auto-deploy sur merge
├── Service PostgreSQL  — managé Railway, DATABASE_URL injecté automatiquement
└── Service Redis       — managé Railway, REDIS_URL injecté automatiquement
```

Tout au même endroit : un seul dashboard, variables d'env partagées entre services automatiquement, latence interne optimale (pas de réseau externe entre NestJS et sa BDD).

### Note — Neon (alternative future pour PostgreSQL)

**Neon** est un PostgreSQL serverless avec **database branching** : pour chaque PR, Neon crée automatiquement une copie isolée de la BDD de staging. Les migrations Prisma sont testées dessus, la branche est détruite après merge. Free tier : 10 GB, pas de pause.

Pourquoi on ne l'utilise pas maintenant : la valeur réelle n'apparaît qu'en P7+ avec des migrations Prisma non triviales. Railway PostgreSQL suffit largement jusque-là. Migration vers Neon = juste changer `DATABASE_URL`. À reconsidérer quand les migrations deviennent un sujet.

## Auth — Better Auth

**Décision : Better Auth** — Supabase Auth retiré de la stack.

### Pourquoi pas Supabase Auth

Supabase Auth brille quand le client se connecte directement à la BDD via SDK Supabase avec Row Level Security. Dans notre architecture, toutes les requêtes passent par NestJS → Prisma. Le RLS n'apporte rien. L'intégration se réduirait à valider un JWT + synchroniser les users dans Prisma — sans aucune synergie réelle avec le reste de Supabase.

### Pourquoi Supabase PostgreSQL est aussi retiré

Supabase n'avait plus qu'un seul rôle : héberger PostgreSQL. Inconvénient concret sur le free tier : projet pausé après 1 semaine sans activité, relance manuelle requise. Avec Supabase Auth retiré, aucune raison de maintenir un provider séparé juste pour le Postgres quand Railway peut tout héberger au même endroit.

### Pourquoi Better Auth

- S'installe directement dans NestJS — aucun service externe
- Users stockés dans **ta** table `users` Prisma — zéro synchronisation avec un provider tiers
- `@better-auth/expo` pour le mobile
- Open-source, zéro vendor lock-in, zéro pricing lié aux MAU
- Cohérent architecturalement avec NestJS + Prisma

### Pourquoi pas Clerk

Clerk est valide (excellent support Expo, composants UI prêts à l'emploi) mais introduit un vendor externe pour quelque chose que Better Auth fait en interne. Devient payant au-delà de 10k MAU. Better Auth apporte plus de valeur pédagogique dans ce contexte.

## Phase actuelle : P1 — EN COURS

P0 terminée à 18/18 tâches. Voir dev-plan.html pour le plan complet P0→P8.

## État P0 — TERMINÉ ✅ (18/18 tâches)

- [x] Monorepo Turborepo 2.8.13 + pnpm 10.30.3 workspaces
- [x] packages/tsconfig, packages/shared
- [x] NestJS ^11.0.1 scaffoldé dans apps/api
- [x] Docker Compose : postgres:18-alpine (18.3 GA) + redis:8-alpine, healthchecks
- [x] Husky 9.1.7 + lint-staged 16.3.2 + commitlint 20.4.3
- [x] **Biome 2.4.6** — linting + formatting (remplace ESLint + Prettier)
- [x] Vitest **4.0.x** + SWC + **@vitest/coverage-v8@^4.0.0** — décorateurs NestJS OK, coverage.include explicite
- [x] Prisma 7.5.0 — prisma.config.ts + schema.prisma
- [x] @nestjs/config 4.0.3 + Zod 4.3.6 — validateEnv au boot
- [x] nestjs-pino 4.6.0 + pino-http 11 — JSON structuré, pino-pretty en dev
- [x] **P0-06** : SonarCloud intégré — sonarqube-scan-action@v7, sonar-project.properties, Automatic Analysis désactivé
- [x] **P0-07** : SONAR_TOKEN ajouté dans les secrets GitHub (autres secrets ajoutés phase par phase)
- [x] **P0-08** : App Expo SDK 55 Managed Workflow — apps/mobile/@cooked/mobile
- [x] **P0-09** : Expo Router v55 — file-based routing, app/\_layout.tsx + app/index.tsx
- [x] **P0-10** : NativeWind v4 + tailwindcss v3 + react-native-css-interop
- [x] **P0-11** : App testée sur appareil Android via Expo Go APK SDK 55 (tunnel WSL2)
- [x] **P0-16** : Pino → Axiom — @axiomhq/pino transport configuré, logs JSON envoyés vers Axiom en production
- [x] **P0-17** : Sentry DSN configuré — SentryExceptionFilter custom (pas SentryGlobalFilter), dotenv preload dans instrument.ts

## Structure complète du monorepo

```
cooked/
├── .github/workflows/ci.yml
├── .husky/
│   ├── commit-msg          → pnpm exec commitlint --edit "$1"
│   └── pre-commit          → pnpm lint-staged
├── .vscode/
│   ├── extensions.json     ← biomejs.biome + tailwind css intellisense
│   └── settings.json       ← Biome formatter + CSS validation off + Tailwind IntelliSense
├── apps/
│   ├── api/                → @cooked/api (NestJS)
│   │   ├── generated/prisma/   ← client Prisma 7 (gitignored)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   ← modèles User, Session, Account, Verification, Profile
│   │   │   └── migrations/     ← migrations Prisma
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   └── auth.ts          ← config Better Auth
│   │   │   ├── config/
│   │   │   │   ├── env.schema.ts
│   │   │   │   └── env.validation.ts
│   │   │   ├── filter/
│   │   │   │   └── sentry-exception.filter.ts  ← filtre custom Sentry (pas SentryGlobalFilter)
│   │   │   ├── logger/
│   │   │   │   └── logger.config.ts  ← interface LoggerConfigOptions + buildPinoConfig()
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.instance.ts ← instance unique PrismaClient (partagée auth + service)
│   │   │   │   ├── prisma.module.ts
│   │   │   │   └── prisma.service.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.controller.spec.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.service.ts
│   │   │   ├── instrument.ts   ← dotenv.config() + Sentry.init() — PREMIER import main.ts
│   │   │   └── main.ts
│   │   ├── test/app.e2e-spec.ts
│   │   ├── .env               (gitignored)
│   │   ├── .env.template
│   │   ├── .gitignore
│   │   ├── .swcrc             ← utilisé uniquement par Vitest (unplugin-swc), pas par le build NestJS
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── prisma.config.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── vitest.config.ts
│   │   └── vitest.e2e.config.ts
│   └── mobile/             → @cooked/mobile (Expo SDK 55)
│       ├── .expo/          ← gitignored, généré par Expo CLI
│       ├── app/
│       │   ├── _layout.tsx ← layout racine Expo Router (Stack)
│       │   └── index.tsx   ← écran d'accueil temporaire P0
│       ├── assets/         ← icônes, splash, favicon
│       ├── app.json
│       ├── babel.config.js
│       ├── eas.json
│       ├── expo-env.d.ts   ← généré par Expo (gitignored)
│       ├── global.css      ← @tailwind base/components/utilities
│       ├── metro.config.js
│       ├── nativewind-env.d.ts
│       ├── package.json
│       ├── tailwind.config.js
│       └── tsconfig.json
├── docs/
│   ├── CONTEXT_phase_0.md  ← CE FICHIER
│   ├── CONTEXT_phase_1.md
│   ├── dev-plan.html
│   ├── p0-setup-doc.html
│   └── stack-recap.html
├── maquettes/
│   ├── cooked-mockups-final.html
│   ├── cooked-mockups-v4-complete.html
│   └── cooked-styles.html
├── packages/
│   ├── shared/             → @cooked/shared (src/index.ts)
│   └── tsconfig/           → @cooked/tsconfig (base.json, node.json, react.json)
├── .gitignore              ← inclut *:Zone.Identifier, generated/, package-lock.json
├── .npmrc
├── .nvmrc                  ← "24"
├── biome.json              ← config Biome (linter + formatter)
├── commitlint.config.js
├── docker-compose.yml
├── package.json            ← name:cooked, packageManager:pnpm@10.30.3, pnpm.overrides NestJS
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── sonar-project.properties
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
    "dev": "turbo dev",
    "dev:api": "turbo run dev --filter=@cooked/api",
    "dev:mobile": "pnpm --filter @cooked/mobile dev",
    "build": "turbo build",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --write .",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "prepare": "husky"
  },
  "engines": { "node": ">=22", "pnpm": ">=10" },
  "pnpm": {
    "overrides": {
      "@nestjs/core": "^11.0.0",
      "@nestjs/common": "^11.0.0",
      "@nestjs/platform-express": "^11.0.0"
    }
  },
  "devDependencies": {
    "@biomejs/biome": "2.4.6",
    "@commitlint/cli": "^20.4.3",
    "@commitlint/config-conventional": "^20.4.3",
    "@cooked/tsconfig": "workspace:*",
    "husky": "^9.1.7",
    "lint-staged": "^16.3.2",
    "turbo": "^2.8.13"
  },
  "lint-staged": {
    "**/*.{ts,tsx,js,jsx,mjs,cjs,json}": [
      "pnpm exec biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

**`pnpm.overrides`** : force une instance unique de `@nestjs/core`, `@nestjs/common` et `@nestjs/platform-express` dans tout le monorepo. Sans ça, pnpm installe des copies séparées pour les packages tiers (ex: `@thallesp/nestjs-better-auth`) ce qui cause l'erreur `UnknownDependenciesException: ApplicationConfig at index [0]`. Utiliser des versions explicites (`"^11.0.0"`) et non la syntaxe `"$@nestjs/core"` (qui cherche dans les deps racine — il n'y en a pas ici).

### turbo.json

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"] },
    "dev": { "persistent": true, "cache": false },
    "lint": { "outputs": [], "cache": false },
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
  - "@nestjs/core"
  - "@prisma/engines"
  - "@sentry-internal/node-cpu-profiler"
  - "@swc/core"
  - esbuild
  - prisma
```

⚠️ `ignoredBuiltDependencies` = **blacklist** (ces packages NE lancent PAS leur postinstall)
≠ `onlyBuiltDependencies` = **whitelist** (SEULS ceux-là PEUVENT lancer leur postinstall)

### .npmrc

```
shamefully-hoist=false
strict-peer-dependencies=false
link-workspace-packages=true
node-linker=hoisted
```

`node-linker=hoisted` — obligatoire pour Gradle autolinking React Native dans monorepo pnpm. Sans ça, le build Android ne trouve pas les modules React Native.

### biome.json

Biome 2.4.6 remplace ESLint + Prettier depuis la fin de P0.

Points importants :
- `"recommended": false` — on sélectionne manuellement les règles pour garder le contrôle
- `"noExplicitAny": "error"` — interdit `any` dans tout le code
- `"noConsole": "warn"` — rappelle d'utiliser `Logger` NestJS côté API
- Override TypeScript : désactive les règles que tsc gère déjà nativement (`noConstAssign`, etc.)
- `"noUnusedExpressions": "off"` — nécessaire pour les décorateurs NestJS
- `includes` linter exclut les fichiers de config (`*.config.js`, `commitlint.config.js`)
- `includes` formatter exclut `node_modules`, `dist`, `.turbo`, `coverage`, `pnpm-lock.yaml`
- Assist activé avec `organizeImports: "on"` — réorganise les imports à la sauvegarde

### sonar-project.properties (racine)

```properties
sonar.projectKey=KylianLecomte_cooked
sonar.organization=cooked

sonar.projectName=cooked

sonar.sources=apps/api/src,packages/shared/src
sonar.tests=apps/api/src,apps/api/test
sonar.test.inclusions=**/*.spec.ts,**/*.e2e-spec.ts
sonar.typescript.lcov.reportPaths=apps/api/coverage/lcov.info

sonar.exclusions=\
  **/node_modules/**,\
  **/dist/**,\
  **/generated/**,\
  **/coverage/**,\
  **/*.module.ts,\
  **/main.ts,\
  **/instrument.ts,\
  apps/mobile/**,\
  apps/web/**

sonar.sourceEncoding=UTF-8
```

### .vscode/settings.json

```json
{
  "css.validate": false,
  "css.lint.unknownAtRules": "ignore",
  "editor.quickSuggestions": { "strings": true },
  "tailwindCSS.experimental.classRegex": [
    ["className=\"([^\"]*)", "([^\"']*)"],
    ["className='([^']*)", "([^\"']*)"]
  ],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": { "editor.defaultFormatter": "biomejs.biome" },
  "[typescriptreact]": { "editor.defaultFormatter": "biomejs.biome" },
  "[javascript]": { "editor.defaultFormatter": "biomejs.biome" },
  "[json]": { "editor.defaultFormatter": "biomejs.biome" },
  "[jsonc]": { "editor.defaultFormatter": "biomejs.biome" }
}
```

### .vscode/extensions.json

```json
{
  "recommendations": ["biomejs.biome", "bradlc.vscode-tailwind-css"]
}
```

### docker-compose.yml

- `postgres:18-alpine` — container: cooked_postgres, user/pass: cooked/cooked_dev, db: cooked_db, port: 5432
- `redis:8-alpine` — container: cooked_redis, pass: cooked_dev, port: 6379, `--appendonly yes`
- Named volumes: cooked_postgres_data, cooked_redis_data — healthchecks sur les deux

### commitlint.config.js

Types : feat, fix, chore, docs, style, refactor, test, perf, ci, build, revert
subject-case: lower-case, subject-max-length: 100

**Convention importante** : les noms de techno s'écrivent en minuscules dans les commits — `expo`, `nativewind`, `nestjs` et non `Expo`, `NativeWind`, `NestJS`. La règle `subject-case: lower-case` est intentionnelle et ne doit pas être désactivée.

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
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "vitest run --config vitest.e2e.config.ts",
    "test:cov": "vitest run --coverage",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@axiomhq/pino": "^1.4.0",
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.3",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@prisma/adapter-pg": "^7.5.0",
    "@prisma/client": "^7.5.0",
    "@sentry/nestjs": "^10.42.0",
    "@sentry/profiling-node": "^10.42.0",
    "@thallesp/nestjs-better-auth": "^2.5.1",
    "better-auth": "^1.5.5",
    "nestjs-pino": "^4.6.0",
    "pg": "^8.20.0",
    "pino": "^10.3.1",
    "pino-http": "^11.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@cooked/tsconfig": "workspace:*",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "@swc/core": "^1.15.18",
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/supertest": "^7.2.0",
    "@vitest/coverage-v8": "^4.0.18",
    "dotenv": "^17.3.1",
    "pino-pretty": "^13.1.3",
    "prisma": "^7.5.0",
    "supertest": "^7.2.2",
    "typescript": "^5.7.0",
    "unplugin-swc": "^1.5.9",
    "vitest": "^4.0.18"
  }
}
```

⚠️ `vitest` et `@vitest/coverage-v8` doivent toujours être sur la **même version majeure**.
⚠️ `@swc/core` est en devDependencies pour Vitest (`unplugin-swc`), pas pour le build NestJS (tsc).
⚠️ `@prisma/client` doit être en **`dependencies`** (runtime), pas `devDependencies`.

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
      exclude: ["src/**/*.spec.ts", "src/**/*.module.ts", "src/main.ts", "src/instrument.ts"],
    },
  },
});
```

### vitest.e2e.config.ts (tests e2e)

```ts
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.e2e-spec.ts"],
    testTimeout: 30000,
  },
});
```

### tsconfig.json (apps/api)

```json
{
  "extends": "@cooked/tsconfig/node.json",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@cooked/shared": ["../../packages/shared/src/index.ts"]
    },
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*", "test/**/*"]
}
```

⚠️ `"rootDir"` et `"outDir"` sont **hérités** de `@cooked/tsconfig/node.json`. Ne pas les redéclarer sauf si nécessaire.

### tsconfig.build.json (apps/api)

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts", "**/*.e2e-spec.ts", "generated"]
}
```

`"generated"` est exclu du build — le client Prisma est déjà compilé.

### nest-cli.json (apps/api)

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

⚠️ Pas de `"builder": "swc"` — on utilise tsc. SWC a été tenté mais abandonné (conflits ESM/CommonJS entre NestJS CLI et Vitest).

### .swcrc (apps/api)

```json
{
  "jsc": {
    "target": "es2022",
    "keepClassNames": true,
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    }
  },
  "module": {
    "type": "es6"
  }
}
```

Ce fichier est **uniquement utilisé par Vitest** via `unplugin-swc`. Le build NestJS utilise tsc et ne lit pas `.swcrc`.

`decoratorMetadata: true` est obligatoire — sans ça, l'injection de dépendances NestJS échoue silencieusement dans les tests.

### prisma.config.ts (apps/api)

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

⚠️ Prisma 7 : `url = env(...)` retiré de `schema.prisma`, désormais dans `prisma.config.ts`. `env()` throw si variable absente — variable fictive `DATABASE_URL` dans le CI.

### packages/tsconfig configs

**base.json** : `strict`, `esModuleInterop`, `skipLibCheck`, `forceConsistentCasingInFileNames`, `resolveJsonModule`, `moduleDetection: "force"`, `isolatedModules: true`

**node.json** : extends base + `target: ES2022`, `module: commonjs`, `lib: [ES2022]`, `outDir: dist`, `declaration`, `declarationMap`, `sourceMap`, `experimentalDecorators`, `emitDecoratorMetadata`

**react.json** : extends base + `target: ES2020`, `module: ESNext`, `moduleResolution: bundler`, `lib: [ES2020, DOM, DOM.Iterable]`, `jsx: react-jsx`, `noEmit: true`

## Fichiers source — apps/api/src

Voir CONTEXT_phase_1.md pour le détail de tous les fichiers source.

## GitHub Actions CI

Fichier `.github/workflows/ci.yml` — voir contenu dans la section CI de CONTEXT_phase_1.md.

Points importants :
- `pnpm exec biome ci .` — Biome (pas ESLint)
- `fetch-depth: 0` — obligatoire pour SonarCloud
- `sonarqube-scan-action@v7` (pas `sonarcloud-github-action` — archivé oct. 2025)

## Secrets GitHub Actions

| Secret               | Ajouté | Phase                                 |
| -------------------- | ------ | ------------------------------------- |
| `SONAR_TOKEN`        | ✅     | P0-06                                 |
| `AXIOM_TOKEN`        | ✅     | P0-16                                 |
| `AXIOM_DATASET`      | ✅     | P0-16                                 |
| `SENTRY_DSN`         | ✅     | P0-17                                 |
| `RAILWAY_TOKEN`      | ❌     | P8                                    |
| `DATABASE_URL`       | ❌     | P1+ (Railway PostgreSQL staging/prod) |
| `REDIS_URL`          | ❌     | P1+ (Railway Redis staging/prod)      |
| `BETTER_AUTH_SECRET` | ❌     | P1+                                   |
| `EAS_TOKEN`          | ❌     | P8                                    |

## Breaking changes documentés

### Biome (remplace ESLint + Prettier)

- Biome 2.4.6 — un seul outil pour lint + format
- `@cooked/eslint-config` supprimé, `packages/eslint-config/` supprimé
- `.prettierrc` et `.prettierignore` supprimés
- lint-staged : `biome check --write` au lieu de `eslint --fix` + `prettier --write`
- CI : `pnpm exec biome ci .` au lieu de `pnpm turbo lint`

### Sentry + Pino multi-transport (production)

- `SentryGlobalFilter` ne fonctionne pas avec Pino multi-transport en production
- Cause : `pino-http` avec `targets` spawn des **worker threads** qui cassent l'`AsyncLocalStorage` d'OpenTelemetry
- Fix : `SentryExceptionFilter` custom avec `Sentry.captureException()` manuel

### Timing dotenv dans instrument.ts

- `instrument.ts` est le **premier** import de `main.ts`
- Sans `dotenv.config()` en tête, `SENTRY_DSN` est `undefined` → Sentry désactivé silencieusement

### APP_FILTER string vs token

- `provide: "APP_FILTER"` (string) → NestJS ne l'applique **jamais** comme filtre global
- `provide: APP_FILTER` (token importé de `@nestjs/core`) = seule syntaxe correcte

### NestJS SWC builder — abandonné

- Conflits ESM/CommonJS entre NestJS CLI et Vitest
- `.swcrc` reste pour Vitest uniquement (via `unplugin-swc`)
- Build NestJS utilise tsc

### Prisma 7

- `url = env(...)` supprimé de `schema.prisma` → dans `prisma.config.ts`
- Client généré dans `generated/prisma/` — import via chemin relatif `../../generated/prisma/client`
- `env()` throw si variable absente → var fictive dans le job CI
- `provider = "prisma-client"` avec `output` dans le generator

### Instance PrismaClient unique

- Une seule instance créée dans `prisma/prisma.instance.ts`
- Partagée entre `auth.ts` (Better Auth) et `PrismaService` (NestJS DI)
- Évite deux pools de connexions PostgreSQL

### `@thallesp/nestjs-better-auth` — double instance `@nestjs/core`

- **Symptôme** : `UnknownDependenciesException: ApplicationConfig at index [0]`
- **Fix** : `pnpm.overrides` dans `package.json` racine

### Zod v4

- `error.errors` → `error.issues`
- `z.string().url()` → `z.url()`
- `z.prettifyError(error)` pour formatter

### Expo SDK 55 / React Native 0.83

- New Architecture obligatoire — `newArchEnabled` supprimé de `app.json`
- Expo Go Play Store = SDK 54 — installer l'APK SDK 55 depuis **expo.dev/go**
- NativeWind v4 + tailwindcss v3 uniquement (pas v4)
- `--tunnel` obligatoire sur tous les scripts dev mobile (WSL2)
- `node-linker=hoisted` dans `.npmrc` racine — obligatoire pour Gradle autolinking

## Dépendances système WSL2 manquantes

React Native DevTools nécessite des bibliothèques Chromium absentes par défaut dans WSL2.

```bash
sudo apt-get update && sudo apt-get install -y \
  libasound2t64 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
  libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2
```

Non bloquant — n'affecte pas l'app ni le hot reload.

## Conventions

- Conventional Commits : feat/fix/chore/docs/style/refactor/test/perf/ci/build/revert
- **subject-case: lower-case** — noms de techno en minuscules dans les messages de commit
- `.env.template` (pas `.env.example`)
- BDD locale = Docker en dev / Railway PostgreSQL = staging+prod uniquement
- **Jamais `console.log`** dans NestJS → toujours `Logger` de `@nestjs/common`
- **Biome** pour le lint et le format (pas ESLint, pas Prettier)
- `instrument.ts` TOUJOURS premier import dans `main.ts`, avec `dotenv.config()` en tout premier
- `bufferLogs: true` + `app.useLogger(app.get(PinoLogger))` — toujours ensemble
- `bodyParser: false` dans `NestFactory.create()` — requis par `@thallesp/nestjs-better-auth`
- `SentryModule.forRoot()` AVANT `LoggerModule` dans `app.module.ts`
- `APP_FILTER` = token importé de `@nestjs/core`, jamais la string `"APP_FILTER"`
- `SentryExceptionFilter` (custom) au lieu de `SentryGlobalFilter`
- `bootstrap().catch((error) => { console.error(...); process.exit(1); })` — jamais `void bootstrap()`
- Instance PrismaClient unique dans `prisma/prisma.instance.ts` — jamais plusieurs `new PrismaClient()`
- `PrismaService.client` pour accéder au PrismaClient dans les services NestJS
- `pnpm dlx` et non `npx` pour exécuter des packages one-shot dans le monorepo
- `expo install` et non `pnpm add` pour les dépendances Expo/React Native — gère la compatibilité SDK
- Branching : GitLab Flow — merge unidirectionnel strict, aucun commit direct sur branches permanentes
