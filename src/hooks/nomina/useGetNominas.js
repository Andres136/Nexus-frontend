import { useQuery } from "@tanstack/react-query";
import { nominaService } from "../../services/nominaService";

export const useGetNominas = (params = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["nominas", params],
    queryFn: async () => {
      const response = await nominaService.getNominas(params);
      console.log("Respuesta de getNominas:", response);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });

  return { nominas: data, isLoading, error };
};
