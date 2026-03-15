// Clés TanStack Query centralisées
// Permet d'invalider précisément les caches depuis n'importe quel hook/mutation

export const queryKeys = {
  profile: ["profile"] as const,
  foodSearch: (q: string) => ["foods", "search", q] as const,
  foodDetail: (id: string) => ["foods", "detail", id] as const,
} as const;
