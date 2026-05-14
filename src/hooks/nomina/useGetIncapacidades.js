import { useQuery } from "@tanstack/react-query";
import { incapacidadService } from "../../services/nominaService";

export const useGetIncapacidades = (filters = {}) => {
  const { data: incapacidades, isLoading, error, refetch } = useQuery({
    queryKey: ["incapacidades", filters],
    queryFn: async () => {
      const response = await incapacidadService.getIncapacidades(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { incapacidades, isLoading, error, refetch };
};
