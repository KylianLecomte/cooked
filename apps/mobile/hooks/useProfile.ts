import type { ActivityLevel, Gender, Goal } from "@cooked/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BACKEND_ENDPOINT } from "@/api/backend/api-backend.endpoint";
import { api } from "../api/api.util";
import { queryKeys } from "../lib/query-keys";

// ── Type miroir du modèle Prisma Profile ─────────────────────────────────────
// Les enums viennent de @cooked/shared (source de vérité unique).
// Les dates sont des strings ISO car JSON ne connaît pas Date.

export type Profile = {
  id: string;
  userId: string;
  birthDate: string | null;
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  tdeeKcal: number | null;
  targetKcal: number | null;
  targetProteinG: number | null;
  targetCarbsG: number | null;
  targetFatG: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfilePayload = Partial<
  Pick<Profile, "birthDate" | "gender" | "heightCm" | "weightKg" | "activityLevel" | "goal">
>;

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    // Retourne null si l'utilisateur n'a pas encore de profil (pas encore onboardé)
    queryFn: () => api.get<Profile | null>(API_BACKEND_ENDPOINT.profile.base),
    // Retry réduit : une erreur réseau au boot ne doit pas bloquer 3× l'app
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      api.patch<Profile>(API_BACKEND_ENDPOINT.profile.base, payload),
    onSuccess: (updatedProfile) => {
      // Mise à jour du cache sans refetch pour éviter un aller-retour réseau
      queryClient.setQueryData(queryKeys.profile, updatedProfile);
    },
  });
}
