import axios from "axios";
import clienteAxios from "../config/axios";

const apiClient = axios.create({
  baseURL: clienteAxios.defaults.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token de autorización a cada solicitud
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
//Interceptor para manejar respuestas y errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Manejar errores específicos según el código de estado
      if (error.response.status === 401) {
        // Por ejemplo, redirigir al usuario a la página de login si no está autorizado
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);
export const ticService = {
    create(data) {
        return apiClient.post("api/asignaciones", data);
    },
    getAll(params) {
        return apiClient.get("api/asignaciones", { params });
    },
    getById(id) {
        return apiClient.get(`api/asignaciones/${id}`);
    },
    update(id, data) {
        return apiClient.put(`/asignaciones/${id}`, data);
    },
    delete(id, data) {
        return apiClient.delete(`api/asignaciones/${id}`,{
          data
        });
    },
    getAsignacionesByUsuario(userId, params = {}) {
        return apiClient.get(`api/asignaciones/usuario/${userId}`, { params });
    },
}

export const ticketService = {
  getAll(params) {
    return apiClient.get("api/tickets", { params });
  },
  getById(id) {
    return apiClient.get(`api/tickets/${id}`);
  },
  getAssignedSummary() {
    return apiClient.get("api/tickets/resumen-asignados");
  },
  getDowntimeStats(params = {}) {
    return apiClient.get("api/tickets/estadisticas-paradas", { params });
  },
  create(data) {
    return apiClient.post("api/tickets", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update(id, data) {
    if (data instanceof FormData && !data.has("_method")) {
      data.append("_method", "PUT");
    }

    return apiClient.post(`api/tickets/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  changeStatus(id, data) {
    return apiClient.patch(`api/tickets/${id}/estado`, data);
  },
  addHistory(id, data) {
    return apiClient.post(`api/tickets/${id}/historial`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete(id) {
    return apiClient.delete(`api/tickets/${id}`);
  },
};

//MANTENIMIENTO DE EQUIPOS TIC
export const mantenimientoEquiposTicService = {
  getAll(params) {
    return apiClient.get("api/mantenimiento-equipos-tic", { params });
  },
  getById(id) {
    return apiClient.get(`api/mantenimiento-equipos-tic/${id}`);
  },
  create(data) {
    return apiClient.post("api/mantenimiento-equipos-tic", data);
  },
  update: (id, formData) => apiClient.post(`/api/ejecutar-mantenimiento-equipos-tic/${id}`, formData,{
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
  actualizarMantenimiento(id, data) {

    return apiClient.post(`api/mantenimiento-equipos-tic/${id}/actualizar`, data);
  },

  getMantenimientosEquiposTic(params) {
    return apiClient.get("api/obtener-mantenimientos-tic", { params });
  },
  getEstadisticasMantenimientoTic(params) {
    return apiClient.get("api/tic-estadisticas-mensuales", { params });
  }
};
