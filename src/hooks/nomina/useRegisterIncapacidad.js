import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { incapacidadService, portalEmpleadoService } from "../../services/nominaService";
import { useGetIncapacidadById } from "./useGetIncapacidadById";

const EMPTY_FORM = {
  tipo_incapacidad: "",
  origen: "eps",
  identidad_medica_id: "",
  inicio: "",
  fin: "",
  soporte: null,
};

export const useRegisterIncapacidad = ({ uuid = null, onSuccess, portalMode = false } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { incapacidad, isLoading: isLoadingData } = useGetIncapacidadById(uuid);

  useEffect(() => {
    if (incapacidad?.data) {
      const { tipo_incapacidad, origen, identidad_medica_id, inicio, fin } = incapacidad.data;
      setFormData({
        tipo_incapacidad: tipo_incapacidad ?? "",
        origen: origen ?? "eps",
        identidad_medica_id: identidad_medica_id ?? "",
        inicio: inicio?.slice(0, 10) ?? "",
        fin: fin?.slice(0, 10) ?? "",
        soporte: null,
      });
    } else if (!uuid) {
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [incapacidad, uuid]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] ?? null : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        payload.append(key, value);
      }
    });

    try {
      const response = uuid
        ? await incapacidadService.updateIncapacidad(uuid, payload)
        : portalMode
          ? await portalEmpleadoService.createIncapacidad(payload)
          : await incapacidadService.createIncapacidad(payload);

      showToast("success", response.data.message || (uuid ? "Actualizado exitosamente" : "Registrado exitosamente"));
      queryClient.invalidateQueries(["incapacidades"]);
      queryClient.invalidateQueries(["incapacidades-portal"]);
      if (!uuid) setFormData(EMPTY_FORM);
      onSuccess?.();
    } catch (err) {
      
      const data = err.response?.data;
    //  console.error("Error en registro de incapacidad:", err);
      if (data?.errors) setFieldErrors(data.errors);
      showToast("error", data?.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    fieldErrors,
    loading,
    isLoadingData,
    soporteActual: incapacidad?.data?.soporte_url ?? null,
  };
};
