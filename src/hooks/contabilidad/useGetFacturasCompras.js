import { useQuery } from "@tanstack/react-query";
import { facturasService } from "../../services/contabilidadService";

export const useGetFacturasCompras = (page = 1, search = "") => {

    const obtenerFacturasCompras = async () => {
        try {
            const response = await facturasService.getFacturas({
                page,
                search
            });

            console.log("Respuesta del servicio:", response.data);

            // 🔥 response.data.data contiene paginación
            return response.data.data;

        } catch (error) {
            console.error("Error al obtener facturas:", error);
            throw error;
        }
    };

    const { data, error, isLoading } = useQuery({
        queryKey: ['facturasCompras', page, search],
        queryFn: obtenerFacturasCompras,
        keepPreviousData: true,
    });

    return {
        facturas: data?.data || [],

        pagination: {
            currentPage: data?.current_page || 1,
            lastPage: data?.last_page || 1,
            total: data?.total || 0,
            perPage: data?.per_page || 15,
            nextPageUrl: data?.next_page_url || null,
            prevPageUrl: data?.prev_page_url || null,
        },

        error,
        isLoading
    };
};