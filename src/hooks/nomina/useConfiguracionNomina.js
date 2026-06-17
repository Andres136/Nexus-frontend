import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { configuracionNominaService } from "../../services/nominaService";

export function useConfiguracionNomina() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["configuracionNomina"],
    queryFn: async () => {
      const response = await configuracionNominaService.getConfiguracion();
      return response.data.data;
    },
  });

  return { configuracion: data ?? null, isLoading, error, refetch };
}

export function useUpdateConfiguracionNomina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => configuracionNominaService.updateConfiguracion(payload),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Configuración de nómina actualizada");
      queryClient.invalidateQueries({ queryKey: ["configuracionNomina"] });
      queryClient.invalidateQueries({ queryKey: ["nominas"] });
      queryClient.invalidateQueries({ queryKey: ["nominaSummary"] });
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No fue posible guardar la configuración");
    },
  });
}

export function useSubirFirmaConfiguracionNomina({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => configuracionNominaService.subirFirma(file),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Firma guardada correctamente");
      queryClient.invalidateQueries({ queryKey: ["configuracionNomina"] });
      onSuccess?.(response);
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No fue posible guardar la firma");
    },
  });
}
