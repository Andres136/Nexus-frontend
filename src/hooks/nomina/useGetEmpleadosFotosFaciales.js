import { useQuery } from "@tanstack/react-query";
import { fotoFacialService } from "../../services/nominaService";

export const useGetEmpleadosFotosFaciales = (params = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["empleadosFotosFaciales", params],
    queryFn: async () => {
      const response = await fotoFacialService.getEmpleadosConContrato(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  return { data, isLoading, error };
};
