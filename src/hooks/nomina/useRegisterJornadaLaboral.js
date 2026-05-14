import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { jornadaLaboralService } from "../../services/nominaService";
import { useGetJornadaLaboralById } from "./useGetJornadaLaboralById";

const EMPTY_FORM = {
  nombre: "",
  horas_semanales: "",
  status: true,
};

export const useRegisterJornadaLaboral = ({ uuid = null, onSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { jornada, isLoading: isLoadingData } = useGetJornadaLaboralById(uuid);

  useEffect(() => {
    if (jornada?.data) {
      const { nombre, horas_semanales, status } = jornada.data;
      setFormData({
        nombre: nombre ?? "",
        horas_semanales: horas_semanales ?? "",
        status: status ?? true,
      });
    } else if (!uuid) {
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [jornada, uuid]);

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
        ? await jornadaLaboralService.updateJornada(uuid, formData)
        : await jornadaLaboralService.createJornada(formData);

      showToast("success", response.data.message || (uuid ? "Actualizado exitosamente" : "Registrado exitosamente"));
      queryClient.invalidateQueries(["jornadaLaboral"]);
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
