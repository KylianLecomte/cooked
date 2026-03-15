import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api-client";
import { queryKeys } from "../lib/query-keys";
import type { FoodDetail } from "../types/food";

export function useFoodDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.foodDetail(id ?? ""),
    queryFn: () => api.get<FoodDetail>(`/api/foods/${id}`),
    enabled: !!id,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7j — mirror du TTL Redis backend
    retry: 1,
  });
}
