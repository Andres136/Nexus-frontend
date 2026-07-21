import axios from "axios";
import clienteAxios from "../config/axios";

const apiClient = axios.create({
  baseURL: clienteAxios.defaults.baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) window.location.href = "/auth/login";
    return Promise.reject(error);
  }
);

const publicClient = axios.create({
  baseURL: clienteAxios.defaults.baseURL,
  headers: { "Content-Type": "application/json" },
});

export const capacitacionEncuestaService = {
  getAll(params = {}) {
    return apiClient.get("api/capacitacion-encuestas", { params });
  },

  create(data) {
    return apiClient.post("api/capacitacion-encuestas", data);
  },

  update(uuid, data) {
    return apiClient.put(`api/capacitacion-encuestas/${uuid}`, data);
  },

  remove(uuid) {
    return apiClient.delete(`api/capacitacion-encuestas/${uuid}`);
  },

  usuarios(params = {}) {
    return apiClient.get("api/capacitacion-encuestas-usuarios", { params });
  },

  enviar(uuid, userIds) {
    return apiClient.post(`api/capacitacion-encuestas/${uuid}/enviar`, { user_ids: userIds });
  },

  resultados(uuid) {
    return apiClient.get(`api/capacitacion-encuestas/${uuid}/resultados`);
  },
};

export const capacitacionEncuestaPublicaService = {
  getByToken(token) {
    return publicClient.get(`api/capacitacion-encuestas/publica/${token}`);
  },

  responder(token, respuestas) {
    return publicClient.post(`api/capacitacion-encuestas/publica/${token}`, { respuestas });
  },
};
