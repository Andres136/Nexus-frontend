import axios from "axios";
import clienteAxios from "../config/axios";

const apiClient = axios.create({
  baseURL: clienteAxios.defaults.baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const corporateDocumentsService = {
  listPublic: () => apiClient.get("/api/corporate-documents"),
  showPublic: (slug) => apiClient.get(`/api/corporate-documents/${slug}`),
  registerDownload: (slug) => apiClient.post(`/api/corporate-documents/${slug}/download`),
  listAdmin: (params = {}) => apiClient.get("/api/admin/corporate-documents", { params }),
  showAdmin: (id) => apiClient.get(`/api/admin/corporate-documents/${id}`),
  create: (formData) =>
    apiClient.post("/api/admin/corporate-documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    apiClient.post(`/api/admin/corporate-documents/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deactivate: (id) => apiClient.delete(`/api/admin/corporate-documents/${id}`),
};
