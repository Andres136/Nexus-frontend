import { useQuery } from "@tanstack/react-query";
import { dashboardComercialApi } from "../../services/api";

export function useResumenSemanalMes({ mes, userId = "" } = {}) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["resumen-semanal-mes", mes, userId],
    queryFn: async () => {
      const params = { mes };
      if (userId) params.user_id = userId;

      const res = await dashboardComercialApi.getEstadisticasSemanales(params);
      return res.data;
    },
    enabled: !!mes,
    staleTime: 1000 * 60 * 5,
  });

  return {
    semanas: data?.semanas ?? [],
    error,
    isLoading,
  };
}
