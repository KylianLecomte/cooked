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

| Couche             | Techno                      | Version                                    |
| ------------------ | --------------------------- | ------------------------------------------ |
| Monorepo           | Turborepo                   | 2.8.13                                     |
| Backend            | NestJS                      | ^11.0.0                                    |
| ORM                | Prisma                      | 7.4.2                                      |
| Auth               | **Better Auth**             | à installer en P1                          |
| BDD locale         | PostgreSQL (Docker)         | postgres:18-alpine                         |
| Cache              | Redis (Docker)              | redis:8-alpine                             |
| Mobile             | Expo SDK                    | 55                                         |
| Navigation         | Expo Router                 | ^55.0.4                                    |
| Styling            | NativeWind v4 + Tailwind v3 | -                                          |
| HTTP client mobile | **TanStack Query v5**       | à installer en P1                          |
| Logging            | nestjs-pino + Axiom         | -                                          |
| Monitoring         | Sentry                      | @sentry/nestjs + @sentry/react-native (P1) |
| Qualité            | SonarCloud                  | -                                          |

---

## État des phases

| Phase                              | Status             |
| ---------------------------------- | ------------------ |
| P0 — Setup & Architecture          | ✅ TERMINÉ (18/18) |
| **P1 — Auth & Profil Utilisateur** | 🔄 EN COURS        |
| P2 → P8                            | ⏳ À venir         |

---

## P1 — Auth & Profil Utilisateur (1–2 semaines)

**Objectif** : L'utilisateur peut créer un compte, se connecter, renseigner son profil nutritionnel.

### Catégorie : Authentification

| ID    | Tâche                                               | Status |
| ----- | --------------------------------------------------- | ------ |
| p1-1  | Intégrer Better Auth dans NestJS                    | ⬜     |
| p1-2  | Écran Register (React Native)                       | ⬜     |
| p1-3  | Écran Login + @better-auth/expo + expo-secure-store | ⬜     |
| p1-4  | Middleware d'auth Expo Router                       | ⬜     |
| p1-5  | Initialiser Sentry React Native                     | ⬜     |
| p1-6b | Configurer EAS Dev Build                            | ⬜     |
| p1-6c | Installer TanStack Query v5                         | ⬜     |

### Catégorie : Profil & Objectifs

| ID   | Tâche                                     | Status |
| ---- | ----------------------------------------- | ------ |
| p1-6 | Schema Prisma : User + Profile            | ⬜     |
| p1-7 | Calcul automatique TDEE (Mifflin-St Jeor) | ⬜     |
| p1-8 | Écran Onboarding multi-étapes             | ⬜     |
| p1-9 | Écran Paramètres / Modifier profil        | ⬜     |

---

## Détails techniques P1

### p1-1 — Better Auth dans NestJS

Better Auth s'installe directement dans NestJS (pas de service externe). Il expose automatiquement
les endpoints `/api/auth/*`. Il utilise l'adapter Prisma pour stocker les users dans notre propre
table `users`.

**Variables d'env à ajouter** :

```
BETTER_AUTH_SECRET=   # secret aléatoire fort (min 32 chars)
BETTER_AUTH_URL=      # ex: http://localhost:3000 (URL de l'API NestJS)
```

**Secret GitHub à ajouter** : `BETTER_AUTH_SECRET` (lors de la mise en staging/prod).

**Endpoints exposés automatiquement** :

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-out`
- `GET  /api/auth/session`
- `POST /api/auth/forget-password`
- etc.

**Prisma adapter** : Better Auth génère automatiquement les modèles Prisma nécessaires
(`user`, `session`, `account`, `verification`) via `npx @better-auth/cli generate`.
Ces modèles sont à intégrer dans `schema.prisma`.

**⚠️ Intégration NestJS** : Better Auth expose un handler HTTP. Dans NestJS, on crée
un contrôleur `auth.controller.ts` qui délègue toutes les requêtes `/api/auth/*` au handler
Better Auth. Il faut désactiver le body parser de NestJS pour ces routes (Better Auth gère
lui-même le parsing).

### p1-3 — @better-auth/expo + expo-secure-store

`@better-auth/expo` est le client Better Auth pour Expo/React Native. Il gère :

- Le stockage des tokens via `expo-secure-store` (iOS Keychain / Android Keystore)
- Le refresh automatique de session
- Les headers d'auth sur chaque requête

`expo-secure-store` est un **module natif** → nécessite un **Development Build** (pas Expo Go).
C'est pourquoi `p1-6b` (EAS Dev Build) est une prérequis à `p1-2`/`p1-3` dans l'ordre logique.

### p1-5 — Sentry React Native

`@sentry/react-native` est aussi un **module natif** → nécessite un Development Build.
À configurer après p1-6b. Le `userId` doit être taggé dans Sentry à la connexion pour
associer chaque crash à l'utilisateur concerné.

### p1-6b — EAS Dev Build

**Pourquoi un Dev Build et non Expo Go** :
Expo Go est un client générique qui ne peut charger que du code JavaScript pur. Dès qu'une
dépendance contient du code natif (expo-secure-store, @sentry/react-native, expo-barcode-scanner, etc.),
il faut un APK custom compilé avec ces modules.

**Ce que ça implique** :

- Installer `expo-dev-client` dans apps/mobile
- Créer `eas.json` avec un profil `development`
- Builder l'APK via EAS Cloud (`eas build --profile development --platform android`)
- L'APK Dev Build remplace définitivement Expo Go

**Conséquence sur les scripts** : `expo start --tunnel` reste utilisé, mais avec l'APK Dev Build
installé sur l'appareil au lieu d'Expo Go.

### p1-6c — TanStack Query v5

`@tanstack/react-query` v5. Utilisé dès P1 pour :

- Les appels auth (login, register, session)
- Les données de profil utilisateur

Setup : `QueryClientProvider` en racine de l'app dans `app/_layout.tsx`.
React Query Devtools disponibles en dev (package séparé pour React Native).

**⚠️ Breaking changes v5 vs v4** :

- `useQuery({ queryKey, queryFn })` — objet unique, plus de positional args
- `isLoading` → `isPending` pour les nouvelles requêtes
- `onSuccess`/`onError` callbacks supprimés de `useQuery` → utiliser `useEffect` ou `useMutation`
- `cacheTime` → `gcTime`

### p1-6 — Schema Prisma : User + Profile

Better Auth génère ses propres modèles (`user`, `session`, `account`, `verification`).
On ajoute un modèle `Profile` lié au `user` de Better Auth via relation 1-to-1.

```prisma
// Modèles générés par Better Auth (via @better-auth/cli generate) :
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
}

model session { ... }
model account { ... }
model verification { ... }

// Notre modèle métier :
model Profile {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           user     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Données physiques
  birthDate      DateTime?
  gender         Gender?
  heightCm       Float?
  weightKg       Float?

  // Objectif nutritionnel
  activityLevel  ActivityLevel?
  goal           Goal?

  // Objectifs calculés (sauvegardés après calcul TDEE)
  tdeeKcal       Int?
  targetKcal     Int?
  targetProteinG Int?
  targetCarbsG   Int?
  targetFatG     Int?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum ActivityLevel {
  SEDENTARY        // ×1.2
  LIGHTLY_ACTIVE   // ×1.375
  MODERATELY_ACTIVE // ×1.55
  VERY_ACTIVE      // ×1.725
  EXTRA_ACTIVE     // ×1.9
}

enum Goal {
  LOSE_WEIGHT      // -500 kcal/j
  MAINTAIN         // ±0
  GAIN_MUSCLE      // +300 kcal/j
}
```

**⚠️ Prisma 7** : le client est importé depuis `../generated/prisma`, pas `@prisma/client`.

### p1-7 — Calcul TDEE (Mifflin-St Jeor)

La formule Mifflin-St Jeor est la référence actuelle (plus précise que Harris-Benedict).

```
BMR (homme) = (10 × poids_kg) + (6.25 × taille_cm) - (5 × âge) + 5
BMR (femme) = (10 × poids_kg) + (6.25 × taille_cm) - (5 × âge) - 161
```

`TDEE = BMR × facteur_activité`

Ajustement selon objectif :

- `LOSE_WEIGHT` : TDEE - 500 kcal/j
- `MAINTAIN` : TDEE
- `GAIN_MUSCLE` : TDEE + 300 kcal/j

Répartition macros par défaut (40/30/30 — glucides/protéines/lipides) :

```
protéines (g) = (targetKcal × 0.30) / 4
glucides  (g) = (targetKcal × 0.40) / 4
lipides   (g) = (targetKcal × 0.30) / 9
```

Ce calcul sera dans un service dédié `TdeeService` (ou méthode dans `ProfileService`) — logique pure,
testable unitairement.

---

## Structure de fichiers nouvelles en P1

```
apps/api/src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts     ← délègue à Better Auth handler
│   └── auth.service.ts        ← initialise Better Auth, expose l'instance
├── profile/
│   ├── profile.module.ts
│   ├── profile.controller.ts  ← GET/PATCH /profile
│   ├── profile.service.ts     ← logique métier + TDEE
│   └── profile.dto.ts         ← DTOs Zod ou class-validator
└── prisma/
    └── prisma.service.ts      ← PrismaService (singleton, onModuleInit)

apps/mobile/app/
├── (auth)/
│   ├── _layout.tsx            ← layout pour les écrans non-authentifiés
│   ├── login.tsx
│   └── register.tsx
├── (app)/
│   ├── _layout.tsx            ← layout protégé (tab bar)
│   └── index.tsx              ← journal (home)
├── onboarding/
│   ├── _layout.tsx
│   ├── step-1.tsx             ← infos perso
│   ├── step-2.tsx             ← objectif
│   └── step-3.tsx             ← résumé + calories
└── _layout.tsx                ← layout racine (QueryClientProvider, auth check)
```

---

## Secrets GitHub Actions à ajouter en P1

| Secret               | Quand                                                      |
| -------------------- | ---------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | Dès que Better Auth est configuré                          |
| `DATABASE_URL`       | Quand Railway PostgreSQL staging est créé (P8 ou plus tôt) |

---

## Conventions ajoutées en P1

_(à compléter au fur et à mesure)_

- Import Prisma Client depuis `../generated/prisma` (cf. breaking change Prisma 7 — documenté en P0)
- Better Auth : jamais de `BETTER_AUTH_SECRET` dans le code — toujours via variable d'env
- `PrismaService` = singleton NestJS, `onModuleInit` pour `$connect()`, `onModuleDestroy` pour `$disconnect()`
- `expo install` pour toute dépendance Expo/React Native native (gère la compatibilité SDK)
- EAS Dev Build requis dès qu'un module natif est ajouté (expo-secure-store, @sentry/react-native)

---

## Breaking changes documentés en P1

_(à compléter au fur et à mesure)_

---

## Fichiers de configuration P1

_(complétés au fur et à mesure)_

### eas.json (apps/mobile)

```json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

---

## Rappel — Breaking changes P0 (les plus importants)

- **Prisma 7** : `import { PrismaClient } from "../generated/prisma"` (pas `@prisma/client`)
- **Prisma 7** : `datasourceUrl` dans `prisma.config.ts`, pas `url = env(...)` dans `schema.prisma`
- **Zod v4** : `z.prettifyError(error)` pour formatter, `error.issues` (pas `error.errors`)
- **SentryExceptionFilter** custom — incompatible avec Pino multi-transport (voir CONTEXT_phase_0.md)
- **APP_FILTER** = token importé de `@nestjs/core`, jamais la string
- **`bootstrap().catch(...)`** — jamais `void bootstrap()`
- **NativeWind v4** : tailwindcss v3 uniquement (pas v4)
- **Expo SDK 55** : New Architecture obligatoire, Expo Go APK SDK 55 depuis expo.dev/go
- **`--tunnel`** obligatoire sur tous les scripts dev mobile (WSL2)
