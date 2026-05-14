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


export  const tipoContratoService = {
  getTipoContratos() {
    return apiClient.get("api/nomina/tipo-contratos");
  },
  getTipoContrato(id) {
    return apiClient.get(`api/nomina/tipo-contratos/${id}`);
  },
  createTipoContrato(data) {
    return apiClient.post("api/nomina/tipo-contratos", data);
  },
  updateTipoContrato(id, data) {
    return apiClient.put(`api/nomina/tipo-contratos/${id}`, data);
  },
  deleteTipoContrato(id) {
    return apiClient.delete(`api/nomina/tipo-contratos/${id}`);
  },
};

export const seguridadSocialService = {
  getSeguridadSocial() {
    return apiClient.get("api/nomina/seguridad-social");
  },
  getSeguridadSocialById(id) {
    return apiClient.get(`api/nomina/seguridad-social/${id}`);
  },
  createSeguridadSocial(data) {
    return apiClient.post("api/nomina/seguridad-social", data);
  },
  updateSeguridadSocial(id, data) {
    return apiClient.put(`api/nomina/seguridad-social/${id}`, data);
  },
  deleteSeguridadSocial(id) {
    return apiClient.delete(`api/nomina/seguridad-social/${id}`);
  },
};


export const tipoRegistroService = {
  getTipoRegistros(params = {}) {
    return apiClient.get("api/nomina/tipo-registros", { params });
  },
  getTipoRegistroByUuid(uuid) {
    return apiClient.get(`api/nomina/tipo-registros/${uuid}`);
  },
  createTipoRegistro(data) {
    return apiClient.post("api/nomina/tipo-registros", data);
  },
  updateTipoRegistro(uuid, data) {
    return apiClient.put(`api/nomina/tipo-registros/${uuid}`, data);
  },
  deleteTipoRegistro(uuid) {
    return apiClient.delete(`api/nomina/tipo-registros/${uuid}`);
  },
};

export const valorService = {
  getValores(params = {}) {
    return apiClient.get("api/nomina/valores", { params });
  },
  getValorByUuid(uuid) {
    return apiClient.get(`api/nomina/valores/${uuid}`);
  },
  createValor(data) {
    return apiClient.post("api/nomina/valores", data);
  },
  updateValor(uuid, data) {
    return apiClient.put(`api/nomina/valores/${uuid}`, data);
  },
  deleteValor(uuid) {
    return apiClient.delete(`api/nomina/valores/${uuid}`);
  },
};

export const incapacidadService = {
  getIncapacidades(params = {}) {
    return apiClient.get("api/nomina/incapacidades", { params });
  },
  getIncapacidadByUuid(uuid) {
    return apiClient.get(`api/nomina/incapacidades/${uuid}`);
  },
  createIncapacidad(formData) {
    return apiClient.post("api/nomina/incapacidades", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateIncapacidad(uuid, formData) {
    formData.append("_method", "PUT");
    return apiClient.post(`api/nomina/incapacidades/${uuid}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  revisarIncapacidad(uuid) {
    return apiClient.patch(`api/nomina/incapacidades/${uuid}/revisar`);
  },
  deleteIncapacidad(uuid) {
    return apiClient.delete(`api/nomina/incapacidades/${uuid}`);
  },
};

export const jornadaLaboralService = {
  getJornadas(params = {}) {
    return apiClient.get("api/nomina/jornada-laborals", { params });
  },
  getJornadaByUuid(uuid) {
    return apiClient.get(`api/nomina/jornada-laborals/${uuid}`);
  },
  createJornada(data) {
    return apiClient.post("api/nomina/jornada-laborals", data);
  },
  updateJornada(uuid, data) {
    return apiClient.put(`api/nomina/jornada-laborals/${uuid}`, data);
  },
  deleteJornada(uuid) {
    return apiClient.delete(`api/nomina/jornada-laborals/${uuid}`);
  },
};

export const descuentoService = {
  getDescuentos(params = {}) {
    return apiClient.get("api/nomina/descuentos", { params });
  },
  getDescuentoByUuid(uuid) {
    return apiClient.get(`api/nomina/descuentos/${uuid}`);
  },
  createDescuento(data) {
    return apiClient.post("api/nomina/descuentos", data);
  },
  updateDescuento(uuid, data) {
    return apiClient.put(`api/nomina/descuentos/${uuid}`, data);
  },
  deleteDescuento(uuid) {
    return apiClient.delete(`api/nomina/descuentos/${uuid}`);
  },
};

export const contratacionService = {
  getEmpleados() {
    return apiClient.get("api/nomina/contratacion/empleados");
  },
  getContratos(params = {}) {
    return apiClient.get("api/nomina/contratacion", { params });
  },
  getContratoById(id) {
    return apiClient.get(`api/nomina/contratacion/${id}`);
  },
  createContrato(data) {
    return apiClient.post("api/nomina/contratacion", data);
  },
  updateContrato(id, data) {
    return apiClient.put(`api/nomina/contratacion/${id}`, data);
  },
  deleteContrato(id) {
    return apiClient.delete(`api/nomina/contratacion/${id}`);
  },
};

export const nominaService = {
  getNominas(params = {}) {
    return apiClient.get("api/nomina/nominas", { params });
  },
  getNominaByUuid(uuid) {
    return apiClient.get(`api/nomina/nominas/${uuid}`);
  },
  getSummary(params = {}) {
    return apiClient.get("api/nomina/nominas/resumen", { params });
  },
  liquidar(data) {
    return apiClient.post("api/nomina/nominas/liquidar", data);
  },
  deleteNomina(uuid) {
    return apiClient.delete(`api/nomina/nominas/${uuid}`);
  },
};