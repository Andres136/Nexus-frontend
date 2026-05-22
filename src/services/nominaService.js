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

export const kioskoDeviceService = {
  getKioscos(params = {}) {
    return apiClient.get("api/nomina/kiosko-devices", { params });
  },
  getKioscoByUuid(uuid) {
    return apiClient.get(`api/nomina/kiosko-devices/${uuid}`);
  },
  createKiosco(data) {
    return apiClient.post("api/nomina/kiosko-devices", data);
  },
  updateKiosco(uuid, data) {
    return apiClient.put(`api/nomina/kiosko-devices/${uuid}`, data);
  },
  deleteKiosco(uuid) {
    return apiClient.delete(`api/nomina/kiosko-devices/${uuid}`);
  },
};

export const workSessionService = {
  getWorkSessions(params = {}) {
    return apiClient.get("api/nomina/work-sessions", { params });
  },
  createSession(data) {
    return apiClient.post("api/nomina/work-sessions", data);
  },
  updateSession(uuid, data) {
    return apiClient.put(`api/nomina/work-sessions/${uuid}`, data);
  },
  getSessionHoy(userId) {
    const today = new Date().toISOString().split("T")[0];
    return apiClient.get("api/nomina/work-sessions", {
      params: { user_id: userId, fecha: today, per_page: 1 },
    });
  },
};

export const permisoService = {
  getPermisos(params = {}) {
    return apiClient.get("api/nomina/permisos", { params });
  },
  aprobar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/permisos/${uuid}/aprobar`, data);
  },
  rechazar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/permisos/${uuid}/rechazar`, data);
  },
};

export const vacacionService = {
  getVacaciones(params = {}) {
    return apiClient.get("api/nomina/vacaciones", { params });
  },
  aprobar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/vacaciones/${uuid}/aprobar`, data);
  },
  rechazar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/vacaciones/${uuid}/rechazar`, data);
  },
};

export const horaExtraService = {
  getHorasExtras(params = {}) {
    return apiClient.get("api/nomina/horas-extras", { params });
  },
  aprobar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/horas-extras/${uuid}/aprobar`, data);
  },
  rechazar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/horas-extras/${uuid}/rechazar`, data);
  },
};

export const fotoFacialService = {
  getFotos(params = {}) {
    return apiClient.get("api/nomina/users-face-photos", { params });
  },
  getFotoByUuid(uuid) {
    return apiClient.get(`api/nomina/users-face-photos/${uuid}`);
  },
  createFoto(formData) {
    return apiClient.post("api/nomina/users-face-photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateFoto(uuid, formData) {
    formData.append("_method", "PUT");
    return apiClient.post(`api/nomina/users-face-photos/${uuid}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteFoto(uuid) {
    return apiClient.delete(`api/nomina/users-face-photos/${uuid}`);
  },
};

export const llamadoAtencionService = {
  getLlamados(params = {}) {
    return apiClient.get("api/nomina/llamados-atencion", { params });
  },
  createLlamado(data) {
    return apiClient.post("api/nomina/llamados-atencion", data);
  },
  deleteLlamado(uuid) {
    return apiClient.delete(`api/nomina/llamados-atencion/${uuid}`);
  },
  pdfLlamado(uuid, descripcion) {
    return apiClient.get(`api/nomina/llamados-atencion/${uuid}/pdf`, {
      params: { descripcion },
      responseType: "blob",
    });
  },
};

export const descargoService = {
  getDescargos(params = {}) {
    return apiClient.get("api/nomina/descargos", { params });
  },
  createDescargo(data) {
    return apiClient.post("api/nomina/descargos", data);
  },
  deleteDescargo(uuid) {
    return apiClient.delete(`api/nomina/descargos/${uuid}`);
  },
  pdfDescargo(uuid) {
    return apiClient.get(`api/nomina/descargos/${uuid}/pdf`, {
      responseType: "blob",
    });
  },
};

export const portalEmpleadoService = {
  desprendiblePdf(nominaUuid) {
    return apiClient.get(`api/nomina/nominas/${nominaUuid}/desprendible`, {
      responseType: "blob",
    });
  },
  enviarDesprendible(nominaUuid, correo = "") {
    return apiClient.post(`api/nomina/nominas/${nominaUuid}/desprendible/enviar`, { correo });
  },
  certificadoLaboralPdf(contratacionUuid, dirigidoA = "") {
    return apiClient.get(`api/nomina/contratacion/${contratacionUuid}/certificado`, {
      params: { dirigido_a: dirigidoA },
      responseType: "blob",
    });
  },
  enviarCertificadoLaboral(contratacionUuid, dirigidoA = "", correo = "") {
    return apiClient.post(`api/nomina/contratacion/${contratacionUuid}/certificado/enviar`, {
      dirigido_a: dirigidoA,
      correo,
    });
  },
};
