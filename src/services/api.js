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

//Api gestionar las bodegas
export const bodegasApi={
  getAll:()=>apiClient.get('/api/bodegas'),
  getById:(id)=>apiClient.get(`/api/bodegas/${id}`),
  create:(data)=>apiClient.post('/api/bodegas',data),
  update:(id,data)=>apiClient.put(`/api/bodegas/${id}`,data),
  delete:(id)=>apiClient.delete(`/api/bodegas/${id}`),

}

//Api Empresa
export const empresaApi={
  getAll:()=>apiClient.get('/api/empresas-all'),
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

//Api para traer todos los productos sin paginar
export const productsApi={
 getAll:(params={})=>apiClient.get('/api/products-all', { params }),
getProducts:(params={})=>apiClient.get('/api/products', { params }),
  getById:(id)=>apiClient.get(`/api/products/${id}`),

  create:(data)=>apiClient.post('/api/products',data,{
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:(id,data)=>apiClient.put(`/api/products/${id}`,data,{
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete:(id)=>apiClient.delete(`/api/products/${id}`),
getStock: (id, params = {}) => 
  apiClient.get(`/api/stock-products/${id}`, { params }),

getStockForUserAndOrder: (id, params = {}) => 
  apiClient.get(`/api/stock-products-for-user/${id}`, { params }),

postDescontarStock: (data) => 
  apiClient.post('/api/products/descontar/stock', data),

 
 registrarEntradaMasiva: (data) => apiClient.post('/api/products/importar-excel', data,{
    headers: { 'Content-Type': 'multipart/form-data' }
 }),
getStockWithSuggestions: (id) => 
  apiClient.get(`/api/stock-products-sugerencias/${id}`),


postDescontarStockMasivo: (data) => 
  apiClient.post('/api/products/descontar-stock-masivo', data),


//Sincronizar productos con siigo
sincronizarProductosSiigoGlobal: (data) => 
  apiClient.post('/api/productos/sincronizar-siigo', data),

sincronizarProductosSiigoSetas: (data) => 
  apiClient.post('/api/productos/sincronizar-siigo-setas', data),

}
//Ordenes de compra a proveedores API
export const ordenesCompraProveedoresApi={
//Peticion al pdf al crear la orden de compra
  getPdf:(id)=>apiClient.get(`/api/orden-compras-proveedor/${id}/pdf`,{
 responseType: "arraybuffer", // 👈 en vez de blob

//Registrar entrada de productos manualmente
 
  }),

  //Registar entrada masiva de productos
 
  
  sendEmailWithPdf: (id) => 
  apiClient.post(`/api/ordenes-compra-proveedor/${id}/enviar-email`),
}


//Api para auditor 
export const auditApi={
  getAuditData:(params)=>apiClient.get('/api/audit-ordenes-compra', { params }),
}


//iNVEANTARIOS
export const inventariosApi={
  listar:(params={})=>apiClient.get('/api/inventarios', { params }),
  exportar:(params={})=>apiClient.get('/api/inventarios/exportar', { params , responseType: 'blob' }),
  getById:(id)=>apiClient.get(`/api/inventarios/${id}`),
  create:(data)=>apiClient.post('/api/inventarios',data,{
    headers: { 'Content-Type': 'multipart/form-data' }
  }), 
  createTraslado:(data)=>apiClient.post('/api/traslados-internos',data),
  sedesTraslados:()=>apiClient.get('/api/traslados-internos-sedes'),
  ordenesCompraTraslados:()=>apiClient.get('/api/traslados-internos-ordenes-compra'),

}

//Documentacio SGI
export const documentacionApi={
  getAll:(params={})=>apiClient.get('/api/registrar-documentacion', { params }),
  getById:(id)=>apiClient.get(`/api/registrar-documentacion/${id}`),
  create:(data)=>apiClient.post('/api/registrar-documentacion',data,{
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:(id,data)=>apiClient.put(`/api/registrar-documentacion/${id}`,data,{
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete:(id)=>apiClient.delete(`/api/registrar-documentacion/${id}`),
  moverAObseletos:(id)=>apiClient.post(`/api/documentos/mover-obseletos/${id}`),

}
export const crearQrApi={
  create:(data)=>apiClient.post('/api/eventos/crear-qr',data),
}


//Exportar ordenes con falta de Stock
export const ordenesApi = {
  getFaltantesPendientes: () => apiClient.get("/api/ordenes-compra/faltantes/pendientes"),
};


//Registrar plantillas de correo
export const plantillasApi={
  getAll:()=>apiClient.get('/api/plantillas-correo'),
  getById:(id)=>apiClient.get(`/api/plantillas-correo/${id}`),
  create:(data)=>apiClient.post('/api/plantillas-correo',data,{
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
update: (id, data) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT"); // Laravel lo detecta
  }
  return apiClient.post(`/api/plantillas-correo/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
},

  delete:(id)=>apiClient.delete(`/api/plantillas-correo/${id}`),

  enviarEmail:(id, data)=>apiClient.post(`/api/plantillas/${id}/enviar`,data),

  getForEdit: (id) => apiClient.get(`/api/plantillas/${id}/edit`),
}
export default apiClient;