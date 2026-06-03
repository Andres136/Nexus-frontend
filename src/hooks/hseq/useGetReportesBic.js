import { useQuery } from "@tanstack/react-query";
import { reportesBicApi } from "../../services/api";
export const useGetReportesBic = () => {

  const obtenerReportesBic = async () => {
    const response = await reportesBicApi.getAll();
    //console.log("Respuesta de reportes BIC:", response.data) // Verificar la estructura de la respuesta
    return response.data.data;
  }

  const { data: reportesBic, isLoading, error } = useQuery({
    queryKey: ["reportesBic"],
    queryFn: obtenerReportesBic,
  })

    return{
        reportesBic,
        isLoading,
        error
    }
}