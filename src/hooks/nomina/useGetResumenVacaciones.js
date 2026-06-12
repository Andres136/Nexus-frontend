import { useQuery } from "@tanstack/react-query";
import { vacacionService } from "../../services/nominaService";

export const useGetResumenVacaciones = (userId, { enabled = true, ...params } = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vacaciones-resumen", userId, params],
    queryFn: async () => {
      const response = await vacacionService.resumen(userId, params);
      return response.data;
    },
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 60 * 2,
  });

  return { resumenVacaciones: data, isLoading, error, refetch };
};
