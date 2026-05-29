import { useQuery } from "@tanstack/react-query";
import { encuestaService } from "../../services/encuestaService";

export const useEncuestaResultados = (encuestaId) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["encuesta-resultados", encuestaId],
    queryFn: async () => {
      const res = await encuestaService.getResultados(encuestaId);
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
