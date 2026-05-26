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
    if (!payload.descuento_id) delete payload.descuento_id;
    return payload;
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setFieldErrors({});
    try {
      const response = await nominaService.preliquidar(buildPayload());
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
      const response = await nominaService.liquidar(buildPayload());
      showToast("success", response.data.message || "Nómina liquidada exitosamente");
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
