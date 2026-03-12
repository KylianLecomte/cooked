import { z } from "zod";

// Schema de validation de toutes les variables d'environnement de l'API
// Ce schema est évalué au démarrage de l'application
// Si une variable est manquante ou invalide, l'app refuse de démarrer
export const envSchema = z.object({
  // ── Serveur ──────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().regex(/^\d+$/, "PORT doit être un nombre").default("3000").transform(Number),

  DATABASE_URL: z
    .url("DATABASE_URL doit être une URL valide")
    .refine(
      (url) => url.startsWith("postgresql://"),
      "DATABASE_URL doit commencer par postgresql://",
    ),

  REDIS_HOST: z.string().min(1, "REDIS_HOST est requis"),
  REDIS_PORT: z
    .string()
    .regex(/^\d+$/, "REDIS_PORT doit être un nombre")
    .default("6379")
    .transform(Number),

  REDIS_PASSWORD: z.string().min(1, "REDIS_PASSWORD est requis"),
  SENTRY_DSN: z.url("SENTRY_DSN doit être une URL valide").optional().or(z.literal("")),
  AXIOM_DATASET: z.string().min(1).optional(),
  AXIOM_TOKEN: z.string().min(1).optional(),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET doit faire au minimum 32 caractères"),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
});

// Type TypeScript inféré automatiquement depuis le schema Zod
// Ce type peut être importé dans les services pour typer le ConfigService
export type EnvSchema = z.infer<typeof envSchema>;
