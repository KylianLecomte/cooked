import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api.util";
import { queryKeys } from "../lib/query-keys";
import type { FoodSummary } from "../types/food";
import { QUERY_CACHE_TTL_1D } from "../util/constant";

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.foodSearch(query),
    queryFn: () => api.get<FoodSummary[]>(`/foods/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
    staleTime: QUERY_CACHE_TTL_1D,
    retry: 1,
  });
}
