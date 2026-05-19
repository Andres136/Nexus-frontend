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

export const clienteService = {
  getClientes(page = 1, search = "") {
    return apiClient.get(`api/clientes?page=${page}&search=${search}`);
  },
  getCliente(id) {
    return apiClient.get(`api/clientes/${id}`);
  },
  obtenerClientesAll(search = "") {
    return apiClient.get(`api/clientes-todos?search=${search}`);
  },
  createCliente(clienteData) {
    return apiClient.post("api/clientes", clienteData);
  },
  updateCliente(id, clienteData) {
    return apiClient.put(`api/clientes/${id}`, clienteData);
  },
  deleteCliente(id) {
    return apiClient.delete(`api/clientes/${id}`);
  },
  cambiarEstado(id, estadoId) {
    return apiClient.patch(`api/clientes/${id}/estado`, { estado_id: estadoId });
  },



};
  export const gestionClienteService = {
    registrarGestion(clienteId, gestionData) {
      return apiClient.post(`api/clientes/${clienteId}/seguimientos`, gestionData);
    },
    consultarHistorial(clienteId) {
      return apiClient.get(`api/clientes/${clienteId}`);
    },
  };