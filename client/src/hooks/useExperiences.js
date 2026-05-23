import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export function useExperiences() {
  return useQuery({
    queryKey: ["experiences"],
    queryFn: () => api.get("/experiences").then(res => res.data),
  });
}
