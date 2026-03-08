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

## Phase actuelle : P0 — EN COURS (16/18 tâches)

Voir dev-plan.html pour le plan complet P0→P8 et l'état détaillé de chaque tâche.

## État P0 — EN COURS ⏳

### Tâches terminées

- [x] Monorepo Turborepo 2.8.13 + pnpm 10.30.3 workspaces
- [x] packages/tsconfig, packages/eslint-config (index.js + index.d.ts), packages/shared
- [x] NestJS ^11.0.0 scaffoldé dans apps/api
- [x] Docker Compose : postgres:18-alpine (18.3 GA) + redis:8-alpine, healthchecks
- [x] Husky 9.1.7 + lint-staged 16.3.2 (--max-warnings=0) + commitlint 20.4.3
- [x] ESLint 10.0.2 flat config — config CLI NestJS (recommendedTypeChecked + projectService)
- [x] Vitest **4.0.x** + SWC + **@vitest/coverage-v8@^4.0.0** — décorateurs NestJS OK, coverage.include explicite
- [x] Prisma 7.4.2 — prisma.config.ts + schema.prisma vide
- [x] @nestjs/config 4.0.3 + Zod 4.3.6 — validateEnv au boot
- [x] nestjs-pino 4.6.0 + pino-http 11 — JSON structuré, pino-pretty en dev
- [x] Sentry @sentry/nestjs + @sentry/profiling-node 10.42.0 — installé, DSN vide (désactivé)
- [x] GitHub Actions CI — lint + typecheck + test + coverage LCOV + SonarCloud scan
- [x] **P0-06** : SonarCloud intégré — sonarqube-scan-action@v7, sonar-project.properties, Automatic Analysis désactivé
- [x] **P0-07** : SONAR_TOKEN ajouté dans les secrets GitHub (autres secrets ajoutés phase par phase)
- [x] **P0-08** : App Expo SDK 55 Managed Workflow — apps/mobile/@cooked/mobile
- [x] **P0-09** : Expo Router v55 — file-based routing, app/\_layout.tsx + app/index.tsx
- [x] **P0-10** : NativeWind v4 + tailwindcss v3 + react-native-css-interop
- [x] **P0-11** : App testée sur appareil Android via Expo Go APK SDK 55 (tunnel WSL2)

### Tâches restantes

- [ ] P0-16 : Pino → Axiom — pino-axiom transport non configuré, logs non envoyés vers Axiom
- [ ] P0-17 : Sentry DSN — créer le projet sentry.io + renseigner SENTRY_DSN dans .env

## Structure complète du monorepo

```
cooked/
├── .github/workflows/ci.yml
├── .husky/
│   ├── commit-msg          → pnpm exec commitlint --edit "$1"
│   └── pre-commit          → pnpm exec lint-staged
├── .vscode/
│   └── settings.json       ← CSS validation off + Tailwind IntelliSense
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
│   ├── mobile/             → @cooked/mobile (Expo SDK 55)
│   │   ├── .expo/          ← gitignored, généré par Expo CLI
│   │   ├── app/
│   │   │   ├── _layout.tsx ← layout racine Expo Router (Stack)
│   │   │   └── index.tsx   ← écran d'accueil temporaire P0
│   │   ├── assets/         ← icônes, splash, favicon
│   │   ├── app.json
│   │   ├── babel.config.js
│   │   ├── expo-env.d.ts   ← généré par Expo (gitignored)
│   │   ├── global.css      ← @tailwind base/components/utilities
│   │   ├── metro.config.js
│   │   ├── nativewind-env.d.ts
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
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

### sonar-project.properties (racine)

```properties
sonar.projectKey=KylianLecomte_cooked
sonar.organization=kylianlecomte

sonar.projectName=COOKED

sonar.sources=apps/api/src,packages/shared/src
sonar.tests=apps/api/src,apps/api/test
sonar.test.inclusions=**/*.spec.ts,**/*.e2e-spec.ts

# Rapport LCOV généré par vitest run --coverage (provider v8 + reporter lcov)
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
  "editor.quickSuggestions": {
    "strings": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["className=\"([^\"]*)", "([^\"']*)"],
    ["className='([^']*)", "([^\"']*)"]
  ]
}
```

`css.validate: false` et `css.lint.unknownAtRules: ignore` — supprime les warnings sur les directives
`@tailwind`, `@apply`, `@layer` dans les fichiers CSS. Nécessite l'extension Tailwind CSS IntelliSense
(`bradlc.vscode-tailwind-css`).

### docker-compose.yml

- `postgres:18-alpine` — container: cooked_postgres, user/pass: cooked/cooked_dev, db: cooked_db, port: 5432
- `redis:8-alpine` — container: cooked_redis, pass: cooked_dev, port: 6379, `--appendonly yes`
- Named volumes: cooked_postgres_data, cooked_redis_data — healthchecks sur les deux

### commitlint.config.js

Types : feat, fix, chore, docs, style, refactor, test, perf, ci, build, revert
subject-case: lower-case, subject-max-length: 100

**Convention importante** : les noms de techno s'écrivent en minuscules dans les commits —
`expo`, `nativewind`, `nestjs` et non `Expo`, `NativeWind`, `NestJS`. La règle `subject-case: lower-case`
est intentionnelle et ne doit pas être désactivée.

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
    "@vitest/coverage-v8": "^4.0.0",
    "dotenv": "^17.3.1",
    "pino-pretty": "^13.1.3",
    "prisma": "^7.4.2",
    "supertest": "^7.2.2",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.56.1",
    "unplugin-swc": "^1.5.9",
    "vitest": "^4.0.0"
  }
}
```

⚠️ `vitest` et `@vitest/coverage-v8` doivent toujours être sur la **même version majeure**.
Versions différentes entre les deux = comportements imprévisibles.

### vitest.config.ts (tests unitaires) — mis à jour pour Vitest v4

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
      // Obligatoire en Vitest v4 : coverage.all supprimé
      // Sans include, seuls les fichiers chargés pendant les tests sont couverts
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/**/*.module.ts", "src/main.ts", "src/instrument.ts"],
    },
  },
});
```

### tsconfig.json, tsconfig.build.json, .swcrc, vitest.e2e.config.ts, eslint.config.mjs, nest-cli.json

Inchangés depuis la conversation précédente — voir CONTEXT.md v2.

### apps/api/.gitignore

```
node_modules
.env
/generated/prisma
generated/
coverage/
```

`coverage/` doit être présent — le dossier est généré par `vitest run --coverage` et lu par SonarCloud
en CI, mais ne doit jamais être commité.

## Fichiers de configuration — apps/mobile

### package.json (@cooked/mobile)

```json
{
  "name": "@cooked/mobile",
  "version": "1.0.0",
  "main": "expo-router/entry.js",
  "scripts": {
    "start": "expo start --tunnel",
    "dev": "expo start --tunnel",
    "android": "expo start --android --tunnel",
    "ios": "expo start --ios --tunnel",
    "web": "expo start --web",
    "lint": "eslint app",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~55.0.5",
    "expo-constants": "^55.0.7",
    "expo-linking": "^55.0.7",
    "expo-router": "^55.0.4",
    "expo-status-bar": "~55.0.4",
    "nativewind": "^4.2.0",
    "react": "19.2.0",
    "react-native": "0.83.2",
    "react-native-css-interop": "...",
    "react-native-reanimated": "4.2.1",
    "react-native-safe-area-context": "~5.6.2",
    "react-native-screens": "~4.23.0"
  },
  "devDependencies": {
    "@cooked/eslint-config": "workspace:*",
    "@cooked/tsconfig": "workspace:*",
    "@types/react": "~19.2.2",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "tailwindcss": "^3.4.0",
    "typescript": "~5.9.2"
  },
  "private": true
}
```

Points importants :

- `"main": "expo-router/entry.js"` — point d'entrée Expo Router. Remplace l'ancien `index.ts` +
  `registerRootComponent`. Ne pas avoir les deux en même temps.
- `--tunnel` obligatoire sur tous les scripts de dev — l'IP WSL2 (172.31.x.x) n'est pas accessible
  depuis un appareil sur le réseau local. Le tunnel ngrok crée une URL publique accessible partout.
- `react-native-css-interop` — dépendance de NativeWind v4, gère la transformation className → styles RN.
  Installée via `expo install react-native-css-interop` (version gérée par Expo).

### app.json

```json
{
  "expo": {
    "name": "Cooked",
    "slug": "cooked",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "cooked",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#080C10"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.cooked.app"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#080C10",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false,
      "package": "com.cooked.app"
    },
    "web": { "favicon": "./assets/favicon.png" },
    "plugins": ["expo-router"],
    "experiments": { "typedRoutes": true }
  }
}
```

Points importants :

- `"scheme": "cooked"` — obligatoire pour Expo Router (deep links). Sans ça, la navigation plante.
- `"plugins": ["expo-router"]` — aucune option. `create-expo-app` génère des options invalides
  (`layout`, `origin`) qui font crasher le démarrage. Les supprimer.
- `newArchEnabled` absent — normal. SDK 55 / RN 0.83 ne supporte QUE la New Architecture,
  le champ a été supprimé car il n'y a plus de choix.
- `splash.backgroundColor: "#080C10"` — doit correspondre au fond de l'app pour éviter un flash blanc.

### babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: [
      "react-native-reanimated/plugin", // doit être le dernier plugin
    ],
  };
};
```

### metro.config.js

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
```

⚠️ `tailwindcss@^3.4.x` uniquement — NativeWind v4 est couplé à Tailwind v3. Tailwind v4 = NativeWind v5
(pre-release, non stable en mars 2026).

### tsconfig.json (apps/mobile)

```json
{
  "extends": "@cooked/tsconfig/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@cooked/shared": ["../../packages/shared/src/index.ts"]
    },
    "strict": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.d.ts",
    "nativewind-env.d.ts",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
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
  enabled: !!process.env["SENTRY_DSN"],
});
```

### main.ts, app.module.ts, config/env.schema.ts, config/env.validation.ts

Inchangés — voir CONTEXT.md v2.

## Import Prisma Client — BREAKING CHANGE Prisma 7

```ts
// ❌ Prisma < 7
import { PrismaClient } from "@prisma/client";

// ✅ Prisma 7
import { PrismaClient } from "../generated/prisma";
```

## GitHub Actions CI

Fichier `.github/workflows/ci.yml` :

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: Lint / Typecheck / Test / Sonar
    runs-on: ubuntu-latest
    timeout-minutes: 15

    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cooked_ci
      REDIS_HOST: localhost
      REDIS_PORT: "6379"
      REDIS_PASSWORD: placeholder

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # obligatoire pour SonarCloud (analyse différentielle)

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm turbo lint

      - name: Typecheck
        run: pnpm turbo typecheck

      - name: Test
        run: pnpm turbo test

      - name: Coverage LCOV
        run: pnpm --filter @cooked/api test:cov

      - name: SonarCloud Scan
        uses: SonarSource/sonarqube-scan-action@v7
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: https://sonarcloud.io
```

Points importants :

- `fetch-depth: 0` — obligatoire pour SonarCloud, shallow clone casse l'analyse différentielle
- `env` au niveau du **job** — les variables ne sont nécessaires que pour ce job
- Package SonarCloud : `sonarqube-scan-action` (PAS `sonarcloud-github-action` — archivé oct. 2025)
- `SONAR_HOST_URL: https://sonarcloud.io` — obligatoire pour cibler SonarCloud vs instance self-hosted
- `GITHUB_TOKEN` non nécessaire dans `sonarqube-scan-action`
- Coverage LCOV généré séparément avec `pnpm --filter @cooked/api test:cov` — `pnpm turbo test:cov`
  n'est pas défini dans turbo.json
- **Désactiver l'Automatic Analysis sur SonarCloud** (Administration → Analysis Method) sinon
  erreur "You are running CI analysis while Automatic Analysis is enabled"

## Secrets GitHub Actions

| Secret          | Ajouté | Phase |
| --------------- | ------ | ----- |
| `SONAR_TOKEN`   | ✅     | P0-06 |
| `AXIOM_TOKEN`   | ❌     | P0-16 |
| `AXIOM_DATASET` | ❌     | P0-16 |
| `SENTRY_DSN`    | ❌     | P0-17 |
| `SUPABASE_URL`  | ❌     | P1+   |
| `RAILWAY_TOKEN` | ❌     | P8    |
| `EAS_TOKEN`     | ❌     | P8    |

Règle : on ajoute un secret uniquement quand le service correspondant est créé et configuré.

## Breaking changes documentés

### Vitest v4 (migration depuis v3)

- `coverage.all` supprimé — seuls les fichiers chargés pendant les tests sont couverts par défaut
- Fix : définir `coverage.include` explicitement dans `vitest.config.ts`
- `coverage.experimentalAstAwareRemapping` supprimé — activé par défaut, seule méthode supportée
- `@vitest/coverage-v8` doit être installé séparément (`pnpm add -D @vitest/coverage-v8@^4.0.0`)
- Versions de `vitest` et `@vitest/coverage-v8` doivent être identiques (même majeure)

### SonarCloud / GitHub Actions

- `SonarSource/sonarcloud-github-action` archivé en oct. 2025 — ne plus utiliser
- Remplacé par `SonarSource/sonarqube-scan-action@v7`
- Nécessite `SONAR_HOST_URL: https://sonarcloud.io` pour cibler SonarCloud
- L'Automatic Analysis SonarCloud doit être **désactivé** (Administration → Analysis Method)
  sinon le CI échoue avec "You are running CI analysis while Automatic Analysis is enabled"

### Expo SDK 55 / React Native 0.83

- New Architecture obligatoire — `newArchEnabled` supprimé de `app.json` (plus de choix)
- Expo Go Play Store = SDK 54 — incompatible avec SDK 55
  → Installer l'APK SDK 55 depuis **expo.dev/go**
- `create-expo-app` génère des options invalides dans `app.json` :
  - `"layout": "native"` dans le plugin expo-router → supprimer (champ inexistant)
  - `"origin": "expo"` dans le plugin expo-router → supprimer (attend une URL valide ou rien)
- `index.ts` + `registerRootComponent` généré par `create-expo-app` → supprimer (conflit avec Expo Router)
- `App.tsx` généré → supprimer (remplacé par `app/_layout.tsx` + `app/index.tsx`)
- `react-native-css-interop` doit être installé séparément (`expo install react-native-css-interop`)
  — dépendance de NativeWind v4, non installée automatiquement

### WSL2 + Expo Go

- Metro bind sur l'IP interne WSL2 (`172.31.x.x`) — inaccessible depuis un appareil sur le réseau local
- Solution : `expo start --tunnel` — crée un tunnel ngrok avec URL publique (`exp://xxx.exp.direct`)
- `@expo/ngrok@^4.1.0` est installé automatiquement lors du premier `--tunnel`
- Mettre `--tunnel` sur tous les scripts `dev`, `start`, `android`, `ios` dans `package.json`

### Prisma 7

- `url = env(...)` supprimé de `schema.prisma` → dans `prisma.config.ts`
- Client généré dans `generated/prisma/`
- `env()` throw si variable absente → var fictive dans le job CI

### Zod v4

- `error.errors` → `error.issues`
- `z.string().url()` → `z.url()`
- `z.prettifyError(error)` pour formatter

### ESLint v10

- `.eslintrc` supprimé → flat config uniquement

### pnpm 10

- `ignoredBuiltDependencies` ≠ `onlyBuiltDependencies`

## Dépendances système WSL2 manquantes

React Native DevTools nécessite des bibliothèques Chromium absentes par défaut dans WSL2.
Erreur symptomatique : `libasound.so.2: cannot open shared object file`

Fix :

```bash
sudo apt-get update && sudo apt-get install -y \
  libasound2t64 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
  libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2
```

Cette erreur n'est **pas bloquante** — elle empêche React Native DevTools de démarrer
mais n'affecte pas l'app ni le hot reload.

## Android Studio / adb

- **adb** (Android Debug Bridge) : outil CLI inclus dans l'Android SDK. Sert de pont entre le PC
  et un appareil Android (physique ou émulateur). Nécessaire pour lancer l'app sur émulateur.
- Android Studio doit tourner **côté Windows** (pas dans WSL2) — les émulateurs ont besoin
  d'accélération matérielle non disponible dans WSL2.
- adb côté Windows communique avec Expo CLI dans WSL2 via `ADB_SERVER_SOCKET`.
- **Non nécessaire pour Expo Go sur téléphone physique** — le tunnel ngrok suffit.
- Sera configuré en **P4** (scan code-barre) quand un development build sera nécessaire.

## Conventions

- Conventional Commits : feat/fix/chore/docs/style/refactor/test/perf/ci/build/revert
- **subject-case: lower-case** — noms de techno en minuscules dans les messages de commit
- `.env.template` (pas `.env.example`)
- BDD locale = Docker en dev / Supabase = staging+prod uniquement
- **Jamais `console.log`** dans NestJS → toujours `Logger` de `@nestjs/common`
- `--max-warnings=0` ESLint — les warnings bloquent les commits
- `instrument.ts` TOUJOURS premier import dans `main.ts`
- `bufferLogs: true` + `app.useLogger(app.get(PinoLogger))` — toujours ensemble
- `SentryModule.forRoot()` AVANT `LoggerModule` dans `app.module.ts`
- `pnpm dlx` et non `npx` pour exécuter des packages one-shot dans le monorepo
- `expo install` et non `pnpm add` pour les dépendances Expo/React Native — gère la compatibilité SDK
- Branching : GitLab Flow — merge unidirectionnel strict, aucun commit direct sur branches permanentes
