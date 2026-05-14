
import { useQuery } from "@tanstack/react-query"
import { cuentasContablesService } from "../../services/contabilidadService";
export const useGetPuck = () => {

    const  obtenerPucks = async () => {
         const response = await cuentasContablesService.getCuentasContables();
         return response.data.data;
         //
        // return response.data.data;
    }

    const { data: pucks, isLoading, error } = useQuery({
        queryKey: ["pucks"],
        queryFn: obtenerPucks,
    });
    return{
        pucks,
        isLoading,
        error,
    }
}