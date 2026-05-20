import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tareaService } from "../../services/calidaService";
import { showToast } from "../../helpers/utils/showToast";

export function useHistorialTarea(tareaId, enabled = false) {
  const queryClient = useQueryClient();

  const { data: historial = [], isLoading } = useQuery({
    queryKey: ["tarea-historial", tareaId],
    queryFn: async () => {
      const res = await tareaService.getHistorial(tareaId);
      return res.data;
    },
    enabled: !!tareaId && enabled,
    retry: false,
  });

  const { mutateAsync: agregarNota, isPending: agregando } = useMutation({
    mutationFn: (nota) => tareaService.agregarNota(tareaId, nota),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarea-historial", tareaId] });
      showToast("success", "Nota registrada");
    },
    onError: (err) => {
      showToast("error", err.response?.data?.message ?? "Error al agregar nota");
    },
  });

  return { historial, isLoading, agregarNota, agregando };
}
