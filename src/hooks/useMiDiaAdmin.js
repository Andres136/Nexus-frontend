import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { miDiaAdminService } from "../services/miDiaAdminService";
import { showToast } from "../helpers/utils/showToast";

function mensajeError(error, fallback = "Ocurrió un error. Intenta de nuevo.") {
  const errores = error?.response?.data?.errors;
  if (errores) {
    return Object.values(errores).flat().join(" | ");
  }
  return error?.response?.data?.message || fallback;
}

export function useEquipoProductividad(filters) {
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["mi-dia-admin-equipo", filters],
    queryFn: async () => {
      const response = await miDiaAdminService.getEquipo(filters);
      return response.data?.data;
    },
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });

  return {
    equipo: data?.data ?? [],
    pagination: {
      currentPage: data?.current_page || 1,
      lastPage: data?.last_page || 1,
      total: data?.total || 0,
      perPage: data?.per_page || 15,
    },
    error,
    isLoading,
    isFetching,
  };
}

export function useUsuarioProductividad(userId, filters = {}) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["mi-dia-admin-usuario", userId, filters],
    queryFn: async () => {
      const response = await miDiaAdminService.getUsuarioDetalle(userId, filters);
      return response.data?.data;
    },
    enabled: !!userId,
  });

  return {
    detalle: data ?? null,
    error,
    isLoading,
  };
}

export function useCorregirActividad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }) => miDiaAdminService.corregirActividad(uuid, data),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Actividad corregida exitosamente");
      queryClient.invalidateQueries({ queryKey: ["mi-dia-admin-equipo"] });
      queryClient.invalidateQueries({ queryKey: ["mi-dia-admin-usuario"] });
    },
    onError: (error) => showToast("error", mensajeError(error, "No se pudo corregir la actividad.")),
  });
}

export function useExportarProductividad() {
  const [exportando, setExportando] = useState(false);

  const handleExportar = async (filters = {}) => {
    setExportando(true);
    try {
      const response = await miDiaAdminService.exportar(filters);
      const url = window.URL.createObjectURL(new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `productividad_equipo_${filters.fecha || "hoy"}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      let message = "No se pudo exportar el archivo.";
      if (error.response?.data instanceof Blob) {
        try {
          const data = JSON.parse(await error.response.data.text());
          message = data.message || message;
        } catch {
          // La respuesta no contiene un error JSON legible.
        }
      }
      showToast("error", message);
    } finally {
      setExportando(false);
    }
  };

  return { exportando, handleExportar };
}
