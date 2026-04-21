import { useQuery } from "@tanstack/react-query";
import { impuestosService } from "../../services/contabilidadService";

export const useGetImpuesto = () => {
    const fetchImpuestos = async () => {
        const response = await impuestosService.getImpuestos();
        return response.data.data;
    };

    const { data: impuestos, isLoading, error } = useQuery({
        queryKey: ["impuestos"],
        queryFn: fetchImpuestos,
    });

    return {
        impuestos,
        isLoading,
        error,
    };
}