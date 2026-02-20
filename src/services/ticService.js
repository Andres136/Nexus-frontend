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
}