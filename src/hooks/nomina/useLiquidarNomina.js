import { useState } from "react";
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

  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados();
  const { jornadas, isLoading: loadingJornadas } = useGetJornadaLaboral();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPreview(null);
  };

  const handleSelectEmpleado = (option) => {
    setFormData((prev) => ({ ...prev, user_id: option ? option.value : "" }));
    setPreview(null);
  };

  const buildPayload = () => {
    const payload = { ...formData };
    delete payload.tipo_liquidacion;
    if (!payload.descuento_id) delete payload.descuento_id;
    if (!payload.fecha_retiro) delete payload.fecha_retiro;
    if (!payload.indemnizacion) delete payload.indemnizacion;
    if (!payload.deducciones) delete payload.deducciones;
    if (formData.tipo_liquidacion !== "retiro") {
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
      const response = formData.tipo_liquidacion === "retiro"
        ? await nominaService.liquidarRetiro(buildPayload())
        : await nominaService.liquidar(buildPayload());
      showToast("success", response.data.message || "Liquidación registrada exitosamente");
      queryClient.invalidateQueries(["nominas"]);
      queryClient.invalidateQueries(["nominaSummary"]);
      queryClient.invalidateQueries(["contrataciones"]);
      setFormData({ ...EMPTY_FORM, ...initialData });
      setPreview(null);
      onSuccess?.();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "Ocurrió un error al liquidar");
    } finally {
      setLoading(false);
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
    empleados,
    loadingEmpleados,
    jornadas: jornadas?.data?.data ?? [],
    loadingJornadas,
  };
};
