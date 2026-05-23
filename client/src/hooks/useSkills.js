import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: () => api.get("/skills").then(res => res.data),
  });
}
