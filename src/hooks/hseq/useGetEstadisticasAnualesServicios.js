import { useQuery } from "@tanstack/react-query";
import { HseqDashboardService } from "../../services/hseqService";



export const useGetEstadisticasAnualesServicios = (filtros = {}) => {

    const obtenerEstadisticasAnualesServicios = async () => {
        const response = await HseqDashboardService.getEstadisticasConsumo(filtros);
        return response.data.data; // 🔥 clave
    };

    const query = useQuery({
        queryKey: [
            "estadisticas-anuales-servicios",
            filtros.anio,
            filtros.sede_id,
            filtros.tipo_servicio_id,
            filtros.search,
            filtros.fecha_inicio,
            filtros.fecha_fin
        ],
        queryFn: obtenerEstadisticasAnualesServicios,
        keepPreviousData: true
    });

    return {
        data: query.data || {
            anio: null,
            timeline: []
        },
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch
    };
};