import { useQuery } from "@tanstack/react-query";
import { facturasService } from "../../services/contabilidadService";

export const useGetFacturasCompras = (
    page = 1,
    search = "",
    filters = {}
) => {

    const obtenerFacturasCompras = async () => {
        try {
            const response =
                await facturasService.getFacturas({
                    page,
                    search,
                    ...filters,
                });

            console.log(
                "Respuesta del servicio:",
                response.data
            );

            // 🔥 Mantiene compatibilidad
            return response.data.data;

        } catch (error) {
            console.error(
                "Error al obtener facturas:",
                error
            );
            throw error;
        }
    };

    const {
        data,
        error,
        isLoading,
        refetch,
        isFetching
    } = useQuery({
        queryKey: [
            "facturasCompras",
            page,
            search,
            filters
        ],
        queryFn: obtenerFacturasCompras,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });

    return {
        /*
        |--------------------------------------------------------------------------
        | FACTURAS
        |--------------------------------------------------------------------------
        */
        facturas:
            data?.facturas?.data ||
            data?.data ||
            [],

        /*
        |--------------------------------------------------------------------------
        | PAGINACIÓN
        |--------------------------------------------------------------------------
        */
        pagination: {
            currentPage:
                data?.facturas?.current_page ||
                data?.current_page ||
                1,

            lastPage:
                data?.facturas?.last_page ||
                data?.last_page ||
                1,

            total:
                data?.facturas?.total ||
                data?.total ||
                0,

            perPage:
                data?.facturas?.per_page ||
                data?.per_page ||
                15,

            nextPageUrl:
                data?.facturas?.next_page_url ||
                data?.next_page_url ||
                null,

            prevPageUrl:
                data?.facturas?.prev_page_url ||
                data?.prev_page_url ||
                null,
        },

        /*
        |--------------------------------------------------------------------------
        | RESUMEN GLOBAL
        |--------------------------------------------------------------------------
        */
        resumen: data?.resumen || {
            total_facturas: 0,
            total_subtotal: 0,
            total_general: 0,
            total_saldo_pendiente: 0,
            total_pagado: 0,
        },

        error,
        isLoading,
        refetch,
        isFetching,
    };
};