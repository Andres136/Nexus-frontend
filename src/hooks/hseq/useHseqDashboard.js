import { useQuery } from "@tanstack/react-query"
import { HallazgosInspeccionesService} from "../../services/hseqService"

export const useHseqDashboard = (filters) => {

  const obtenerDatosDashboard = async () => {
    const response = await HallazgosInspeccionesService.getEstadisticasHseq(filters);
    return response.data;
  }

  const query = useQuery({
    queryKey: ["hseqDashboardData", filters],
    queryFn: obtenerDatosDashboard,
      keepPreviousData: true, // 🔥 evita parpadeos
  })

  return {
    ...query
  }
}