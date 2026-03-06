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
- Node : 22 LTS via fnm
- pnpm : 10.30.3
- Docker Desktop avec intégration WSL2
- Racine du projet : /home/kylian/developpement/project/cooked

## Phase actuelle : P0 — Setup & Architecture

Voir dev-plan.html pour le plan complet (P0 → P8).

## État P0

- [x] Monorepo Turborepo + pnpm workspaces
- [x] packages/tsconfig, packages/eslint-config, packages/shared
- [x] NestJS scaffoldé dans apps/api
- [x] Docker Compose : postgres:18-alpine (18.3 GA confirmé) + redis:8-alpine (healthy)
- [x] Husky + lint-staged + commitlint (Conventional Commits)
- [x] ESLint v10 flat config (config CLI NestJS conservée + fix endOfLine)
- [x] eslint-plugin-prettier installé au workspace root
- [x] console.log → Logger @nestjs/common dans main.ts
- [ ] Prisma + variables d'env validées au boot (Zod)
- [ ] Pino logger (remplace le logger NestJS par défaut)
- [ ] Sentry NestJS
- [ ] GitHub Actions CI

## Problèmes résolus

- @cooked/tsconfig manquant dans packages/shared → ajout `workspace:*` dans devDependencies
- docker-compose `version:` attribute obsolète → supprimé, fichier commence par `services:`
- pnpm build scripts warning → `pnpm approve-builds` (@nestjs/core, esbuild) → `onlyBuiltDependencies` dans pnpm-workspace.yaml
- ESLint ENOENT au commit → ESLint non installé au workspace root + ancien format eslintrc. Fix : `pnpm add -D -w eslint ...` + flat config
- eslint-plugin-prettier manquant → `pnpm add -D -w eslint-plugin-prettier`
- `endOfLine: "auto"` dans eslint.config.mjs écrase .prettierrc → règle supprimée, .prettierrc fait autorité
- console.log bloqué par no-console + --max-warnings=0 → remplacé par Logger @nestjs/common
- PostgreSQL 18 statut incertain → confirmé 18.3 GA via `docker exec cooked_postgres psql -U cooked -d cooked_db -c "SELECT version();"`

## Conventions

- Projet : Cooked (@cooked/\* pour les packages)
- Conventional Commits : feat/fix/chore/docs/style/refactor/test/perf/ci/build/revert
- .env.template (pas .env.example)
- BDD locale = Docker en dev. Supabase = staging/prod uniquement.
- Tout le code dans /home/kylian/ (jamais /mnt/d/)
- Jamais de console.log dans NestJS → toujours Logger de @nestjs/common
- --max-warnings=0 sur ESLint : les warnings sont traités comme des erreurs

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
