import { useQuery } from "@tanstack/react-query";
import { jornadaLaboralService } from "../../services/nominaService";

export const useGetJornadaLaboralById = (uuid) => {
  const { data: jornada, isLoading, error } = useQuery({
    queryKey: ["jornadaLaboral", uuid],
    queryFn: async () => {
      const response = await jornadaLaboralService.getJornadaByUuid(uuid);
      return response.data;
    },
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5,
  });

  return { jornada, isLoading, error };
};
