import axios from "axios";
import clienteAxios from "../config/axios";

const api = axios.create({ baseURL: clienteAxios.defaults.baseURL, headers: { "Content-Type": "application/json" } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const publicApi = axios.create({ baseURL: clienteAxios.defaults.baseURL, headers: { "Content-Type": "application/json" } });

export const capacitacionActaService = {
  list(params = {}) {
    return api.get("api/capacitacion-actas", { params });
  },
  companies() {
    return api.get("api/capacitacion-actas-empresas");
  },
  get(capacitacionUuid) {
    return api.get(`api/capacitaciones/${capacitacionUuid}/acta`);
  },
  save(capacitacionUuid, data) {
    return api.put(`api/capacitaciones/${capacitacionUuid}/acta`, data);
  },
  send(capacitacionUuid, userIds) {
    return api.post(`api/capacitaciones/${capacitacionUuid}/acta/enviar`, { user_ids: userIds });
  },
  users(params = {}) {
    return api.get("api/capacitacion-encuestas-usuarios", { params });
  },
  publicGet(token) {
    return publicApi.get(`api/capacitacion-actas/publica/${token}`);
  },
  sign(token, data) {
    return publicApi.post(`api/capacitacion-actas/publica/${token}/firmar`, data);
  },
  pdf(capacitacionUuid, empresaId) {
    return api.get(`api/capacitaciones/${capacitacionUuid}/acta/pdf`, {
      params: { empresa_id: empresaId },
      responseType: "blob",
    });
  },
};
