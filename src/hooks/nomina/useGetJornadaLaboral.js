import { useQuery } from "@tanstack/react-query";
import { jornadaLaboralService } from "../../services/nominaService";

export const useGetJornadaLaboral = (filters = {}) => {
  const { data: jornadas, isLoading, error, refetch } = useQuery({
    queryKey: ["jornadaLaboral", filters],
    queryFn: async () => {
      const response = await jornadaLaboralService.getJornadas(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { jornadas, isLoading, error, refetch };
};
