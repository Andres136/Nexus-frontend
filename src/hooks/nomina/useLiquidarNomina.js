import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { nominaService } from "../../services/nominaService";
import { useGetEmpleados } from "./useGetEmpleados";
import { useGetJornadaLaboral } from "./useGetJornadaLaboral";

const EMPTY_FORM = {
  user_id: "",
  jornada_laboral_id: "",
  periodo_inicio: "",
  periodo_fin: "",
  descuento_id: "",
  descontar_tardanzas: false,
  descontar_permisos: true,
  tipo_liquidacion: "nomina",
  fecha_retiro: "",
  motivo_retiro: "renuncia",
  indemnizacion: "",
  deducciones: "",
};

export const useLiquidarNomina = ({ onSuccess, initialData = {} } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ ...EMPTY_FORM, ...initialData });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [permisosPeriodo, setPermisosPeriodo] = useState([]);
  const [permisosLoading, setPermisosLoading] = useState(false);
  const [permisosDescontarIds, setPermisosDescontarIds] = useState([]);
  const [observacionRevision, setObservacionRevision] = useState("");
  const [ajusteForm, setAjusteForm] = useState({
    tipo: "devengo",
    concepto: "",
    valor: "",
    afecta_base_aportes: false,
    motivo: "",
  });

  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados();
  const { jornadas, isLoading: loadingJornadas } = useGetJornadaLaboral();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setPreview(null);
  };

  const handleSelectEmpleado = (option) => {
    setFormData((prev) => ({ ...prev, user_id: option ? option.value : "" }));
    setPreview(null);
  };

  // Si "Liquidar todo" ya calculó a este empleado en este mismo período, recuerda si se le
  // descontaron tardanzas/permisos y precarga esas mismas casillas aquí.
  useEffect(() => {
    if (formData.tipo_liquidacion === "retiro") return undefined;
    if (!formData.user_id || !formData.periodo_inicio || !formData.periodo_fin) return undefined;

    let cancelado = false;
    nominaService.getExcepcionDescuento({
      user_id: formData.user_id,
      periodo_inicio: formData.periodo_inicio,
      periodo_fin: formData.periodo_fin,
    }).then((response) => {
      if (cancelado) return;
      const excepcion = response.data?.data;
      if (excepcion) {
        setFormData((prev) => ({
          ...prev,
          descontar_tardanzas: excepcion.descontar_tardanzas,
          descontar_permisos: excepcion.descontar_permisos,
        }));
      }
    }).catch(() => {});

    return () => { cancelado = true; };
  }, [formData.user_id, formData.periodo_inicio, formData.periodo_fin, formData.tipo_liquidacion]);

  useEffect(() => {
    if (
      formData.tipo_liquidacion === "retiro"
      || !formData.user_id
      || !formData.periodo_inicio
      || !formData.periodo_fin
    ) {
      setPermisosPeriodo([]);
      setPermisosDescontarIds([]);
      return undefined;
    }

    let cancelado = false;
    setPermisosLoading(true);
    nominaService.getPermisosLiquidacion({
      user_id: formData.user_id,
      periodo_inicio: formData.periodo_inicio,
      periodo_fin: formData.periodo_fin,
    }).then((response) => {
      if (cancelado) return;
      const permisos = response.data?.data ?? [];
      setPermisosPeriodo(permisos);
      setPermisosDescontarIds(
        permisos.filter((permiso) => !permiso.es_remunerado).map((permiso) => permiso.id)
      );
    }).catch(() => {
      if (!cancelado) {
        setPermisosPeriodo([]);
        setPermisosDescontarIds([]);
      }
    }).finally(() => {
      if (!cancelado) setPermisosLoading(false);
    });

    return () => { cancelado = true; };
  }, [formData.user_id, formData.periodo_inicio, formData.periodo_fin, formData.tipo_liquidacion]);

  const togglePermisoDescuento = (permisoId) => {
    setPermisosDescontarIds((prev) => (
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    ));
    setPreview(null);
  };

  const seleccionarTodosPermisos = (seleccionar) => {
    setPermisosDescontarIds(seleccionar ? permisosPeriodo.map((permiso) => permiso.id) : []);
    setPreview(null);
  };

  const handleAjusteChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAjusteForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = () => {
    const payload = { ...formData };
    delete payload.tipo_liquidacion;
    if (!payload.descuento_id) delete payload.descuento_id;
    if (!payload.fecha_retiro) delete payload.fecha_retiro;
    if (!payload.indemnizacion) delete payload.indemnizacion;
    if (!payload.deducciones) delete payload.deducciones;
    if (formData.tipo_liquidacion !== "retiro") {
      payload.permisos_descontar_ids = permisosDescontarIds;
      payload.descontar_permisos = permisosDescontarIds.length > 0;
      delete payload.motivo_retiro;
      delete payload.indemnizacion;
      delete payload.deducciones;
      delete payload.fecha_retiro;
    } else {
      delete payload.periodo_inicio;
      delete payload.periodo_fin;
      delete payload.descuento_id;
    }
    return payload;
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setFieldErrors({});
    try {
      const response = formData.tipo_liquidacion === "retiro"
        ? await nominaService.preliquidarRetiro(buildPayload())
        : await nominaService.preliquidar(buildPayload());
      setPreview(response.data.data);
      showToast("success", response.data.message || "Preliquidación calculada");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      setPreview(null);
      showToast("error", data?.message || "Ocurrió un error al preliquidar");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      if (formData.tipo_liquidacion !== "retiro" && preview?.estado_preliquidacion !== "aprobada") {
        showToast("warning", "Debes aprobar la preliquidación antes de liquidar.");
        return;
      }

      const response = formData.tipo_liquidacion === "retiro"
        ? await nominaService.liquidarRetiro(buildPayload())
        : await nominaService.liquidarPreliquidacion(preview.preliquidacion_uuid);

      const advs = response.data.advertencias ?? [];
      if (advs.length > 0) {
        advs.forEach((adv) => showToast("warning", adv));
      } else {
        showToast("success", response.data.message || "Liquidación registrada exitosamente");
      }

      queryClient.invalidateQueries(["nominas"]);
      queryClient.invalidateQueries(["nominaSummary"]);
      queryClient.invalidateQueries(["contrataciones"]);
      setFormData({ ...EMPTY_FORM, ...initialData });
      setPreview(null);
      onSuccess?.(response.data);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "Ocurrió un error al liquidar");
    } finally {
      setLoading(false);
    }
  };

  const actualizarPreview = (response) => {
    setPreview(response.data.data);
    return response.data.data;
  };

  const agregarAjuste = async () => {
    if (!preview?.preliquidacion_uuid) {
      showToast("warning", "Primero genera la preliquidación.");
      return;
    }

    setAuditLoading(true);
    try {
      const response = await nominaService.agregarAjustePreliquidacion(
        preview.preliquidacion_uuid,
        {
          ...ajusteForm,
          valor: Number(ajusteForm.valor),
        }
      );
      actualizarPreview(response);
      setAjusteForm({
        tipo: "devengo",
        concepto: "",
        valor: "",
        afecta_base_aportes: false,
        motivo: "",
      });
      showToast("success", response.data.message);
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo agregar el ajuste.");
    } finally {
      setAuditLoading(false);
    }
  };

  const eliminarAjuste = async (ajusteUuid) => {
    setAuditLoading(true);
    try {
      const response = await nominaService.eliminarAjustePreliquidacion(
        preview.preliquidacion_uuid,
        ajusteUuid
      );
      actualizarPreview(response);
      showToast("success", response.data.message);
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo eliminar el ajuste.");
    } finally {
      setAuditLoading(false);
    }
  };

  const enviarRevision = async () => {
    setAuditLoading(true);
    try {
      const response = await nominaService.enviarRevisionPreliquidacion(
        preview.preliquidacion_uuid,
        { observacion: observacionRevision || undefined }
      );
      actualizarPreview(response);
      showToast("success", response.data.message);
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo enviar a revisión.");
    } finally {
      setAuditLoading(false);
    }
  };

  const aprobarPreliquidacion = async () => {
    setAuditLoading(true);
    try {
      const response = await nominaService.aprobarPreliquidacion(
        preview.preliquidacion_uuid,
        { observacion: observacionRevision || undefined }
      );
      actualizarPreview(response);
      showToast("success", response.data.message);
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo aprobar.");
    } finally {
      setAuditLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSelectEmpleado,
    handlePreview,
    handleSubmit,
    fieldErrors,
    loading,
    preview,
    previewLoading,
    auditLoading,
    ajusteForm,
    observacionRevision,
    setObservacionRevision,
    handleAjusteChange,
    agregarAjuste,
    eliminarAjuste,
    enviarRevision,
    aprobarPreliquidacion,
    empleados,
    loadingEmpleados,
    jornadas: jornadas?.data?.data ?? [],
    loadingJornadas,
    permisosPeriodo,
    permisosLoading,
    permisosDescontarIds,
    togglePermisoDescuento,
    seleccionarTodosPermisos,
  };
};
