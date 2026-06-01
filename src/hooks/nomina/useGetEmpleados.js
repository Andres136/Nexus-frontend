import { useQuery } from "@tanstack/react-query";
import { contratacionService } from "../../services/nominaService";

export const useGetEmpleados = (params = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["empleados", params],
    queryFn: async () => {
      const response = await contratacionService.getEmpleados(params);
      return response.data.map((u) => ({ value: u.id, label: u.name }));
    },
    staleTime: 1000 * 60 * 10,
  });

  return { empleados: data ?? [], isLoading, error };
};
