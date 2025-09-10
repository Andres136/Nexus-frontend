import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    
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

//Obtener todos los usuarios
export const usersApi={
    getAll:()=>apiClient.get('/conductores'),
}

//Api para registro de indicadores por procesos o departamentos
export const indicadoresApi={
  getAll:()=>apiClient.get('/indicadores'),
  getById:(id)=>apiClient.get(`/indicadores/${id}`),
  create:(data)=>apiClient.post('/indicadores',data),
  update:(id,data)=>apiClient.put(`/indicadores/${id}`,data),
  delete:(id)=>apiClient.delete(`/indicadores/${id}`),
}

//Api para registrar los valores de los indicadores
export const valoresIndicadoresApi={
  getAll:(params)=>apiClient.get('/registro-indicadores', { params }),
  getById:(id)=>apiClient.get(`/registro-indicadores/${id}`),
  create:(data)=>apiClient.post('/registro-indicadores',data,{
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:(id,data)=>apiClient.put(`/registro-indicadores/${id}`,data),
  delete:(id)=>apiClient.delete(`/registro-indicadores/${id}`),

}

//Api para obtener los departamentos
export const departamentosApi={
  getAll:()=>apiClient.get('/departamentos'),
  getById:(id)=>apiClient.get(`/departamentos/${id}`),
  create:(data)=>apiClient.post('/departamentos',data),
  update:(id,data)=>apiClient.put(`/departamentos/${id}`,data),
  delete:(id)=>apiClient.delete(`/departamentos/${id}`),

}
//Api para traer todos los indicadores por departamento
export const indicadoresDepartamentoApi={
  getAll:(params)=>apiClient.get('/rendimiento-indicadores', { params })
}

export default apiClient;