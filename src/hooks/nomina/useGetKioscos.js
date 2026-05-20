import { useQuery } from "@tanstack/react-query";
import { kioskoDeviceService } from "../../services/nominaService";

export const useGetKioscos = (params = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["kioscos", params],
    queryFn: async () => {
      const response = await kioskoDeviceService.getKioscos(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  return { kioscos: data, isLoading, error };
};
