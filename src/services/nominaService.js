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


export  const tipoContratoService = {
  getTipoContratos() {
    return apiClient.get("api/nomina/tipo-contratos");
  },
  getTipoContrato(id) {
    return apiClient.get(`api/nomina/tipo-contratos/${id}`);
  },
  createTipoContrato(data) {
    return apiClient.post("api/nomina/tipo-contratos", data);
  },
  updateTipoContrato(id, data) {
    return apiClient.put(`api/nomina/tipo-contratos/${id}`, data);
  },
  deleteTipoContrato(id) {
    return apiClient.delete(`api/nomina/tipo-contratos/${id}`);
  },
};

export const seguridadSocialService = {
  getSeguridadSocial() {
    return apiClient.get("api/nomina/seguridad-social");
  },
  getSeguridadSocialById(id) {
    return apiClient.get(`api/nomina/seguridad-social/${id}`);
  },
  createSeguridadSocial(data) {
    return apiClient.post("api/nomina/seguridad-social", data);
  },
  updateSeguridadSocial(id, data) {
    return apiClient.put(`api/nomina/seguridad-social/${id}`, data);
  },
  deleteSeguridadSocial(id) {
    return apiClient.delete(`api/nomina/seguridad-social/${id}`);
  },
};


export const contratacionService = {
  getContratos() {
    return apiClient.get("api/nomina/contratacion");
  },
  getContratoById(id) {
    return apiClient.get(`api/nomina/contratacion/${id}`);
  },
    createContrato(data) {
    return apiClient.post("api/nomina/contratacion", data);
  },
  updateContrato(id, data) {
    return apiClient.put(`api/nomina/contratacion/${id}`, data);
  },
  deleteContrato(id) {
    return apiClient.delete(`api/nomina/contratacion/${id}`);
  },
};