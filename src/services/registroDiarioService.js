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

export const apiCliente = {
   create: (data) => apiClient.post(`/api/registro-diario`, data),
   getAll: () => apiClient.get(`/api/registro-diario`),
   getById: (id) => apiClient.get(`/api/registro-diario/${id}`),
   update: (id, data) => apiClient.put(`/api/registro-diario/${id}`, data),
   delete: (id) => apiClient.delete(`/api/registro-diario/${id}`),
   getEstadisticas: (anio) => apiClient.get(`/api/estadisticas-anuales-departamentos/${anio}`),
};

export const apiClientePreguntas = {
   create: (data) => apiClient.post(`/api/preguntas`, data),
   getAll: () => apiClient.get(`/api/preguntas`),
   getById: (id) => apiClient.get(`/api/preguntas/${id}`),
   update: (id, data) => apiClient.put(`/api/preguntas/${id}`, data),
   delete: (id) => apiClient.delete(`/api/preguntas/${id}`),
};


export const apiClienteVerificacion = {
   create: (data) => apiClient.post(`/api/verificacion`, data),
   getAll: () => apiClient.get(`/api/verificacion`),
   getById: (id) => apiClient.get(`/api/verificacion/${id}`),
   update: (id, data) => apiClient.put(`/api/verificacion/${id}`, data),
   delete: (id) => apiClient.delete(`/api/verificacion/${id}`),
   getEstadisticas: (anio) => apiClient.get(`/api/estadisticas-anuales-verificacion/${anio}`),
};
