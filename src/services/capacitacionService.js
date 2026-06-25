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

export const capacitacionService = {
  getAll(params = {}) {
    return apiClient.get("api/capacitaciones", { params });
  },

  getOne(uuid) {
    return apiClient.get(`api/capacitaciones/${uuid}`);
  },

  create(data) {
    return apiClient.post("api/capacitaciones", data);
  },

  update(uuid, data) {
    return apiClient.put(`api/capacitaciones/${uuid}`, data);
  },

  remove(uuid) {
    return apiClient.delete(`api/capacitaciones/${uuid}`);
  },
};
