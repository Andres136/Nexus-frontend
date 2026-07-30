import axios from "axios";
import clienteAxios from "../config/axios";

const apiClient = axios.create({
  baseURL: clienteAxios.defaults.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export const RedSocialService = {
  getRedesSociales: (params) => apiClient.get("/api/redes-sociales", { params }),
  createRedSocial: (data) => apiClient.post("/api/redes-sociales", data),
  updateRedSocial: (id, data) => apiClient.put(`/api/redes-sociales/${id}`, data),
  deleteRedSocial: (id) => apiClient.delete(`/api/redes-sociales/${id}`),
};

export const TipoPostService = {
  getTiposPost: (params) => apiClient.get("/api/tipos-post", { params }),
  createTipoPost: (data) => apiClient.post("/api/tipos-post", data),
  updateTipoPost: (id, data) => apiClient.put(`/api/tipos-post/${id}`, data),
  deleteTipoPost: (id) => apiClient.delete(`/api/tipos-post/${id}`),
};

export const PublicacionMarketingService = {
  getPublicaciones: (params) => apiClient.get("/api/publicaciones-marketing", { params }),
  createPublicacion: (data) => apiClient.post("/api/publicaciones-marketing", data),
  updatePublicacion: (id, data) => apiClient.put(`/api/publicaciones-marketing/${id}`, data),
  deletePublicacion: (id) => apiClient.delete(`/api/publicaciones-marketing/${id}`),
};
