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

export const calidadService = {
  getNovedades: (params) => apiClient.get("/api/novedades", { params }),
  // Otras funciones relacionadas con calidad pueden ser agregadas aquí
  getNovedadesById: (id) => apiClient.get(`/api/novedades/${id}`),
  updateNovedad: (id, formData) => apiClient.post(`/api/novedades/${id}`, formData,{
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
  
};

export  const hallazgosNovedadesService = {
  getHallazgos: () => apiClient.get("/api/hallazgos"),
 createHallazgo: (data) => apiClient.post("/api/hallazgos", data),
  getHallazgoById: (id) => apiClient.get(`/api/hallazgos/${id}`),
  updateHallazgo: (id, data) => apiClient.put(`/api/hallazgos/${id}`, data),
  deleteHallazgo: (id) => apiClient.delete(`/api/hallazgos/${id}`),
  getEstadisticasSemestrales: () => apiClient.get("/api/indicador-semestral"),
};

export const gestionOperativaService = {
  getvsm:(params)=> apiClient.get("/api/vsm/ordenes", { params }),

  updateGestion: (id, data) => apiClient.put(`/api/control-operativo/${id}`, data),

  deleteGestion: (id) => apiClient.delete(`/api/control-operativo/${id}`),
};