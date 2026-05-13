// hooks/contabilidad/useGetCosteos.js

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
            const response = await costeosService.getCosteos(params);

            console.log("Costeos:", response.data);

            return response.data.data;
        },
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });

    return {
        data: data?.detalle || [],
                resumen: data?.resumen || {},
        error,
        isLoading,
        refetch,
        isFetching
    };
};