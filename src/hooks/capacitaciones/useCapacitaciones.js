import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { capacitacionService } from "../../services/capacitacionService";
import { showToast } from "../../helpers/utils/showToast";

const QUERY_KEY = ["capacitaciones"];

export const useCapacitaciones = (filters = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: async () => {
      const response = await capacitacionService.getAll(filters);
      return response.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const crearCapacitacion = useMutation({
    mutationFn: (data) => capacitacionService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast("success", response.data?.message || "Capacitación creada");
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo crear la capacitación");
    },
  });

  const actualizarCapacitacion = useMutation({
    mutationFn: ({ uuid, data }) => capacitacionService.update(uuid, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast("success", response.data?.message || "Capacitación actualizada");
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo actualizar la capacitación");
    },
  });

  const eliminarCapacitacion = useMutation({
    mutationFn: (uuid) => capacitacionService.remove(uuid),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast("success", response.data?.message || "Capacitación eliminada");
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo eliminar la capacitación");
    },
  });

  return {
    capacitaciones: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    crearCapacitacion: crearCapacitacion.mutate,
    isCreando: crearCapacitacion.isPending,
    actualizarCapacitacion: actualizarCapacitacion.mutate,
    isActualizando: actualizarCapacitacion.isPending,
    eliminarCapacitacion: eliminarCapacitacion.mutate,
    isEliminando: eliminarCapacitacion.isPending,
  };
};
