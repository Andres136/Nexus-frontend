import { useQuery } from "@tanstack/react-query";
import { descuentoService } from "../../services/nominaService";

export const useGetDescuentos = (filters = {}) => {
  const { data: descuentos, isLoading, error, refetch } = useQuery({
    queryKey: ["descuentos", filters],
    queryFn: async () => {
      const response = await descuentoService.getDescuentos(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { descuentos, isLoading, error, refetch };
};
