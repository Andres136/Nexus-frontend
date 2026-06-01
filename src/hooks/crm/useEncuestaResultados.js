import { useQuery } from "@tanstack/react-query";
import { encuestaService } from "../../services/encuestaService";

export const useEncuestaResultados = (encuestaId, filtroUserId = null) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["encuesta-resultados", encuestaId, filtroUserId],
    queryFn: async () => {
      const res = await encuestaService.getResultados(encuestaId, filtroUserId);
      return res.data;
    },
    enabled: !!encuestaId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    resultados: data ?? null,
    isLoading,
    isError,
    refetch,
  };
};
