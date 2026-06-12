import { useQuery } from "@tanstack/react-query";
import { nominaConceptoContableService } from "../../services/nominaService";

export function useGetNominaConceptosContables(params = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["nomina-conceptos-contables", params],
    queryFn: async () => {
      const response = await nominaConceptoContableService.getConceptos(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return { conceptosContables: data, isLoading, error, refetch };
}
