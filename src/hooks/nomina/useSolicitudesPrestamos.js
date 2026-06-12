import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { portalEmpleadoService, solicitudPrestamoService } from "../../services/nominaService";

export const useGetSolicitudesPrestamos = (params = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["solicitudes-prestamos", params],
    queryFn: async () => {
      const response = await solicitudPrestamoService.getSolicitudes(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return { solicitudes: data, isLoading, error, refetch };
};

export const useGetPortalPrestamos = (params = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["portal-prestamos", params],
    queryFn: async () => {
      const response = await portalEmpleadoService.getPrestamos(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  return { prestamos: data, isLoading, error, refetch };
};

export const useCreatePortalPrestamo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => portalEmpleadoService.createPrestamo(payload),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Solicitud registrada");
      queryClient.invalidateQueries({ queryKey: ["portal-prestamos"] });
      queryClient.invalidateQueries({ queryKey: ["solicitudes-prestamos"] });
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo registrar la solicitud");
    },
  });
};

export const useGestionSolicitudPrestamo = () => {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["solicitudes-prestamos"] });
    queryClient.invalidateQueries({ queryKey: ["portal-prestamos"] });
    queryClient.invalidateQueries({ queryKey: ["descuentos"] });
  };

  const aprobar = useMutation({
    mutationFn: ({ uuid, payload }) => solicitudPrestamoService.aprobar(uuid, payload),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Préstamo aprobado");
      refresh();
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo aprobar la solicitud");
    },
  });

  const rechazar = useMutation({
    mutationFn: ({ uuid, payload }) => solicitudPrestamoService.rechazar(uuid, payload),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Solicitud rechazada");
      refresh();
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo rechazar la solicitud");
    },
  });

  return { aprobar, rechazar };
};
