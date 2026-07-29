import { useMemo, useState } from "react";
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

  const { jornadas, isLoading: loadingJornadas } = useGetJornadaLaboral();
  const { empresas, loading: loadingEmpresas } = useEmpresas();

  const buildPayload = () => {
    const payload = { ...formData };
    if (!payload.empresa_id) delete payload.empresa_id;
    return payload;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setResultado(null);
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

  const handlePreview = async () => {
    setPreviewLoading(true);
    setFieldErrors({});
    setSearchEmpleados("");
    setPage(1);
    try {
      const response = await nominaService.preliquidarLote(buildPayload());
      setResultado(response.data.data);
      const { empleados_calculados, empleados_con_error } = response.data.data.totales;
      showToast(
        "success",
        `Se calcularon ${empleados_calculados} empleados` +
          (empleados_con_error > 0 ? ` (${empleados_con_error} con error).` : ".")
      );
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      setResultado(null);
      showToast("error", data?.message || "Ocurrió un error al preliquidar el lote.");
    } finally {
      setPreviewLoading(false);
    }
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
  };
};
