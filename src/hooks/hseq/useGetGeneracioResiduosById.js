import { useQuery } from "@tanstack/react-query";
import { GeneracionResiduosService } from "../../services/hseqService";

export const useGetGeneracioResiduosById = (id) => {
    const obtenerGeneracionResiduos = async () => {
        const response = await GeneracionResiduosService.getGeneracionResiduosById(id);   
        return response.data;
    }

    const query = useQuery({
        queryKey: ["generacion-residuos", id],
        queryFn: obtenerGeneracionResiduos,
        enabled: !!id, // Solo ejecutar si el ID es válido
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    }
}