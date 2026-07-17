import apiClient from "./api";

export const miDiaAdminService = {
  getEquipo: (params = {}) => apiClient.get("/api/admin/productividad/equipo", { params }),
  getUsuarioDetalle: (id, params = {}) => apiClient.get(`/api/admin/productividad/usuarios/${id}`, { params }),
  corregirActividad: (uuid, data) => apiClient.post(`/api/admin/productividad/actividades/${uuid}/corregir`, data),
  exportar: (params = {}) => apiClient.get("/api/admin/productividad/equipo/exportar", { params, responseType: "blob" }),
};
