import { useQuery } from "@tanstack/react-query";
import { TipoResiduosService } from "../../services/hseqService";

export const useGetTipoResiduos = () => {
    const obtenerTipoResiduos = async () => {
        const response = await TipoResiduosService.getTipoResiduos();
       // console.log("Respuesta de tipos de residuos:", response.data) // Verificar la estructura de la respuesta
        return response.data;
    }

    const query = useQuery({
        queryKey: ["tipoResiduos"],
        queryFn: obtenerTipoResiduos,
    })

    return{
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    }
}