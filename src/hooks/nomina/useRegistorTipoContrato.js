import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { tipoContratoService } from "../../services/nominaService";
import { useGetByIdTipoContrato } from "./useGetByIdTipoContrato";

const EMPTY_FORM = { nombre: "", descripcion: "", activo: true };

export const useRegistrarTipoContrato = ({ id = null, onSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { tipoContrato, isLoading: isLoadingData } = useGetByIdTipoContrato(id);

  useEffect(() => {
    if (tipoContrato?.data) {
      const { nombre, descripcion, activo } = tipoContrato.data;
      setFormData({ nombre: nombre ?? "", descripcion: descripcion ?? "", activo: activo ?? true });
    } else if (!id) {
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [tipoContrato, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const response = id
        ? await tipoContratoService.updateTipoContrato(id, formData)
        : await tipoContratoService.createTipoContrato(formData);

      showToast("success", response.data.message || (id ? "Actualizado exitosamente" : "Registrado exitosamente"));
      queryClient.invalidateQueries(["tipoContratos"]);
      if (!id) setFormData(EMPTY_FORM);
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
