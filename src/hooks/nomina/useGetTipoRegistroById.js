import { useQuery } from "@tanstack/react-query";
import { tipoRegistroService } from "../../services/nominaService";

export const useGetTipoRegistroById = (uuid) => {
  const { data: tipoRegistro, isLoading, error } = useQuery({
    queryKey: ["tipoRegistro", uuid],
    queryFn: async () => {
      const response = await tipoRegistroService.getTipoRegistroByUuid(uuid);
      return response.data;
    },
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5,
  });

  return { tipoRegistro, isLoading, error };
};
