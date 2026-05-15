import { useQuery } from "@tanstack/react-query";
import { productoNoConformeService } from "../../services/calidaService";

export const useGetByIdProductoNoConforme = (id) => {
    const obtenerProductoNoConforme = async () => {
        const response = await productoNoConformeService.getById(id);
        return response.data;
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["producto-no-conforme", id],
        queryFn: obtenerProductoNoConforme,
        enabled: !!id,
        retry: false,
    });

    return {
        data,
        isLoading,
        error,
        refetch,
    };
};
