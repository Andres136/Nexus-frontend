import { useQuery } from "@tanstack/react-query";
import { valorService } from "../../services/nominaService";

export const useGetValorById = (uuid) => {
  const { data: valor, isLoading, error } = useQuery({
    queryKey: ["valor", uuid],
    queryFn: async () => {
      const response = await valorService.getValorByUuid(uuid);
      return response.data;
    },
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5,
  });

  return { valor, isLoading, error };
};
