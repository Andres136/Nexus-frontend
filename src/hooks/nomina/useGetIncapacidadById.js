import { useQuery } from "@tanstack/react-query";
import { incapacidadService } from "../../services/nominaService";

export const useGetIncapacidadById = (uuid) => {
  const { data: incapacidad, isLoading, error } = useQuery({
    queryKey: ["incapacidad", uuid],
    queryFn: async () => {
      const response = await incapacidadService.getIncapacidadByUuid(uuid);
      return response.data;
    },
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5,
  });

  return { incapacidad, isLoading, error };
};
