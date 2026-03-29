import { useQuery } from "@tanstack/react-query";
import { TipoServiciosService } from "../../services/hseqService";

export const useGetTipoServicios = () => {
    const obtenerTipoServicios = async () => {
        const response = await  TipoServiciosService.getTipoServicios();
    //    console.log("Respuesta de tipos de servicios:", response.data) // Verificar la estructura de la respuesta
        return response.data.data;
    }

    const query = useQuery({
        queryKey: ["tipoServicios"],
        queryFn: obtenerTipoServicios,
    })

    return{
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    }
}