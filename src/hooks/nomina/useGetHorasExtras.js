import { useQuery } from "@tanstack/react-query";
import { horaExtraService } from "../../services/nominaService";

export const useGetHorasExtras = (params = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["horasExtras", params],
    queryFn: async () => {
      const response = await horaExtraService.getHorasExtras(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });

  return { horasExtras: data, isLoading, error };
};
