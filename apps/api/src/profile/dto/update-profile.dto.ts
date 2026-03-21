import { ActivityLevel, Gender, Goal } from "@cooked/shared";
import { z } from "zod";

// ── Schéma Zod de mise à jour du profil ───────────────────────────────────────
//
// Tous les champs sont optionnels (PATCH sémantique) mais coercés/validés.
// La date de naissance est reçue en ISO string depuis le mobile et transformée en Date.
// Le calcul TDEE est déclenché uniquement quand tous les champs requis sont présents.
//
// z.nativeEnum est déprécié en Zod v4 — on utilise z.enum() avec les valeurs
// littérales. Le type inféré est identique au type union Prisma correspondant
// (ex: "MALE" | "FEMALE" | "OTHER" === Gender).

export const updateProfileSchema = z.object({
  birthDate: z.coerce
    .date()
    .max(new Date(), "La date de naissance doit être dans le passé")
    .min(new Date("1900-01-01"), "Date de naissance invalide")
    .optional(),

  gender: z.enum(Gender).optional(),

  heightCm: z
    .number()
    .min(50, "Taille minimum 50 cm")
    .max(280, "Taille maximum 280 cm")
    .optional(),

  weightKg: z
    .number()
    .min(20, "Poids minimum 20 kg")
    .max(500, "Poids maximum 500 kg")
    .optional(),

  activityLevel: z
    .enum(ActivityLevel)
    .optional(),

  goal: z.enum(Goal).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
