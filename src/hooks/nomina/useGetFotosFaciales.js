import { useQuery } from "@tanstack/react-query";
import { fotoFacialService } from "../../services/nominaService";

export const useGetFotosFaciales = (params = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["fotosFaciales", params],
    queryFn: async () => {
      const response = await fotoFacialService.getFotos(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  return { fotos: data, isLoading, error };
};
