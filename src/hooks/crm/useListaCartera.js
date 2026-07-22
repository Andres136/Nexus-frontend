import { useQuery } from "@tanstack/react-query"
import { carteraApi } from "../../services/api"

export const useListaCartera = (filtros = {}) => {

  const obtenerCartera = async () => {


    const response = await carteraApi.getCartera(filtros)

//console.log("Respuesta de cartera API:", response.data) // Verificar la estructura de la respuesta

    // devolver TODA la paginación
return {
  ...response.data.data,
  total_cartera: response.data.total,
  total_vencido: response.data.total_vencido
}
  }

  const query = useQuery({
 queryKey: [
 "cartera",
 filtros.buscar,
 filtros.buscar_por,
 filtros.fecha_inicio,
 filtros.fecha_fin,
 filtros.cliente_id,
 filtros.user_comercial_id,
 filtros.estado,
 filtros.page,
 filtros.per_page
],
    queryFn: obtenerCartera,
    keepPreviousData: true
  })

  return {
    registros: query.data?.data || [],
    pagination: query.data,
    isLoading: query.isLoading,
    error: query.error,
    total_cartera: query.data?.total_cartera || 0,
    total_vencido: query.data?.total_vencido || 0

    
  }
}