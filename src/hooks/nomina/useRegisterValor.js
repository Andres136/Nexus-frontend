import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { valorService } from "../../services/nominaService";
import { useGetValorById } from "./useGetValorById";

const EMPTY_FORM = {
  valor_hora_normal: "",
  valor_hora_nocturna: "",
  valor_hora_dominical: "",
  valor_hora_dominical_extra: "",
  status: true,
};

export const useRegisterValor = ({ uuid = null, onSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { valor, isLoading: isLoadingData } = useGetValorById(uuid);

  useEffect(() => {
    if (valor?.data) {
      const { valor_hora_normal, valor_hora_nocturna, valor_hora_dominical, valor_hora_dominical_extra, status } = valor.data;
      setFormData({
        valor_hora_normal: valor_hora_normal ?? "",
        valor_hora_nocturna: valor_hora_nocturna ?? "",
        valor_hora_dominical: valor_hora_dominical ?? "",
        valor_hora_dominical_extra: valor_hora_dominical_extra ?? "",
        status: status ?? true,
      });
    } else if (!uuid) {
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [valor, uuid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const response = uuid
        ? await valorService.updateValor(uuid, formData)
        : await valorService.createValor(formData);

      showToast("success", response.data.message || (uuid ? "Actualizado exitosamente" : "Registrado exitosamente"));
      queryClient.invalidateQueries(["valores"]);
      if (!uuid) setFormData(EMPTY_FORM);
      onSuccess?.();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return { formData, handleChange, handleSubmit, fieldErrors, loading, isLoadingData };
};
