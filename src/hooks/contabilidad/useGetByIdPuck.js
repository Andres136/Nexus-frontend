import { useQuery } from "@tanstack/react-query";
import { cuentasContablesService } from "../../services/contabilidadService";

    export const useGetByIdPuck = (id) => {
    const fetchPuckById = async () => {
        const response = await cuentasContablesService.getCuentaContableById(id);
        return response.data.data;
    };

    const { data: puck, isLoading, error } = useQuery({
        queryKey: ["puck", id],
        queryFn: fetchPuckById,
        enabled: !!id, 
    });

    return {
        puck,
        isLoading,
        error,
    };
}