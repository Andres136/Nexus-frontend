import axios from "axios";
import clienteAxios from "../config/axios";
import { get } from "lodash";

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

  deleteNovedad: (id) => apiClient.delete(`/api/novedades/${id}`),
  
};

export  const hallazgosNovedadesService = {
  getHallazgos: () => apiClient.get("/api/hallazgos"),
 createHallazgo: (data) => apiClient.post("/api/hallazgos", data),
  getHallazgoById: (id) => apiClient.get(`/api/hallazgos/${id}`),
  updateHallazgo: (id, data) => apiClient.put(`/api/hallazgos/${id}`, data),
  deleteHallazgo: (id) => apiClient.delete(`/api/hallazgos/${id}`),
  getEstadisticasSemestrales: (params) => apiClient.get("/api/indicador-semestral", { params }),
};

export const gestionOperativaService = {
  getvsm: (params) => apiClient.get("/api/vsm/ordenes", { params }),

  updateGestion: (id, data) => apiClient.put(`/api/control-operativo/${id}`, data),

  deleteGestion: (id) => apiClient.delete(`/api/control-operativo/${id}`),

  createHistorialOrdenes(data) {
    return apiClient.post('/api/ordenes-compras-historial', data);
  },

  agregarDetalleOcProveedor: (data) => apiClient.post('/api/detalles-orden', data),
  agregarPrioridadDetalleExistente: (data) =>
    apiClient.post('/api/detalles-orden/prioridad-existente', data),

  getPrioridadesActivas: (params) => apiClient.get('/api/vsm/prioridades', { params }),
  actualizarPrioridadOrigen: (id, cantidad_prioridad) =>
    apiClient.patch(`/api/vsm/origenes/${id}/prioridad`, { cantidad_prioridad }),
  actualizarObservacionItem: (id, observaciones) =>
    apiClient.patch(`/api/vsm/orden-compra-detalles/${id}/observacion`, { observaciones }),
  exportarPdf: (params) =>
    apiClient.get('/api/vsm/ordenes-pdf', { params, responseType: 'blob' }),
};

export const seguimentoHallazgosService = {
  getSeguimientos: () => apiClient.get("/api/seguimiento-hallazgos"),
  createSeguimiento: (data) => apiClient.post("/api/seguimiento-hallazgos", data),
  getSeguimientoById: (id) => apiClient.get(`/api/seguimiento-hallazgos/${id}`),
  updateSeguimiento: (id, data) => apiClient.put(`/api/seguimiento-hallazgos/${id}`, data),
  deleteSeguimiento: (id) => apiClient.delete(`/api/seguimiento-hallazgos/${id}`),
};

export const soporteTareasService = {
  getTareas: () => apiClient.get("/api/soporte-tareas"),
  createTarea: (data) => apiClient.post("/api/soporte-tareas", data,{
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
  getTareaById: (id) => apiClient.get(`/api/soporte-tareas/${id}`),
  updateTarea: (id, data) => apiClient.put(`/api/soporte-tareas/${id}`, data),
  deleteTarea: (id) => apiClient.delete(`/api/soporte-tareas/${id}`),
  getSoportesByTareaId: (tareaId) => apiClient.get(`/api/soporte-tarea/${tareaId}`),
  getSoportesByHallazgoId: (hallazgoId) => apiClient.get(`/api/soporte-tareas/hallazgo/${hallazgoId}`),
};
export const analisisProductoNoConformeService = {
  // Obtener análisis por producto no conforme
  getByProductoNoConformeId: (productoNoConformeId) =>
    apiClient.get(`/api/analisis-producto-no-conforme/producto/${productoNoConformeId}`),

  // Obtener análisis por ID
  getById: (id) =>
    apiClient.get(`/api/analisis-producto-no-conforme/${id}`),

  // Crear análisis
  create: (data) =>
    apiClient.post(`/api/analisis-producto-no-conforme`, data,{
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Actualizar análisis
  update: (id, data) =>
    apiClient.put(`/api/analisis-producto-no-conforme/${id}`, data),

  // Cambiar estado
  cambiarEstado: (id, estado_id) =>
    apiClient.patch(`/api/analisis-producto-no-conforme/${id}/estado`, {
      estado_id,
    }),
};
export const productoNoConformeService = {
  createProductoNoConforme: (data) => apiClient.post("/api/productos-no-conformes", data),
  updateProductoNoConforme: (id, data) => apiClient.put(`/api/productos-no-conformes/${id}`, data),
  deleteProductoNoConforme: (id) => apiClient.delete(`/api/productos-no-conformes/${id}`),
  estadisticasProductoNoConforme: (params) => apiClient.get("/api/productos-no-conformes/estadisticas", { params }),
  getAll: (params) => apiClient.get("/api/productos-no-conformes", { params }),
  getById: (id) => apiClient.get(`/api/productos-no-conformes/${id}`),
  cambiarEstado: (id, estado_id) => apiClient.patch(`/api/productos-no-conformes/${id}/estado`, {
    estado_id,
  }),
};

export const tareaService = {
  getTareas: (params) => apiClient.get("/api/tareas", { params }),
  avanzarEstado: (id, data) => apiClient.patch(`/api/tareas/estado/${id}`, data),
  actualizarTarea: (id, data) => apiClient.put(`/api/tareas/update/${id}`, data),
  getHistorial: (id) => apiClient.get(`/api/tareas/${id}/historial`),
  agregarNota: (id, nota) => apiClient.post(`/api/tareas/${id}/notas`, { nota }),
};
