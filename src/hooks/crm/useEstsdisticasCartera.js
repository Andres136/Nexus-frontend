import { useQuery } from "@tanstack/react-query"
import { carteraApi } from "../../services/api"


export const useEstadisticasCartera = (year) => {

  const obtenerEstadisticas = async () => {
    const response = await carteraApi.getEstadisticasCartera({ year })
    //console.log("Respuesta de estadísticas de cartera:", response.data) // Verificar la estructura de la respuesta

    return response.data.data
  }

  const query = useQuery({
    queryKey: ["estadisticas-cartera", year],
    queryFn: obtenerEstadisticas
  })

  return {
    timeline: query.data?.timeline || [],
    total_vencido: query.data?.total_vencido || 0,
    total_cartera: query.data?.total_cartera || 0,
    porcentaje_vencido: query.data?.porcentaje_vencido || 0,
    isLoading: query.isLoading
  }
}