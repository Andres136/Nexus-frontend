import { useQuery } from "@tanstack/react-query";
import { nominaService } from "../../services/nominaService";

export const useGetNominaSummary = (params = {}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["nominaSummary", params],
    queryFn: async () => {
      const response = await nominaService.getSummary(params);
      return response.data?.data ?? response.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return { summary: data, isLoading };
};
