import { useQuery } from "@tanstack/react-query";
import { soporteTareasService } from "../../services/calidaService";

export const useGetSoporteHallazgoById = (id) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["soporte-hallazgo", id],
    queryFn: async () => {
      const response = await soporteTareasService.getSoportesByHallazgoId(id);
      return response.data.data;
    },
    enabled: !!id,
    retry: false,
  });

  return { data, error, isLoading };
};
