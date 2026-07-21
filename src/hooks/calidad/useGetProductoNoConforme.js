import { useQuery } from "@tanstack/react-query";
import { productoNoConformeService } from "../../services/calidaService";

export const useGetProductoNoConforme = (params = {}) => {
    const { data, error, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["producto-no-conforme", params],
        queryFn: async () => {
            const response = await productoNoConformeService.getAll(params);
            return response.data;
        },
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });

    const paginador = data?.data;

    return {
        data: paginador?.data || [],
        pagination: {
            currentPage: paginador?.current_page || 1,
            lastPage: paginador?.last_page || 1,
            total: paginador?.total || 0,
            perPage: paginador?.per_page || 10,
        },
        error,
        isLoading,
        isFetching,
        refetch,
    };
};

export const useGetProductoNoConformeById = (id) => {
    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["producto-no-conforme", id],
        queryFn: async () => {
            const response = await productoNoConformeService.getById(id);
            return response.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });

    return {
        producto: data?.data || null,
        error,
        isLoading,
        refetch,
    };
};
