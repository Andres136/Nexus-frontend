import { useQuery } from "@tanstack/react-query";
import { permisoService } from "../../services/nominaService";

export const useGetPermisos = ({ enabled = true, ...params } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["permisos", params],
    queryFn: async () => {
      const response = await permisoService.getPermisos(params);
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });

  return { permisos: data, isLoading, error };
};
