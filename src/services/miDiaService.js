import apiClient from "./api";

export const miDiaService = {
  getEstado: (params = {}) => apiClient.get("/api/mi-dia", { params }),
  getLineaTiempo: (params = {}) => apiClient.get("/api/mi-dia/linea-tiempo", { params }),
  getCategorias: () => apiClient.get("/api/mi-dia/categorias"),
  getSugerenciasTarea: (params = {}) => apiClient.get("/api/mi-dia/sugerencias-tarea", { params }),
  iniciarActividad: (data) => apiClient.post("/api/mi-dia/actividades/iniciar", data),
  marcarDisponible: () => apiClient.post("/api/mi-dia/disponible"),
  completarActividad: (uuid, data) => apiClient.post(`/api/mi-dia/actividades/${uuid}/completar`, data),
  bloquearActividad: (uuid, data) => apiClient.post(`/api/mi-dia/actividades/${uuid}/bloquear`, data),
  cancelarActividad: (uuid) => apiClient.post(`/api/mi-dia/actividades/${uuid}/cancelar`),
  reanudarActividad: (uuid) => apiClient.post(`/api/mi-dia/actividades/${uuid}/reanudar`),
};
