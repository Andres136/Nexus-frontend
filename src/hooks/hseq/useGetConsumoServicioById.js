import { useQuery } from "@tanstack/react-query";
import { ConsumoServiciosService } from "../../services/hseqService";


export const useGetConsumoServicioById = (id) => {
    const obtenerConsumoServicio = async () => {
        const response = await ConsumoServiciosService.getConsumoServicioById(id);
      return response.data.data;
    }

    const query = useQuery({
        queryKey: ["consumo-servicio", id],
        queryFn: obtenerConsumoServicio,
        enabled: !!id, // Solo ejecutar si el ID es válido
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    }
}