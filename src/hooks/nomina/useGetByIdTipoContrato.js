import { useQuery } from "@tanstack/react-query";
import { tipoContratoService } from "../../services/nominaService";

export const useGetByIdTipoContrato = (id) => {
    const fetchTipoContratoById = async () => {
        const response =
            await tipoContratoService.getTipoContrato(
                id
            );

        return response.data;
    };

    const {
        data: tipoContrato,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["tipoContrato", id],
        queryFn: fetchTipoContratoById,
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });

    return {
        tipoContrato,
        isLoading,
        error,
        refetch,
    };
};