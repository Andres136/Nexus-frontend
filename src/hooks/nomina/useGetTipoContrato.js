import { useQuery } from "@tanstack/react-query";
import { tipoContratoService } from "../../services/nominaService";

export const useGetTipoContrato = () => {
    const fetchTipoContrato = async () => {
        const response =
            await tipoContratoService.getTipoContratos();

        return response.data;
    };

    const {
        data: tipoContratos,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["tipoContratos"],
        queryFn: fetchTipoContrato,
        staleTime: 1000 * 60 * 5,
    });

    return {
        tipoContratos,
        isLoading,
        error,
        refetch,
    };
};