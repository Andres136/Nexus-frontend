import { useQuery } from "@tanstack/react-query"
import { carteraApi } from "../../services/api"

export const useListaCartera = (filtros = {}) => {

  const obtenerCartera = async () => {

    const response = await carteraApi.getCartera(filtros)

 // console.log("Respuesta API:", response.data)

    // devolver TODA la paginación
    return response.data.data
  }

  const query = useQuery({
    queryKey: ["cartera", filtros],
    queryFn: obtenerCartera,
    keepPreviousData: true
  })

  return {
    registros: query.data?.data || [],
    pagination: query.data,
    isLoading: query.isLoading,
    error: query.error
  }
}