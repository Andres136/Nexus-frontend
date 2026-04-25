
import { useQuery } from "@tanstack/react-query"
import { ordenesServicioApi } from "../../services/api"

export const useOrdenesOsBydi = (id) => {

    const obtenerOrdenesById = async () => {

        const response = await ordenesServicioApi.getShow(id)
  console.log("🚀  response:", response);
        return response.data.data
    }

    const query = useQuery({
        queryKey: ["ordenes-servicio-by-id", id],
        queryFn: obtenerOrdenesById,
        keepPreviousData: true,
        enabled: !!id, // Solo ejecuta la consulta si hay un ID válido
    })

    return{
       orden: query.data || null,
         loading: query.isLoading,
         refetch: query.refetch
    }
}