import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

// This is a custom hook — it wraps TanStack Query's useQuery
// so we can reuse this data fetch anywhere without repeating code
export function useHero() {
  return useQuery({
    queryKey: ["hero"], // unique cache key — TanStack Query uses this to cache the result
    queryFn: () => api.get("/hero").then(res => res.data),
  });
}
