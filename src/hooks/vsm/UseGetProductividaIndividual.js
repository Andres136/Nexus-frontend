
import { useQuery } from "@tanstack/react-query"
import { vsmProduccionService } from "../../services/vsm"
export const useGetProductividadIndividual = (filters) => {

  const obtenerProductividad = async () => {
    const response = await vsmProduccionService.getRendimiento(filters)
   // console.log("Respuesta productividad individual:", response.data)
    return response.data
  }

  const { data, error, isLoading } = useQuery({
    queryKey: ["productividad-individual", filters],
    queryFn: obtenerProductividad,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  return {
    data,
    error,
    isLoading
  }
}