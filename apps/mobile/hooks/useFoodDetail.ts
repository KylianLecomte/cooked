import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api-client";
import { queryKeys } from "../lib/query-keys";
import type { FoodDetail } from "../types/food";
import { QUERY_CACHE_TTL_7D } from "../util/constant";

export function useFoodDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.foodDetail(id ?? ""),
    queryFn: () => api.get<FoodDetail>(`/api/foods/${id}`),
    enabled: !!id,
    staleTime: QUERY_CACHE_TTL_7D,
    retry: 1,
  });
}
