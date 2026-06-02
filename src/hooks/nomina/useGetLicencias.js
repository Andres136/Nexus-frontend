import { useQuery } from "@tanstack/react-query";
import { licenciaService } from "../../services/nominaService";

export function useGetLicencias({ enabled = true, ...filters } = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["licencias", filters],
    queryFn: async () => {
      const response = await licenciaService.getLicencias(filters);
      return response.data;
    },
    enabled,
  });

  return { licencias: data, isLoading, error, refetch };
}
