import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects").then(res => res.data),
  });
}
