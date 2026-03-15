import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api-client";
import { queryKeys } from "../lib/query-keys";
import type { FoodSummary } from "../types/food";

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.foodSearch(query),
    queryFn: () => api.get<FoodSummary[]>(`/api/foods/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
    staleTime: 24 * 60 * 60 * 1000, // 24h — le cache backend invalide après 24h
    retry: 1,
  });
}
