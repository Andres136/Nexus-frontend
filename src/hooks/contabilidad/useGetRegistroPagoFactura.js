import { useQuery } from "@tanstack/react-query";
import { abonosFacturaCompraService } from "../../services/contabilidadService";

export const useGetRegistroPagoFactura = ({
    proveedor_id = "",
    fecha_inicio = "",
    fecha_fin = "",
    estado_id = "",
    search = "",
    page = 1
} = {}) => {

    const obtenerRegistroPago = async () => {
        const params = {
            proveedor_id,
            fecha_inicio,
            fecha_fin,
            estado_id,
            search,
            page
        };

        const response = await abonosFacturaCompraService.getAbonos(params);

        console.log("Respuesta del servicio de pagos:", response.data);

        return response.data.data;
    };

    const {
        data,
        error,
        isLoading,
        refetch,
        isFetching
    } = useQuery({
        queryKey: [
            "registro-pago-factura",
            proveedor_id,
            fecha_inicio,
            fecha_fin,
            estado_id,
            search,
            page
        ],
        queryFn: obtenerRegistroPago,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
        enabled: true,
    });

    return {
        data, // paginación completa
        pagos: data?.data || [], // registros
        currentPage: data?.current_page || 1,
        totalPages: data?.last_page || 1,
        total: data?.total || 0,
        perPage: data?.per_page || 20,
        nextPageUrl: data?.next_page_url || null,
        prevPageUrl: data?.prev_page_url || null,
        error,
        isLoading,
        refetch,
        isFetching
    };
};