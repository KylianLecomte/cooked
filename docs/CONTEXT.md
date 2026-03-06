# COOKED — Contexte projet

## Context

Afin que tu puisses me donner des réponses le plus précises possible, nous avons convenu de faire une nouvelle discussion par phase.
Tu dois donc prendre en compte ce fichier au début de la conversation et le mettre à jour à la fin de la phase ou dès que tu trouves ça pertinent.

## Objectif

App nutrition type MyFitnessPal. Projet d'apprentissage A→Z avec bonnes pratiques (Clean Code, sécurité, observabilité...).
Potentiellement utilisé en production par d'autres personnes à terme.
La difficulté n'est pas un critère — on fait les choses bien.

## Stack validée

Voir stack-recap.html dans le projet (docs/).

## Environnement

- OS : Windows + WSL2 Ubuntu 24.04 (tout le dev se passe dans WSL2)
- Shell : bash dans WSL2
- IDE : VS Code avec extension Remote WSL
- Node : 24.14 LTS via fnm
- pnpm : 10.30.3
- Docker Desktop avec intégration WSL2
- Racine du projet : /home/kylian/developpement/project/cooked

## Phase actuelle : P0 — Setup & Architecture

Voir dev-plan.html pour le plan complet (P0 → P8).

## État P0

- [x] Monorepo Turborepo + pnpm workspaces (packageManager field dans package.json)
- [x] packages/tsconfig, packages/eslint-config (avec index.d.ts), packages/shared
- [x] NestJS scaffoldé dans apps/api (répond sur :3000)
- [x] Docker Compose : postgres:18-alpine (18.3 GA confirmé) + redis:8-alpine (healthy)
- [x] Husky + lint-staged + commitlint (Conventional Commits)
- [x] ESLint v10 flat config (config CLI NestJS conservée — recommendedTypeChecked + projectService)
- [x] eslint-plugin-prettier au workspace root, endOfLine: lf dans .prettierrc
- [x] Logger @nestjs/common dans main.ts (jamais console.log)
- [x] Vitest + SWC (unplugin-swc + @swc/core) — tests unitaires OK avec décorateurs NestJS
- [x] tsconfig split : tsconfig.json (IDE) + tsconfig.build.json (nest build, exclut tests)
- [x] vitest.config.ts + vitest.e2e.config.ts — globals: true, environment: node
- [x] app.controller.spec.ts — mock AppService via useValue pattern
- [x] turbo.json — outputs:[] pour test, inputs explicites, packageManager field
- [x] Zone.Identifier + jest-e2e.json + .prettierrc dupliqué → supprimés + .gitignore mis à jour
- [ ] Prisma 7 + prisma.config.ts — en cours (env() helper, url hors schema.prisma)
- [ ] @nestjs/config + Zod v4 validation env au boot
- [ ] Pino logger (remplace le logger NestJS par défaut)
- [ ] Sentry NestJS
- [ ] GitHub Actions CI

## Versions clés installées

- Prisma : ^7.4.2 (@prisma/client + prisma CLI)
- Zod : dernière version (v4) — breaking changes vs v3
- @nestjs/config : à installer
- Turborepo : 2.8.13
- Vitest : 3.2.4

## Problèmes résolus

- @cooked/tsconfig manquant dans packages/shared → ajout workspace:\*
- docker-compose version: → supprimé
- pnpm build scripts → pnpm approve-builds → onlyBuiltDependencies
- ESLint ENOENT → flat config + install workspace root. Config CLI NestJS conservée (meilleure)
- eslint-plugin-prettier manquant → pnpm add -D -w eslint-plugin-prettier
- endOfLine: "auto" dans eslint.config.mjs → supprimé, .prettierrc fait autorité
- console.log → Logger @nestjs/common (compatible Pino via app.useLogger())
- PostgreSQL 18 → confirmé 18.3 GA
- Vitest + NestJS décorateurs → esbuild ne supporte pas emitDecoratorMetadata → SWC (unplugin-swc)
- tsconfig rootDir + test/ hors src/ → split tsconfig.json / tsconfig.build.json
- types vitest/globals manquants → "types": ["vitest/globals", "node"] dans tsconfig.json
- supertest manquant → pnpm add -D --filter @cooked/api supertest @types/supertest
- app.controller.spec.ts incomplet → mock AppService via { provide: AppService, useValue: mockAppService }
- commit-msg hook --no invalide pnpm 10 → pnpm exec commitlint --edit "$1"
- Turborepo manque packageManager → ajout "packageManager": "pnpm@10.30.3" dans package.json racine
- ESLint ignore pattern _.config.ts trop large → restreint à _.config.js et \*.config.mjs
- Zone.Identifier files Windows → supprimés + \*:Zone.Identifier dans .gitignore
- Prisma 7 breaking : url supprimé de schema.prisma → déplacé dans prisma.config.ts via env() de prisma/config
- Prisma 7 breaking : migrate dev / db push ne lancent plus prisma generate → doit être explicite
- Zod v4 breaking : error.errors → error.issues, z.string().url() → z.url(), z.prettifyError()

## Conventions

- Projet : Cooked (@cooked/\* pour les packages)
- Conventional Commits : feat/fix/chore/docs/style/refactor/test/perf/ci/build/revert
- .env.template (pas .env.example)
- BDD locale = Docker en dev. Supabase = staging/prod uniquement.
- Tout le code dans /home/kylian/ (jamais /mnt/d/)
- Jamais de console.log dans NestJS → toujours Logger de @nestjs/common
- --max-warnings=0 sur ESLint : les warnings bloquent les commits
- prisma.config.ts utilise env() de prisma/config (pas process.env directement)

## Fichiers de documentation (dans docs/)

- CONTEXT.md — ce fichier, à coller en début de chaque nouvelle conversation
- p0-setup-doc.html — documentation visuelle de P0 (décisions, structure, issues résolues)
- stack-recap.html — récapitulatif de toute la stack technique
- dev-plan.html — plan de développement interactif P0→P8

## Instructions pour Claude

- Prendre en compte tous les fichiers fournis (context, doc, stack, dev-plan) en début de conversation
- Maintenir et régénérer ce CONTEXT.md à chaque fin de phase ou quand pertinent
- Être factuel et critique — signaler ce qui est incorrect même si ça va dans mon sens
- Tout détailler : fichiers créés, options, paramètres, raisons des choix
- Vérifier les versions des outils via web search avant de les prescrire (nous sommes en mars 2026)
- Mettre à jour p0-setup-doc.html, CONTEXT.md, stack-recap.html et dev-plan.html quand pertinent
