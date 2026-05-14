import { useQuery } from "@tanstack/react-query";
import { valorService } from "../../services/nominaService";

export const useGetValores = (filters = {}) => {
  const { data: valores, isLoading, error, refetch } = useQuery({
    queryKey: ["valores", filters],
    queryFn: async () => {
      const response = await valorService.getValores(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { valores, isLoading, error, refetch };
};
