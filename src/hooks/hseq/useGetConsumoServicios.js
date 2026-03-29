import { useQuery } from "@tanstack/react-query";
import { ConsumoServiciosService } from "../../services/hseqService";



export const useGetConsumoServicios = (filtros = {}) => {
    const obtenerConsumoServicios = async () => {
        const response = await ConsumoServiciosService.getConsumoServicios();

     // console.log("Respuesta:", response.data);
        return {
            data: response.data.data,
            total: response.data.total,
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            per_page: response.data.per_page
        };
    };

    const query = useQuery({
        queryKey: [
            "consumo_servicios",
            filtros.sede_id,
            filtros.tipo_servicio_id,
            filtros.fecha_inicio,
            filtros.fecha_fin,
            filtros.page,
            filtros.per_page
        ],
        queryFn: obtenerConsumoServicios,
        keepPreviousData: true
    });

    return {
        data: query.data?.data || [],
        meta: {
            total: query.data?.total || 0,
            current_page: query.data?.current_page || 1,
            last_page: query.data?.last_page || 1,
            per_page: query.data?.per_page || 10
        },
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch
    };
}