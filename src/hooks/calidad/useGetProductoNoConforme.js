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

    return {
        data: data?.data || [],
        pagination: {
            currentPage: data?.current_page || 1,
            lastPage: data?.last_page || 1,
            total: data?.total || 0,
            perPage: data?.per_page || 10,
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
        producto: data || null,
        error,
        isLoading,
        refetch,
    };
};
