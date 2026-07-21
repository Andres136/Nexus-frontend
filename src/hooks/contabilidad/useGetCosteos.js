import { useQuery } from "@tanstack/react-query";
import { costeosService } from "../../services/contabilidadService";

export const useGetCosteos = (params = {}) => {
    const {
        data,
        error,
        isLoading,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ["costeos", params],
        queryFn: async () => {
            const response =
                await costeosService.getCosteos(
                    params
                );

            console.log(
                "Costeos:",
                response.data
            );

            return response.data.data;
        },
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });

    return {
        /*
        |--------------------------------------------------------------------------
        | DATA COMPATIBLE
        |--------------------------------------------------------------------------
        */
        data:
            data?.detalle?.data ||
            data?.detalle ||
            [],

        /*
        |--------------------------------------------------------------------------
        | PAGINACIÓN
        |--------------------------------------------------------------------------
        */
        pagination: {
            currentPage:
                data?.detalle?.current_page ||
                1,

            lastPage:
                data?.detalle?.last_page ||
                1,

            total:
                data?.detalle?.total ||
                0,

            perPage:
                data?.detalle?.per_page ||
                50,

            nextPageUrl:
                data?.detalle?.next_page_url ||
                null,

            prevPageUrl:
                data?.detalle?.prev_page_url ||
                null,
        },

        /*
        |--------------------------------------------------------------------------
        | RESUMEN GLOBAL
        |--------------------------------------------------------------------------
        */
        resumen:
            data?.resumen || {
                total_productos: 0,
                total_kg_vendidos: 0,
                total_ingreso: 0,
                total_costo: 0,
                total_kg_comprado: 0,
                total_costo_comprado: 0,
                total_utilidad: 0,
                margen_global: 0,
            },

        error,
        isLoading,
        refetch,
        isFetching,
    };
};