import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;


const apiClient = axios.create({
  baseURL: VITE_API_URL ,
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
    getAll:()=>apiClient.get('/api/conductores'),
}

//Api para registro de indicadores por procesos o departamentos
export const indicadoresApi={
  getAll:()=>apiClient.get('/api/indicadores'),
  getById:(id)=>apiClient.get(`/api/indicadores/${id}`),
  create:(data)=>apiClient.post('/api/indicadores',data),
  update:(id,data)=>apiClient.put(`/api/indicadores/${id}`,data),
  delete:(id)=>apiClient.delete(`/api/indicadores/${id}`),
getIndicadoresDepartamento: (params) => apiClient.get('/api/indicadoresAdmin', { params }),
}

//Api para registrar los valores de los indicadores
export const valoresIndicadoresApi={
  getAll:(params)=>apiClient.get('/api/registro-indicadores', { params }),
  getById:(id)=>apiClient.get(`/api/registro-indicadores/${id}`),
  create:(data)=>apiClient.post('/api/registro-indicadores',data,{
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:(id,data)=>apiClient.put(`/api/registro-indicadores/${id}`,data),
  delete:(id)=>apiClient.delete(`/api/registro-indicadores/${id}`),

}

//Api para obtener los departamentos
export const departamentosApi={
  getAll:()=>apiClient.get('/api/departamentos'),
  getById:(id)=>apiClient.get(`/api/departamentos/${id}`),
  create:(data)=>apiClient.post('/api/departamentos',data),
  update:(id,data)=>apiClient.put(`/api/departamentos/${id}`,data),
  delete:(id)=>apiClient.delete(`/api/departamentos/${id}`),

}
//Api para traer todos los indicadores por departamento
export const indicadoresDepartamentoApi={
  getAll:(params, page)=>apiClient.get('/api/rendimiento-indicadores', { params: { ...params, page } })
}

//Api para traer los productos de siigo
export const siigoSetasApi={
  getProducts:(params)=>apiClient.get('/api/products-setas', { params }),
}

//Api para traer los productos de siigo global
export const siigoGlobalApi={
  getProducts:(params)=>apiClient.get('/api/products-global', { params }),
}


//Api para traer las sedes
export const sedesApi={
  getAll:()=>apiClient.get('/api/sedes'),
  getById:(id)=>apiClient.get(`/api/sedes/${id}`),
  create:(data)=>apiClient.post('/api/sedes',data),
  update:(id,data)=>apiClient.put(`/api/sedes/${id}`,data),
  delete:(id)=>apiClient.delete(`/api/sedes/${id}`),

}


//Api Empresa
export const empresaApi={
  getAll:()=>apiClient.get('/api/empresas'),
  getById:(id)=>apiClient.get(`/api/empresas/${id}`),
  create:(data)=>apiClient.post('/api/empresas',data,{
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // Actualizar empresa (Opción 2: POST con override _method=PUT)
  updatePost: (id, data) => {
    if (data instanceof FormData) {
      data.append("_method", "PUT"); // override
    }
    return apiClient.post(`/api/empresas/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete:(id)=>apiClient.delete(`/api/empresas/${id}`),

}
export default apiClient;