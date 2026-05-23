import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog"],
    queryFn: () => api.get("/blog").then(res => res.data),
  });
}

export function useBlogPost(slug) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => api.get(`/blog/${slug}`).then(res => res.data),
    // Only fetch if slug exists
    enabled: !!slug,
  });
}
