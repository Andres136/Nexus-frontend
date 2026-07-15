import { useQuery } from "@tanstack/react-query";
import { productoNoConformeService } from "../../services/calidaService";

export const useEstadisticasProductoNoConforme = (filtros = {}) => {
    const query = useQuery({
        queryKey: ["producto-no-conforme-estadisticas", filtros],
        queryFn: async () => {
            const response = await productoNoConformeService.estadisticasProductoNoConforme(filtros);
            return response.data.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
};
