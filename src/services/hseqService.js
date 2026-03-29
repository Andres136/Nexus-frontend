import axios from "axios";
import clienteAxios from "../config/axios";
import { update } from "lodash";

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




export const TipoInspeccionesService = {
    getTipoInspeccion: () => apiClient.get("/api/tipo-inspecciones"),
    getTipoInspeccionById: (id) => apiClient.get(`/api/tipo-inspecciones/${id}`),
    createTipoInspeccion: (data) => apiClient.post("/api/tipo-inspecciones", data),
    updateTipoInspeccion: (id, data) => apiClient.put(`/api/tipo-inspecciones/${id}`, data),
    deleteTipoInspeccion: (id) => apiClient.delete(`/api/tipo-inspecciones/${id}`),
}
export  const PreguntasInspeccionesService = {
    getPreguntasInspeccion: () => apiClient.get("/api/preguntas-inspecciones"),
    createPreguntaInspeccion: (data) => apiClient.post("/api/preguntas-inspecciones", data),
    updatePreguntaInspeccion: (id, data) => apiClient.put(`/api/preguntas-inspecciones/${id}`, data),
    deletePreguntaInspeccion: (id) => apiClient.delete(`/api/preguntas-inspecciones/${id}`),
    getPreguntasInspeccionByTipo: (tipoInspeccionId) => apiClient.get(`/api/preguntas-inspecciones/${tipoInspeccionId}`),
    getPreguntasInspeccionTipoInspeccion: (params)=> apiClient.get("/api/preguntas-tipo-inspecciones", { params }),
}


export const InspeccionesHseqService = {
    getInspecciones: () => apiClient.get("/api/inspecciones-hseq"),
    createInspeccion: (data) => apiClient.post("/api/inspecciones-hseq", data),
    updateInspeccion: (id, data) => apiClient.put(`/api/inspecciones-hseq/${id}`, data),
    deleteInspeccion: (id) => apiClient.delete(`/api/inspecciones-hseq/${id}`),
}
export const RespuestasInspeccionesService = {
    getRespuestasInspeccion: () => apiClient.get("/api/respuestas-inspecciones"),
    createRespuestaInspeccion: (data) => apiClient.post("/api/respuestas-inspecciones", data),
    updateRespuestaInspeccion: (id, data) => apiClient.put(`/api/respuestas-inspecciones/${id}`, data),
    deleteRespuestaInspeccion: (id) => apiClient.delete(`/api/respuestas-inspecciones/${id}`),
}
export const HallazgosInspeccionesService = {
    getHallazgosInspeccion: () => apiClient.get("/api/hallazgos-inspecciones"),
    createHallazgoInspeccion: (data) => apiClient.post("/api/hallazgos-inspecciones", data),
    updateHallazgoInspeccion: (id, data) => apiClient.put(`/api/hallazgos-inspecciones/${id}`, data),
    deleteHallazgoInspeccion: (id) => apiClient.delete(`/api/hallazgos-inspecciones/${id}`),
    getEstadisticasHseq: (params) => apiClient.get("/api/hseq-dashboard", { params }),
}


export const TipoServiciosService = {
    getTipoServicios: () => apiClient.get("/api/tipo-servicios"),
    createTipoServicio: (data) => apiClient.post("/api/tipo-servicios", data),
    updateTipoServicio: (id, data) => apiClient.put(`/api/tipo-servicios/${id}`, data),
    deleteTipoServicio: (id) => apiClient.delete(`/api/tipo-servicios/${id}`),
}
export const TipoResiduosService = {
    getTipoResiduos: () => apiClient.get("/api/tipo-residuos"),
    createTipoResiduo: (data) => apiClient.post("/api/tipo-residuos", data),
    updateTipoResiduo: (id, data) => apiClient.put(`/api/tipo-residuos/${id}`, data),
    deleteTipoResiduo: (id) => apiClient.delete(`/api/tipo-residuos/${id}`),
}

export const ConsumoServiciosService = {
    getConsumoServicios: () => apiClient.get("/api/consumo-servicios"),
    createConsumoServicio: (data) => apiClient.post("/api/consumo-servicios", data),
    updateConsumoServicio: (id, data) => apiClient.put(`/api/consumo-servicios/${id}`, data),
    deleteConsumoServicio: (id) => apiClient.delete(`/api/consumo-servicios/${id}`),
    getConsumoServicioById: (id) => apiClient.get(`/api/consumo-servicios/${id}`),
}
export const GeneracionResiduosService = {
    getGeneracionResiduos: (params) => apiClient.get("/api/generacion-residuos", { params }),
    createGeneracionResiduo: (data) => apiClient.post("/api/generacion-residuos", data),
    updateGeneracionResiduo: (id, data) => apiClient.put(`/api/generacion-residuos/${id}`, data),
    deleteGeneracionResiduo: (id) => apiClient.delete(`/api/generacion-residuos/${id}`),
    getGeneracionResiduosById: (id) => apiClient.get(`/api/generacion-residuos/${id}`),
}

export const HseqDashboardService = {
    getEstadisticasConsumo: (params) => apiClient.get("/api/estadisticas-anuales-consumo", { params }),
    getEstadisticasGeneracionResiduos: (params) => apiClient.get("/api/estadisticas-anuales-residuos", { params }),
}