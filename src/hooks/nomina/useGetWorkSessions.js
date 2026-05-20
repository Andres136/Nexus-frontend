import { useQuery } from "@tanstack/react-query";
import { workSessionService } from "../../services/nominaService";

export const useGetWorkSessions = (params = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["workSessions", params],
    queryFn: async () => {
      const response = await workSessionService.getWorkSessions(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });

  return { workSessions: data, isLoading, error };
};
