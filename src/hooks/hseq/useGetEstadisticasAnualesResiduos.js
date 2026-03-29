import { useQuery } from "@tanstack/react-query";
import { HseqDashboardService } from "../../services/hseqService";


export const useGetEstadisticasAnualesResiduos = (filtros = {}) => {

    const obtenerEstadisticasAnualesResiduos = async () => {
        const response = await HseqDashboardService.getEstadisticasGeneracionResiduos(filtros);
        // console.log("Respuesta del dashboard de residuos:", response.data);
        return response?.data?.data || {
            anio: null,
            timeline: []
        };
    };

    const query = useQuery({
        queryKey: [
            "estadisticas-anuales-residuos",
            filtros.anio,
            filtros.sede_id,
            filtros.tipo_residuo_id,
            filtros.search,
            filtros.fecha_inicio,
            filtros.fecha_fin
        ],
        queryFn: obtenerEstadisticasAnualesResiduos,
        keepPreviousData: true
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch
    };
};