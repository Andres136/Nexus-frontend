import axios from "axios";
import clienteAxios from "../config/axios";

// ─── Cliente con auth (Bearer token) ─────────────────────────────────────────
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

// ─── Cliente sin auth (rutas públicas /r/{token}) ────────────────────────────
const publicClient = axios.create({
  baseURL: clienteAxios.defaults.baseURL,
  headers: { "Content-Type": "application/json" },
});

// ─── Encuestas (requieren auth) ───────────────────────────────────────────────
export const encuestaService = {
  getAll() {
    return apiClient.get("api/encuestas");
  },

  getOne(id) {
    return apiClient.get(`api/encuestas/${id}`);
  },

  create(data) {
    return apiClient.post("api/encuestas", data);
  },

  update(id, data) {
    return apiClient.put(`api/encuestas/${id}`, data);
  },

  remove(id) {
    return apiClient.delete(`api/encuestas/${id}`);
  },

  enviar(id, clienteIds) {
    return apiClient.post(`api/encuestas/${id}/enviar`, { cliente_ids: clienteIds });
  },

  getResultados(id, userId = null) {
    const params = userId ? { user_id: userId } : {};
    return apiClient.get(`api/encuestas/${id}/resultados`, { params });
  },

  getMisClientes() {
    return apiClient.get("api/clientes-registro-user");
  },

  getClientesParaEncuesta() {
    return apiClient.get("api/encuestas-clientes");
  },

  getIndiceGeneral() {
    return apiClient.get("api/encuestas-indice-general");
  },
};

// ─── Encuesta pública (sin auth) ──────────────────────────────────────────────
export const encuestaPublicaService = {
  getByToken(token) {
    return publicClient.get(`api/r/${token}`);
  },

  responder(token, respuestas) {
    return publicClient.post(`api/r/${token}`, { respuestas });
  },
};
