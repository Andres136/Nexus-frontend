import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { tipoRegistroService } from "../../services/nominaService";
import { useGetTipoRegistroById } from "./useGetTipoRegistroById";

const EMPTY_FORM = {
  name: "",
  activo: true,
};

export const useRegisterTipoRegistro = ({ uuid = null, onSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { tipoRegistro, isLoading: isLoadingData } = useGetTipoRegistroById(uuid);

  useEffect(() => {
    if (tipoRegistro?.data) {
      const { name, activo } = tipoRegistro.data;
      setFormData({ name: name ?? "", activo: activo ?? true });
    } else if (!uuid) {
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [tipoRegistro, uuid]);

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
        ? await tipoRegistroService.updateTipoRegistro(uuid, formData)
        : await tipoRegistroService.createTipoRegistro(formData);

      showToast("success", response.data.message || (uuid ? "Actualizado exitosamente" : "Registrado exitosamente"));
      queryClient.invalidateQueries(["tipoRegistros"]);
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
