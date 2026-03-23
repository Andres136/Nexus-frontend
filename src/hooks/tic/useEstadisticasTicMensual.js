import { useQuery } from "@tanstack/react-query";
import { mantenimientoEquiposTicService } from "../../services/ticService";


export const useEstadisticasTicMensual = (year) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["estadisticasTicMensual", year],
    queryFn: async () => {
      const res = await mantenimientoEquiposTicService.getEstadisticasMantenimientoTic({ year });
      //console.log("res mensual tic", res)
      
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    data,
    error,
    isLoading,
  };
}