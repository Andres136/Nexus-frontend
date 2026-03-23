import { useQuery } from "@tanstack/react-query"
import { carteraApi } from "../../services/api";

export const useEstadisticasSemanalCartera = (params = {}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["estadisticasSemanalCartera", params],
    queryFn: async () => {
      const res = await carteraApi.getEstadisticasSemanalCartera(params);

      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    data,
    error,
    isLoading,
  };
};