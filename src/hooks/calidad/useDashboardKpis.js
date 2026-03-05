import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../services/api";

export const useDashboardKpis = (year) => {

  const obtenerKpis = async () => {
    const response = await dashboardApi.getKpis(year);
    return response.data;
  };

  const query = useQuery({
    queryKey: ["dashboard-kpis", year],
    queryFn: obtenerKpis,
    keepPreviousData: true,
    enabled: !!year
  });

  return {
    kpis: query.data || null,
    loading: query.isLoading,
    refetch: query.refetch
  };
};