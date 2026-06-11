import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { vsmConfiguracionService } from "../../services/vsm"

export const useVsmConfiguracionVigente = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["vsm-configuracion-vigente"],
    queryFn: async () => {
      const res = await vsmConfiguracionService.vigente()
      return res.data
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  return { config: data?.data ?? null, isLoading }
}

export const useVsmConfiguracionHistorial = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["vsm-configuracion-historial"],
    queryFn: async () => {
      const res = await vsmConfiguracionService.historial()
      return res.data
    },
    refetchOnWindowFocus: false,
  })

  return { historial: data, isLoading }
}

export const useCrearVsmConfiguracion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => vsmConfiguracionService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vsm-configuracion-vigente"] })
      queryClient.invalidateQueries({ queryKey: ["vsm-configuracion-historial"] })
      queryClient.invalidateQueries({ queryKey: ["productividad-individual"] })
    },
  })
}

export const useActualizarVsmConfiguracion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => vsmConfiguracionService.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vsm-configuracion-vigente"] })
      queryClient.invalidateQueries({ queryKey: ["vsm-configuracion-historial"] })
      queryClient.invalidateQueries({ queryKey: ["productividad-individual"] })
    },
  })
}

export const useEliminarVsmConfiguracion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => vsmConfiguracionService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vsm-configuracion-historial"] })
    },
  })
}

export const useRestaurarVsmConfiguracion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => vsmConfiguracionService.restaurar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vsm-configuracion-vigente"] })
      queryClient.invalidateQueries({ queryKey: ["vsm-configuracion-historial"] })
      queryClient.invalidateQueries({ queryKey: ["productividad-individual"] })
    },
  })
}
