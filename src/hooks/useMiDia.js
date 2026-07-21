import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { miDiaService } from "../services/miDiaService";
import { showToast } from "../helpers/utils/showToast";

function mensajeError(error, fallback = "Ocurrió un error. Intenta de nuevo.") {
  const errores = error?.response?.data?.errors;
  if (errores) {
    return Object.values(errores).flat().join(" | ");
  }
  return error?.response?.data?.message || fallback;
}

export function useMiDia() {
  const queryClient = useQueryClient();

  const estadoQuery = useQuery({
    queryKey: ["mi-dia"],
    queryFn: async () => {
      const response = await miDiaService.getEstado();
      return response.data?.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const categoriasQuery = useQuery({
    queryKey: ["mi-dia-categorias"],
    queryFn: async () => {
      const response = await miDiaService.getCategorias();
      return response.data?.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["mi-dia"] });

  const iniciarActividad = useMutation({
    mutationFn: (data) => miDiaService.iniciarActividad(data),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Actividad iniciada");
      invalidar();
    },
    onError: (error) => showToast("error", mensajeError(error, "No se pudo iniciar la actividad.")),
  });

  const marcarDisponible = useMutation({
    mutationFn: () => miDiaService.marcarDisponible(),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Marcado como disponible");
      invalidar();
    },
    onError: (error) => showToast("error", mensajeError(error, "No se pudo marcar disponible.")),
  });

  const completarActividad = useMutation({
    mutationFn: ({ uuid, data }) => miDiaService.completarActividad(uuid, data),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Actividad completada");
      invalidar();
    },
    onError: (error) => showToast("error", mensajeError(error, "No se pudo completar la actividad.")),
  });

  const bloquearActividad = useMutation({
    mutationFn: ({ uuid, data }) => miDiaService.bloquearActividad(uuid, data),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Actividad bloqueada");
      invalidar();
    },
    onError: (error) => showToast("error", mensajeError(error, "No se pudo bloquear la actividad.")),
  });

  const cancelarActividad = useMutation({
    mutationFn: (uuid) => miDiaService.cancelarActividad(uuid),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Actividad cancelada");
      invalidar();
    },
    onError: (error) => showToast("error", mensajeError(error, "No se pudo cancelar la actividad.")),
  });

  const reanudarActividad = useMutation({
    mutationFn: (uuid) => miDiaService.reanudarActividad(uuid),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Actividad reanudada");
      invalidar();
    },
    onError: (error) => showToast("error", mensajeError(error, "No se pudo reanudar la actividad.")),
  });

  return {
    estado: estadoQuery.data,
    isLoading: estadoQuery.isLoading,
    isFetching: estadoQuery.isFetching,
    error: estadoQuery.error,
    categorias: categoriasQuery.data ?? [],
    loadingCategorias: categoriasQuery.isLoading,
    iniciarActividad,
    marcarDisponible,
    completarActividad,
    bloquearActividad,
    cancelarActividad,
    reanudarActividad,
  };
}
