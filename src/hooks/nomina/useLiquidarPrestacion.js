import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { prestacionService } from "../../services/nominaService";
import { useGetEmpleados } from "./useGetEmpleados";

const TIPOS = [
  { value: "prima",                  label: "Prima de servicios" },
  { value: "cesantias",              label: "Cesantías e intereses" },
  { value: "vacaciones_compensadas", label: "Vacaciones compensadas" },
];

function defaultPeriodo(tipo) {
  const hoy    = new Date();
  const anio   = hoy.getFullYear();
  const mes    = hoy.getMonth() + 1;

  if (tipo === "prima") {
    // Primer semestre: ene–jun; segundo semestre: jul–dic
    return mes <= 6
      ? { inicio: `${anio}-01-01`, fin: `${anio}-06-30` }
      : { inicio: `${anio}-07-01`, fin: `${anio}-12-20` };
  }
  if (tipo === "cesantias") {
    // Período fiscal: 1 ene al 31 dic del año
    return { inicio: `${anio}-01-01`, fin: `${anio}-12-31` };
  }
  // Vacaciones: desde inicio del año hasta hoy
  const hoyStr = hoy.toISOString().slice(0, 10);
  return { inicio: `${anio}-01-01`, fin: hoyStr };
}

const EMPTY = {
  user_id:        "",
  tipo:           "prima",
  periodo_inicio: "",
  periodo_fin:    "",
  vacacion_uuid:  "",
};

export const useLiquidarPrestacion = ({ onSuccess } = {}) => {
  const queryClient                     = useQueryClient();
  const [formData, setFormData]         = useState(EMPTY);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [loading, setLoading]           = useState(false);
  const [preview, setPreview]           = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados();
  const esVacaciones = formData.tipo === "vacaciones_compensadas";

  const { data: vacacionesAprobadas = [], isLoading: loadingVacaciones } = useQuery({
    queryKey: ["vacaciones-aprobadas-prestacion", formData.user_id],
    queryFn: async () => (
      await prestacionService.getVacacionesAprobadas(formData.user_id)
    ).data.data,
    enabled: esVacaciones && Boolean(formData.user_id),
  });

  useEffect(() => {
    if (!esVacaciones || vacacionesAprobadas.length !== 1 || formData.vacacion_uuid) return;

    const vacacion = vacacionesAprobadas[0];
    setFormData((prev) => ({
      ...prev,
      vacacion_uuid: vacacion.uuid,
      periodo_inicio: String(vacacion.fecha_inicio).slice(0, 10),
      periodo_fin: String(vacacion.fecha_fin).slice(0, 10),
    }));
  }, [esVacaciones, formData.vacacion_uuid, vacacionesAprobadas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Al cambiar el tipo, sugerir fechas por defecto
      if (name === "tipo") {
        const defaults = defaultPeriodo(value);
        next.periodo_inicio = defaults.inicio;
        next.periodo_fin    = defaults.fin;
        next.vacacion_uuid   = "";
      }
      return next;
    });
    setPreview(null);
  };

  const handleSelectEmpleado = (option) => {
    setFormData((prev) => ({
      ...prev,
      user_id: option ? option.value : "",
      vacacion_uuid: "",
      ...(esVacaciones ? { periodo_inicio: "", periodo_fin: "" } : {}),
    }));
    setPreview(null);
  };

  const handleSelectVacacion = (event) => {
    const vacacion = vacacionesAprobadas.find((item) => item.uuid === event.target.value);
    setFormData((prev) => ({
      ...prev,
      vacacion_uuid: vacacion?.uuid ?? "",
      periodo_inicio: vacacion ? String(vacacion.fecha_inicio).slice(0, 10) : "",
      periodo_fin: vacacion ? String(vacacion.fecha_fin).slice(0, 10) : "",
    }));
    setPreview(null);
  };

  const empleadoOptions = useMemo(
    () => empleados.map((e) => ({ value: e.value, label: e.label })),
    [empleados]
  );

  const empleadoSeleccionado = useMemo(
    () => empleadoOptions.find((e) => String(e.value) === String(formData.user_id)) ?? null,
    [empleadoOptions, formData.user_id]
  );

  const handlePreview = async () => {
    setPreviewLoading(true);
    setFieldErrors({});
    try {
      const response = await prestacionService.preliquidar(formData);
      setPreview(response.data.data);
      showToast("success", response.data.message || "Preliquidación calculada");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      setPreview(null);
      showToast("error", data?.message || "Error al calcular");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const response = await prestacionService.liquidar(formData);
      showToast("success", response.data.message || "Prestación liquidada exitosamente");
      queryClient.invalidateQueries(["liquidacionesPrestaciones"]);
      setFormData(EMPTY);
      setPreview(null);
      onSuccess?.(response.data);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "Error al liquidar");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSelectEmpleado,
    handleSelectVacacion,
    handlePreview,
    handleSubmit,
    fieldErrors,
    loading,
    preview,
    previewLoading,
    empleadoOptions,
    empleadoSeleccionado,
    loadingEmpleados,
    vacacionesAprobadas,
    loadingVacaciones,
    tipos: TIPOS,
  };
};
