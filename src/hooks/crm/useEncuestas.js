import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { encuestaService } from "../../services/encuestaService";
import { showToast } from "../../helpers/utils/showToast";

const QUERY_KEY = ["encuestas"];

export const useEncuestas = () => {
  const queryClient = useQueryClient();

  // ─── Lista ────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await encuestaService.getAll();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ─── Crear ────────────────────────────────────────────────────────────────
  const { mutate: crearEncuesta, isPending: isCreando } = useMutation({
    mutationFn: (data) => encuestaService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast("success", res.data.message ?? "Encuesta creada");
    },
    onError: (err) => {
      showToast("error", err.response?.data?.message ?? "Error al crear la encuesta");
    },
  });

  // ─── Actualizar ───────────────────────────────────────────────────────────
  const { mutate: actualizarEncuesta, isPending: isActualizando } = useMutation({
    mutationFn: ({ id, data }) => encuestaService.update(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast("success", res.data.message ?? "Encuesta actualizada");
    },
    onError: (err) => {
      showToast("error", err.response?.data?.message ?? "Error al actualizar");
    },
  });

  // ─── Eliminar ─────────────────────────────────────────────────────────────
  const { mutate: eliminarEncuesta, isPending: isEliminando } = useMutation({
    mutationFn: (id) => encuestaService.remove(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast("success", res.data.message ?? "Encuesta eliminada");
    },
    onError: (err) => {
      showToast("error", err.response?.data?.message ?? "Error al eliminar");
    },
  });

  return {
    encuestas: data ?? [],
    isLoading,
    isError,
    crearEncuesta,
    isCreando,
    actualizarEncuesta,
    isActualizando,
    eliminarEncuesta,
    isEliminando,
  };
};

// Hook separado para el detalle de una encuesta (con preguntas + envíos)
export const useEncuestaDetalle = (id) => {
  return useQuery({
    queryKey: ["encuesta", id],
    queryFn: async () => {
      const res = await encuestaService.getOne(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
