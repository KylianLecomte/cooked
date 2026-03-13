// Clés TanStack Query centralisées
// Permet d'invalider précisément les caches depuis n'importe quel hook/mutation

export const queryKeys = {
  profile: ["profile"] as const,
} as const;
