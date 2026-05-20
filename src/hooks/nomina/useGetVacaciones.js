import { useQuery } from "@tanstack/react-query";
import { vacacionService } from "../../services/nominaService";

export const useGetVacaciones = (params = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vacaciones", params],
    queryFn: async () => {
      const response = await vacacionService.getVacaciones(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });

  return { vacaciones: data, isLoading, error };
};
