import { useQuery } from "@tanstack/react-query"
import { vsmProduccionService } from "../../services/vsm"

export const useGetRendimientoPorPeriodo = (filters) => {
  const { data, isLoading } = useQuery({
    queryKey: ["rendimiento-por-periodo", filters],
    queryFn: async () => {
      const res = await vsmProduccionService.getRendimientoPorPeriodo(filters)
      return res.data
    },
    refetchOnWindowFocus: false,
    retry: 1,
  })

  return {
    periodos:       data?.periodos        ?? [],
    metaHora:       data?.meta_hora       ?? 0,
    metaDiaria:     data?.meta_diaria     ?? 0,
    metaSemanal:    data?.meta_semanal    ?? 0,
    metaMensual:    data?.meta_mensual    ?? 0,
    horasDiarias:   data?.horas_diarias   ?? 0,
    horasSemanales: data?.horas_semanales ?? 0,
    isLoading,
  }
}
