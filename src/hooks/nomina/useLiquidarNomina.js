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

export const useLiquidarNomina = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados();
  const { jornadas, isLoading: loadingJornadas } = useGetJornadaLaboral();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectEmpleado = (option) => {
    setFormData((prev) => ({ ...prev, user_id: option ? option.value : "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const payload = { ...formData };
      if (!payload.descuento_id) delete payload.descuento_id;

      const response = await nominaService.liquidar(payload);
      showToast("success", response.data.message || "Nómina liquidada exitosamente");
      queryClient.invalidateQueries(["nominas"]);
      queryClient.invalidateQueries(["nominaSummary"]);
      setFormData(EMPTY_FORM);
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
    handleSubmit,
    fieldErrors,
    loading,
    empleados,
    loadingEmpleados,
    jornadas: jornadas?.data?.data ?? [],
    loadingJornadas,
  };
};
