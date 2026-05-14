import { useQuery } from "@tanstack/react-query";
import { contratacionService } from "../../services/nominaService";

export const useGetEmpleados = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["empleados"],
    queryFn: async () => {
      const response = await contratacionService.getEmpleados();
      return response.data.map((u) => ({ value: u.id, label: u.name }));
    },
    staleTime: 1000 * 60 * 10,
  });

  return { empleados: data ?? [], isLoading, error };
};
