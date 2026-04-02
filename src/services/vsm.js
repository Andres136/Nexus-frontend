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
export const vsmService = {
  // Obtener todos los alistamientos
  obtenerAlistamientos: () => apiClient.get("/api/vsm-alistamientos"),

  // Crear un nuevo alistamiento
  crearAlistamiento: (data) =>
    apiClient.post("/api/vsm-alistamientos", {
      ...data,
    }),

  // Pausar un alistamiento
  pausarAlistamiento: (id, razon) =>
    apiClient.post(`/api/vsm-alistamientos/${id}/pausar`, { razon }),

  // Reanudar un alistamiento
  reanudarAlistamiento: (id) =>
    apiClient.post(`/api/vsm-alistamientos/${id}/reanudar`),

  // Finalizar un alistamiento
  finalizarAlistamiento: (id) =>
    apiClient.post(`/api/vsm-alistamientos/${id}/finalizar`),   

    // Obtener historial de un alistamiento
    obtenerHistorial: (id) =>
    apiClient.get(`/api/alistamientos/${id}/historial`), 
    
    
    pausarUsuario: (alistamientoId, usuarioId, data) =>
    apiClient.post(
      `/api/alistamientos/${alistamientoId}/usuarios/${usuarioId}/pausar`, data
    ),

  reanudarUsuario: (alistamientoId, usuarioId) =>
    apiClient.post(
      `/api/alistamientos/${alistamientoId}/usuarios/${usuarioId}/reanudar`
    ),

    usuariosDisponibles: (alistamientoId) =>
    apiClient.get(
      `/api/alistamientos/${alistamientoId}/usuarios-disponibles`
    ),
    agregarUsuario: (alistamientoId, data) =>
    apiClient.post(
      `/api/alistamientos/${alistamientoId}/agregar-usuario`, data
    ),
};

//Traer ordenes de trabajo para alistamiento
export const otAlistamientoService = {
  ordenesParaAlistamiento: () =>
    apiClient.get("/api/ordenes-trabajo-alistamiento"),

  alistamientoActivoPorOT: (params) =>
    apiClient.get('/api/alistamientos-activos', { params }),
}



//DAtos para pronóstico VSM
export const vsmForecastService = {
  pronosticoGlobal: (usuarios = 1) =>
    apiClient.get(`/api/vsm/pronostico?usuarios=${usuarios}`),

  vsmFlow : () =>
    apiClient.get('/api/vsm/flujo'),
  pronostico:()=>
    apiClient.get('/api/vsm/pronostico'),
}

//Alistamientos finalizados
export const alistamientosFinalizadosService = {
  obtenerAlistamientosFinalizados: (params) =>
    apiClient.get('/api/vsm/ots-finalizadas', { params }),
}

export const vsmProduccionService = {
registerProduccion: (data) =>
  apiClient.post('/api/alistamiento/produccion', data),
}
