import { useEffect, useMemo, useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { nominaService } from "../../services/nominaService";
import { useGetJornadaLaboral } from "./useGetJornadaLaboral";
import { useEmpresas } from "../useEmpresas";

const EMPTY_FORM = {
  periodo_inicio: "",
  periodo_fin: "",
  jornada_laboral_id: "",
  empresa_id: "",
  descontar_tardanzas: false,
};

const POR_PAGINA = 20;

function normalizar(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const useLiquidarTodoNomina = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [searchEmpleados, setSearchEmpleados] = useState("");
  const [page, setPage] = useState(1);
  const [excluidosTardanza, setExcluidosTardanza] = useState([]);
  const [excluidosPermiso, setExcluidosPermiso] = useState([]);
  const [decisionesPermisos, setDecisionesPermisos] = useState({});
  const [responsableId, setResponsableId] = useState("");
  const [responsables, setResponsables] = useState([]);
  const [loadingResponsables, setLoadingResponsables] = useState(false);
  const [enviandoAprobacion, setEnviandoAprobacion] = useState(false);

  const { jornadas, isLoading: loadingJornadas } = useGetJornadaLaboral();
  const { empresas, loading: loadingEmpresas } = useEmpresas();

  useEffect(() => {
    setLoadingResponsables(true);
    nominaService.getResponsablesLote()
      .then((response) => setResponsables(response.data?.data ?? []))
      .catch(() => setResponsables([]))
      .finally(() => setLoadingResponsables(false));
  }, []);

  const buildPayload = (
    excluirTardanzaIds = excluidosTardanza,
    excluirPermisoIds = excluidosPermiso,
    decisiones = decisionesPermisos
  ) => {
    const payload = { ...formData };
    if (!payload.empresa_id) delete payload.empresa_id;
    // Laravel valida "boolean" en query strings (GET) aceptando solo 0/1, no los textos
    // "true"/"false" que produce la URL — se envía como número para que funcione en ambos casos.
    payload.descontar_tardanzas = payload.descontar_tardanzas ? 1 : 0;
    if (payload.descontar_tardanzas && excluirTardanzaIds.length > 0) {
      payload.excluir_tardanza_ids = excluirTardanzaIds;
    }
    if (excluirPermisoIds.length > 0) {
      payload.excluir_permiso_ids = excluirPermisoIds;
    }
    const decisionesArray = Object.entries(decisiones).map(([userId, permisoIds]) => ({
      user_id: Number(userId),
      permisos_descontar_ids: permisoIds,
    }));
    if (decisionesArray.length > 0) payload.decisiones_permisos = decisionesArray;
    return payload;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setResultado(null);
    setExcluidosTardanza([]);
    setExcluidosPermiso([]);
    setDecisionesPermisos({});
  };

  const handleSearchEmpleados = (e) => {
    setSearchEmpleados(e.target.value);
    setPage(1);
  };

  const empleadosFiltrados = useMemo(() => {
    const empleados = resultado?.empleados ?? [];
    const termino = normalizar(searchEmpleados.trim());
    if (!termino) return empleados;
    return empleados.filter((calculo) => normalizar(calculo.empleado?.name).includes(termino));
  }, [resultado, searchEmpleados]);

  const totalPaginas = Math.max(1, Math.ceil(empleadosFiltrados.length / POR_PAGINA));
  const empleadosPaginados = useMemo(
    () => empleadosFiltrados.slice((page - 1) * POR_PAGINA, page * POR_PAGINA),
    [empleadosFiltrados, page]
  );

  const ejecutarCalculo = async (
    excluirTardanzaIds,
    excluirPermisoIds,
    { silent = false, decisiones = decisionesPermisos, inicializarDecisiones = false } = {}
  ) => {
    setPreviewLoading(true);
    setFieldErrors({});
    try {
      const response = await nominaService.preliquidarLote(
        buildPayload(excluirTardanzaIds, excluirPermisoIds, decisiones)
      );
      setResultado(response.data.data);
      if (inicializarDecisiones) {
        setDecisionesPermisos(Object.fromEntries(
          response.data.data.empleados.map((calculo) => [
            calculo.user_id,
            calculo.permisos_descontar_ids ?? [],
          ])
        ));
      }
      if (!silent) {
        const { empleados_calculados, empleados_con_error } = response.data.data.totales;
        showToast(
          "success",
          `Se calcularon ${empleados_calculados} empleados` +
            (empleados_con_error > 0 ? ` (${empleados_con_error} con error).` : ".")
        );
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      setResultado(null);
      showToast("error", data?.message || "Ocurrió un error al preliquidar el lote.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreview = async () => {
    setSearchEmpleados("");
    setPage(1);
    setExcluidosTardanza([]);
    setExcluidosPermiso([]);
    setDecisionesPermisos({});
    await ejecutarCalculo([], [], { inicializarDecisiones: true, decisiones: {} });
  };

  const toggleExcluirTardanza = async (userId) => {
    const yaExcluido = excluidosTardanza.includes(userId);
    const nuevosExcluidos = yaExcluido
      ? excluidosTardanza.filter((id) => id !== userId)
      : [...excluidosTardanza, userId];

    setExcluidosTardanza(nuevosExcluidos);
    await ejecutarCalculo(nuevosExcluidos, excluidosPermiso, { silent: true });
  };

  const toggleExcluirPermiso = async (userId) => {
    const yaExcluido = excluidosPermiso.includes(userId);
    const nuevosExcluidos = yaExcluido
      ? excluidosPermiso.filter((id) => id !== userId)
      : [...excluidosPermiso, userId];

    setExcluidosPermiso(nuevosExcluidos);
    await ejecutarCalculo(excluidosTardanza, nuevosExcluidos, { silent: true });
  };

  const togglePermisoIndividual = async (userId, permisoId) => {
    const actuales = decisionesPermisos[userId] ?? [];
    const nuevos = actuales.includes(permisoId)
      ? actuales.filter((id) => id !== permisoId)
      : [...actuales, permisoId];
    const nuevasDecisiones = { ...decisionesPermisos, [userId]: nuevos };
    setDecisionesPermisos(nuevasDecisiones);
    await ejecutarCalculo(excluidosTardanza, excluidosPermiso, {
      silent: true,
      decisiones: nuevasDecisiones,
    });
  };

  const handleDescargarExcel = async () => {
    if (!formData.periodo_inicio || !formData.periodo_fin || !formData.jornada_laboral_id) {
      showToast("error", "Completa período y jornada antes de descargar.");
      return;
    }

    setExportLoading(true);
    try {
      const response = await nominaService.exportarPreliquidacionLote(buildPayload());
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `preliquidacion_masiva_${formData.periodo_inicio}_${formData.periodo_fin}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("success", "Excel descargado.");
    } catch (error) {
      let message = "No se pudo descargar el Excel.";
      if (error.response?.data instanceof Blob) {
        try {
          const data = JSON.parse(await error.response.data.text());
          message = data.message || message;
        } catch {
          // La respuesta no contiene un error JSON legible.
        }
      }
      showToast("error", message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleEnviarAprobacion = async () => {
    if (!formData.periodo_inicio || !formData.periodo_fin || !formData.jornada_laboral_id) {
      showToast("error", "Completa período y jornada antes de enviar a aprobación.");
      return false;
    }
    if (!responsableId) {
      showToast("error", "Selecciona el responsable que va a aprobar el lote.");
      return false;
    }

    setEnviandoAprobacion(true);
    try {
      const response = await nominaService.crearLoteAprobacion({
        ...buildPayload(),
        responsable_id: responsableId,
      });
      showToast("success", response.data.message || "Lote enviado a aprobación.");
      return true;
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "No se pudo enviar el lote a aprobación.");
      return false;
    } finally {
      setEnviandoAprobacion(false);
    }
  };

  const reset = () => {
    setFormData(EMPTY_FORM);
    setFieldErrors({});
    setResultado(null);
  };

  return {
    formData,
    handleChange,
    fieldErrors,
    previewLoading,
    exportLoading,
    resultado,
    handlePreview,
    handleDescargarExcel,
    reset,
    jornadas: jornadas?.data?.data ?? [],
    loadingJornadas,
    empresas: Array.isArray(empresas) ? empresas : [],
    loadingEmpresas,
    searchEmpleados,
    handleSearchEmpleados,
    empleadosFiltrados,
    empleadosPaginados,
    page,
    setPage,
    totalPaginas,
    excluidosTardanza,
    toggleExcluirTardanza,
    excluidosPermiso,
    toggleExcluirPermiso,
    decisionesPermisos,
    togglePermisoIndividual,
    responsableId,
    setResponsableId,
    responsables,
    loadingResponsables,
    enviandoAprobacion,
    handleEnviarAprobacion,
  };
};
