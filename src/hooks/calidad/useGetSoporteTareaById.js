import { useQuery } from "@tanstack/react-query";
import { soporteTareasService } from "../../services/calidaService";

export const useGetSoporteTareaById = (id) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["soporte-tarea", id],
    queryFn: async () => {
      const response = await soporteTareasService.getSoportesByTareaId(id);
      console.log("Respuesta del servicio:", response);
      return response.data.data ?? response.data;
    },
    enabled: !!id,
    retry: false,
  });

  return { data, error, isLoading };
};
