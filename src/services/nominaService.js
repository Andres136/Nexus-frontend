import axios from "axios";
import clienteAxios from "../config/axios";
import { getKioskoFingerprint, getKioskoSession, getKioskoGuestSession } from "../helpers/nomina/kioskoSession";


const apiClient = axios.create({
  baseURL: clienteAxios.defaults.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

function fechaLocal(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function kioskRequestConfig() {
  const match = window.location.pathname.match(/^\/kiosko\/([^/]+)/);
  const uuid = match?.[1];

  if (!uuid || uuid === "activar" || uuid === "acceso-temporal") return null;

  const guestToken   = getKioskoGuestSession(uuid);
  if (guestToken) {
    return { headers: { "X-Kiosko-Device": uuid, "X-Kiosko-Guest-Token": guestToken } };
  }

  const sessionToken = getKioskoSession(uuid);
  if (!sessionToken) return null;

  return {
    headers: {
      "X-Kiosko-Device": uuid,
      "X-Kiosko-Session": sessionToken,
      "X-Kiosko-Fingerprint": await getKioskoFingerprint(),
    },
  };
}

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

export const configuracionNominaService = {
  getConfiguracion() {
    return apiClient.get("api/nomina/configuracion");
  },
  updateConfiguracion(data) {
    return apiClient.put("api/nomina/configuracion", data);
  },
  subirFirma(file) {
    const form = new FormData();
    form.append("firma", file);
    return apiClient.post("api/nomina/configuracion/firma", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const horarioOperacionService = {
  getHoy(params = {}) {
    return apiClient.get("api/nomina/horario-operacion/hoy", { params });
  },
  async getKioskoHoy() {
    const config = await kioskRequestConfig();
    return apiClient.get("api/nomina/kiosko-horario-operacion/hoy", config ?? undefined);
  },
  guardarHoy(data) {
    return apiClient.put("api/nomina/horario-operacion/hoy", data);
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
  revisarIncapacidad(uuid, data = {}) {
    return apiClient.patch(`api/nomina/incapacidades/${uuid}/revisar`, data);
  },
  soporteIncapacidad(uuid) {
    return apiClient.get(`api/nomina/incapacidades/${uuid}/soporte`, {
      responseType: "arraybuffer",
    });
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
  getEmpleados(params = {}) {
    return apiClient.get("api/nomina/contratacion/empleados", { params });
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
  cambiarEstadoContrato(uuid, status) {
    return apiClient.patch(`api/nomina/contratacion/${uuid}/estado`, { status });
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
  preliquidar(data) {
    return apiClient.post("api/nomina/nominas/preliquidar", data);
  },
  liquidar(data) {
    return apiClient.post("api/nomina/nominas/liquidar", data);
  },
  exportarPlano(params = {}) {
    return apiClient.get("api/nomina/nominas/exportar-plano", {
      params,
      responseType: "blob",
    });
  },
  preliquidarRetiro(data) {
    return apiClient.post("api/nomina/nominas/preliquidar-retiro", data);
  },
  liquidarRetiro(data) {
    return apiClient.post("api/nomina/nominas/liquidar-retiro", data);
  },
  getLiquidacionesRetiro(params = {}) {
    return apiClient.get("api/nomina/liquidaciones-retiro", { params });
  },
  liquidacionRetiroPdf(uuid) {
    return apiClient.get(`api/nomina/liquidaciones-retiro/${uuid}/pdf`, {
      responseType: "blob",
    });
  },
  aprobarContabilidad(uuid) {
    return apiClient.patch(`api/nomina/nominas/${uuid}/aprobar-contabilidad`);
  },
  cerrarPeriodo(data) {
    return apiClient.post("api/nomina/nominas/cerrar-periodo", data);
  },
  exportarPuc(params = {}) {
    return apiClient.get("api/nomina/nominas/exportar-puc", { params });
  },
  exportarPucPdf(params = {}) {
    return apiClient.get("api/nomina/nominas/exportar-puc/pdf", {
      params,
      responseType: "blob",
    });
  },
  deleteNomina(uuid) {
    return apiClient.delete(`api/nomina/nominas/${uuid}`);
  },
};

export const prestacionService = {
  getAll(params = {}) {
    return apiClient.get("api/nomina/liquidaciones-prestaciones", { params });
  },
  getTipos() {
    return apiClient.get("api/nomina/liquidaciones-prestaciones/tipos");
  },
  preliquidar(data) {
    return apiClient.post("api/nomina/nominas/preliquidar-prestacion", data);
  },
  liquidar(data) {
    return apiClient.post("api/nomina/nominas/liquidar-prestacion", data);
  },
};

export const novedadRetroactivaService = {
  getAll(params = {}) {
    return apiClient.get("api/nomina/novedades-retroactivas", { params });
  },
  create(data) {
    return apiClient.post("api/nomina/novedades-retroactivas", data);
  },
  aprobar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/novedades-retroactivas/${uuid}/aprobar`, data);
  },
  rechazar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/novedades-retroactivas/${uuid}/rechazar`, data);
  },
  delete(uuid) {
    return apiClient.delete(`api/nomina/novedades-retroactivas/${uuid}`);
  },
};

export const comisionService = {
  getAll(params = {}) {
    return apiClient.get("api/nomina/comisiones", { params });
  },
  create(data) {
    return apiClient.post("api/nomina/comisiones", data);
  },
  aprobar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/comisiones/${uuid}/aprobar`, data);
  },
  rechazar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/comisiones/${uuid}/rechazar`, data);
  },
  delete(uuid) {
    return apiClient.delete(`api/nomina/comisiones/${uuid}`);
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
  generateActivationLink(uuid) {
    return apiClient.post(`api/nomina/kiosko-devices/${uuid}/activation-link`);
  },
  generateGuestLink(uuid) {
    return apiClient.post(`api/nomina/kiosko-devices/${uuid}/guest-link`);
  },
  bootstrapGuest(data) {
    return apiClient.post("api/nomina/kiosko-devices/bootstrap-guest", data);
  },
  revokeKiosco(uuid) {
    return apiClient.patch(`api/nomina/kiosko-devices/${uuid}/revoke`);
  },
  deactivateKiosco(uuid) {
    return apiClient.patch(`api/nomina/kiosko-devices/${uuid}/deactivate`);
  },
  activateKioscoAdmin(uuid) {
    return apiClient.patch(`api/nomina/kiosko-devices/${uuid}/activate-admin`);
  },
  activateDevice(data) {
    return apiClient.post("api/nomina/kiosko-devices/activate", data);
  },
  validateDeviceSession(data) {
    return apiClient.post("api/nomina/kiosko-devices/validate-session", data);
  },
  bootstrapDevice(data) {
    return apiClient.post("api/nomina/kiosko-devices/bootstrap", data);
  },
};

export const workSessionService = {
  getWorkSessions(params = {}) {
    return apiClient.get("api/nomina/work-sessions", { params });
  },
  async createSession(data) {
    const kioskConfig = await kioskRequestConfig();
    if (kioskConfig) {
      return apiClient.post("api/nomina/kiosko-work-sessions", data, kioskConfig);
    }

    return apiClient.post("api/nomina/work-sessions", data);
  },
  async updateSession(uuid, data) {
    const kioskConfig = await kioskRequestConfig();
    if (kioskConfig) {
      return apiClient.put(`api/nomina/kiosko-work-sessions/${uuid}`, data, kioskConfig);
    }

    return apiClient.put(`api/nomina/work-sessions/${uuid}`, data);
  },
  async getSessionHoy(userId) {
    const today = fechaLocal();
    const kioskConfig = await kioskRequestConfig();
    if (kioskConfig) {
      return apiClient.get("api/nomina/kiosko-work-sessions", {
        ...kioskConfig,
        params: { user_id: userId, fecha: today, per_page: 1 },
      });
    }

    return apiClient.get("api/nomina/work-sessions", {
      params: { user_id: userId, fecha: today, per_page: 1 },
    });
  },
};

export const permisoService = {
  getPermisos(params = {}) {
    return apiClient.get("api/nomina/permisos", { params });
  },
  createPermiso(data) {
    return apiClient.post("api/nomina/permisos", data);
  },
  aprobar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/permisos/${uuid}/aprobar`, data);
  },
  rechazar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/permisos/${uuid}/rechazar`, data);
  },
  async getPermisosAprobadosHoy(userId) {
    const kioskConfig = await kioskRequestConfig();
    const params = { user_id: userId };
    if (kioskConfig) {
      return apiClient.get("api/nomina/kiosko-permisos", { ...kioskConfig, params });
    }
    return apiClient.get("api/nomina/permisos", {
      params: { ...params, status: "aprobado", fecha_desde: fechaLocal(), fecha_hasta: fechaLocal() },
    });
  },
};

export const vacacionService = {
  getVacaciones(params = {}) {
    return apiClient.get("api/nomina/vacaciones", { params });
  },
  createVacacion(data) {
    return apiClient.post("api/nomina/vacaciones", data);
  },
  resumen(userId, params = {}) {
    return apiClient.get(`api/nomina/vacaciones/resumen/${userId}`, { params });
  },
  aprobar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/vacaciones/${uuid}/aprobar`, data);
  },
  rechazar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/vacaciones/${uuid}/rechazar`, data);
  },
};

export const licenciaService = {
  getLicencias(params = {}) {
    return apiClient.get("api/nomina/licencias", { params });
  },
  getLicenciaByUuid(uuid) {
    return apiClient.get(`api/nomina/licencias/${uuid}`);
  },
  createLicencia(formData) {
    return apiClient.post("api/nomina/licencias", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  aprobar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/licencias/${uuid}/aprobar`, data);
  },
  rechazar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/licencias/${uuid}/rechazar`, data);
  },
  deleteLicencia(uuid) {
    return apiClient.delete(`api/nomina/licencias/${uuid}`);
  },
};

export const horaExtraService = {
  getHorasExtras(params = {}) {
    return apiClient.get("api/nomina/horas-extras", { params });
  },
  createHoraExtra(data) {
    return apiClient.post("api/nomina/horas-extras", data);
  },
  aprobar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/horas-extras/${uuid}/aprobar`, data);
  },
  rechazar(uuid, data = {}) {
    return apiClient.patch(`api/nomina/horas-extras/${uuid}/rechazar`, data);
  },
  async getHorasExtrasAprobadasHoy(userId) {
    const kioskConfig = await kioskRequestConfig();
    const params = { user_id: userId };
    if (kioskConfig) {
      return apiClient.get("api/nomina/kiosko-horas-extras", { ...kioskConfig, params });
    }
    return apiClient.get("api/nomina/horas-extras", {
      params: { ...params, status: "aprobada", fecha_desde: fechaLocal(), fecha_hasta: fechaLocal() },
    });
  },
};

export const fotoFacialService = {
  getFotos(params = {}) {
    return apiClient.get("api/nomina/users-face-photos", { params });
  },
  getEmpleadosConContrato(params = {}) {
    return apiClient.get("api/nomina/users-face-photos/empleados-con-contrato", { params });
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
  // Desprendibles — usa el endpoint original por uuid (el PDF lo genera el admin/nomina)
  desprendiblePdf(nominaUuid) {
    return apiClient.get(`api/nomina/nominas/${nominaUuid}/desprendible`, {
      responseType: "blob",
    });
  },
  enviarDesprendible(nominaUuid, correo = "") {
    return apiClient.post(`api/nomina/nominas/${nominaUuid}/desprendible/enviar`, { correo });
  },

  // Nóminas del portal — siempre del usuario autenticado
  getNominas(params = {}) {
    return apiClient.get("api/nomina/portal/nominas", { params });
  },

  // Certificado — siempre del usuario autenticado
  certificadoLaboralPdf(dirigidoA = "") {
    return apiClient.get("api/nomina/portal/certificado", {
      params: { dirigido_a: dirigidoA },
      responseType: "blob",
    });
  },
  enviarCertificadoLaboral(dirigidoA = "", correo = "") {
    return apiClient.post("api/nomina/portal/certificado/enviar", { dirigido_a: dirigidoA, correo });
  },

  // Vacaciones y permisos — siempre del usuario autenticado
  getVacaciones(params = {}) {
    return apiClient.get("api/nomina/portal/vacaciones", { params });
  },
  getPermisos(params = {}) {
    return apiClient.get("api/nomina/portal/permisos", { params });
  },
  getIncapacidades(params = {}) {
    return apiClient.get("api/nomina/portal/incapacidades", { params });
  },
  getLicencias(params = {}) {
    return apiClient.get("api/nomina/portal/licencias", { params });
  },
};
