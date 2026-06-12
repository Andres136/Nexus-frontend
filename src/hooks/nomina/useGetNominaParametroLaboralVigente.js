import { useQuery } from "@tanstack/react-query";
import { nominaParametroLaboralService } from "../../services/nominaService";

export function useGetNominaParametroLaboralVigente(fecha) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["nomina-parametro-laboral-vigente", fecha],
    queryFn: async () => {
      const response = await nominaParametroLaboralService.getVigente(fecha ? { fecha } : {});
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { parametroLaboralVigente: data?.data ?? null, isLoading, error, refetch };
}
