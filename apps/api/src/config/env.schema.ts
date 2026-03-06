import { z } from "zod";

// Schema de validation de toutes les variables d'environnement de l'API
// Ce schema est évalué au démarrage de l'application
// Si une variable est manquante ou invalide, l'app refuse de démarrer
export const envSchema = z.object({
  // ── Serveur ──────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.string().regex(/^\d+$/, "PORT doit être un nombre").default("3000").transform(Number),
  // .transform(Number) convertit la string "3000" en number 3000
  // Les variables d'env sont toujours des strings, transform permet de les typer correctement

  // ── Base de données ──────────────────────────────────────────────────────
  DATABASE_URL: z
    .url("DATABASE_URL doit être une URL valide")
    .refine(
      (url) => url.startsWith("postgresql://"),
      "DATABASE_URL doit commencer par postgresql://",
    ),

  // ── Redis ────────────────────────────────────────────────────────────────
  REDIS_HOST: z.string().min(1, "REDIS_HOST est requis"),

  REDIS_PORT: z
    .string()
    .regex(/^\d+$/, "REDIS_PORT doit être un nombre")
    .default("6379")
    .transform(Number),

  REDIS_PASSWORD: z.string().min(1, "REDIS_PASSWORD est requis"),

  // ── Sentry (optionnel en dev, requis en prod) ────────────────────────────
  SENTRY_DSN: z.string().url("SENTRY_DSN doit être une URL valide").optional().or(z.literal("")),
  // .or(z.literal("")) permet une string vide en dev
  // En prod le DSN sera une URL valide
});

// Type TypeScript inféré automatiquement depuis le schema Zod
// Ce type peut être importé dans les services pour typer le ConfigService
export type EnvSchema = z.infer<typeof envSchema>;
