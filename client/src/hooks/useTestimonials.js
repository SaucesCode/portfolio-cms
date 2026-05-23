import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: () => api.get("/testimonials").then(res => res.data),
  });
}
