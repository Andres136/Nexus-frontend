import { useQuery } from "@tanstack/react-query";
import { tipoRegistroService } from "../../services/nominaService";

export const useGetTipoRegistros = (filters = {}) => {
  const { data: tipoRegistros, isLoading, error, refetch } = useQuery({
    queryKey: ["tipoRegistros", filters],
    queryFn: async () => {
      const response = await tipoRegistroService.getTipoRegistros(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { tipoRegistros, isLoading, error, refetch };
};
