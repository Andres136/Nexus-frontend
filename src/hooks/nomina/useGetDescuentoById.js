import { useQuery } from "@tanstack/react-query";
import { descuentoService } from "../../services/nominaService";

export const useGetDescuentoById = (uuid) => {
  const { data: descuento, isLoading, error, refetch } = useQuery({
    queryKey: ["descuento", uuid],
    queryFn: async () => {
      const response = await descuentoService.getDescuentoByUuid(uuid);
      return response.data;
    },
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5,
  });

  return { descuento, isLoading, error, refetch };
};
