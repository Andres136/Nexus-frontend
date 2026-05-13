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

export  const formasPagoService = {
  getFormasPago: () => apiClient.get("/api/formas-pago"),
  createFormaPago: (data) => apiClient.post("/api/formas-pago", data),
  getFormaPagoById: (id) => apiClient.get(`/api/formas-pago/${id}`),
  updateFormaPago: (id, data) => apiClient.put(`/api/formas-pago/${id}`, data),
  deleteFormaPago: (id) => apiClient.delete(`/api/formas-pago/${id}`),
};

export const impuestosService = {
  getImpuestos: () => apiClient.get("/api/impuestos"),
  createImpuesto: (data) => apiClient.post("/api/impuestos", data),
  getImpuestoById: (id) => apiClient.get(`/api/impuestos/${id}`),
  updateImpuesto: (id, data) => apiClient.put(`/api/impuestos/${id}`, data),
  deleteImpuesto: (id) => apiClient.delete(`/api/impuestos/${id}`),
};
export const cuentasContablesService = {
  getCuentasContables: () => apiClient.get("/api/cuentas-contables"),
  createCuentaContable: (data) => apiClient.post("/api/cuentas-contables", data),
  getCuentaContableById: (id) => apiClient.get(`/api/cuentas-contables/${id}`),
  updateCuentaContable: (id, data) => apiClient.put(`/api/cuentas-contables/${id}`, data),
  deleteCuentaContable: (id) => apiClient.delete(`/api/cuentas-contables/${id}`),
};
 export const facturasService = {
  getFacturas: (params) => apiClient.get("/api/facturas-compra", { params }),
  createFactura: (data) => apiClient.post("/api/facturas-compra", data),
  getFacturaById: (id) => apiClient.get(`/api/facturas-compra/${id}`),
  updateFactura: (id, data) => apiClient.put(`/api/facturas-compra/${id}`, data),
  deleteFactura: (id) => apiClient.delete(`/api/facturas-compra/${id}`),
 
};

export const costeosService = {
  getCosteos: (params) => apiClient.get("/api/costeos", { params }),
  createCosteo: (data) => apiClient.post("/api/costeos", data),
  getCosteoById: (id) => apiClient.get(`/api/costeos/${id}`),
  updateCosteo: (id, data) => apiClient.put(`/api/costeos/${id}`, data),
  deleteCosteo: (id) => apiClient.delete(`/api/costeos/${id}`),
   exportExcel: (params) => apiClient.get("/api/costeos/export", { params, responseType: "blob" }),
};

export const abonosFacturaCompraService = {
  getAbonos: (params) => apiClient.get("/api/pago-factura-compra", { params }),
  
  createAbono: (facturaId, data) =>
    apiClient.post(`/api/facturas-compras/${facturaId}/pagos`, data),
  getAbonoById: (id) => apiClient.get(`/api/pago-factura-compra/${id}`),
  updateAbono: (id, data) => apiClient.put(`/api/pago-factura-compra/${id}`, data),
  deleteAbono: (id) => apiClient.delete(`/api/pago-factura-compra/${id}`),
 
};
