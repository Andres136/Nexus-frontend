import { useQuery } from "@tanstack/react-query";
import { ajusteSalarialService } from "../../services/nominaService";

export const useGetAjustesSalariales = (params = {}) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["ajustesSalariales", params],
    queryFn: async () => {
      const response = await ajusteSalarialService.getAjustes(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  return { ajustesSalariales: data, isLoading, error, refetch, isFetching };
};
