
import { useQuery } from "@tanstack/react-query"
import { TipoInspeccionesService } from "../../services/hseqService";
export const useGetTipoInspecciones = () => {

    const obtenerTipoInspecciones = async () => {
  
     const response = await TipoInspeccionesService.getTipoInspeccion();

        return response.data;
    }

    const query = useQuery({
        queryKey: ["tipoInspecciones"],
        queryFn: obtenerTipoInspecciones,
    })

    //Traer  data, id

   
    return{
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    }
}