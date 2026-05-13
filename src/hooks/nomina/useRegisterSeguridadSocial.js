import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { seguridadSocialService } from "../../services/nominaService";
import { useGetSeguridadSocialById } from "./useGetSeguridadSocialById";

const EMPTY_FORM = {
  nombre: "",
  nit: "",
  direccion: "",
  fecha_inicio: "",
  fecha_fin: "",
 
};

export const useRegisterSeguridadSocial = ({ uuid = null, onSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { seguridadSocial, isLoading: isLoadingData } = useGetSeguridadSocialById(uuid);

  useEffect(() => {
    if (seguridadSocial?.data) {
      const { nombre, nit, direccion, fecha_inicio, fecha_fin, status } = seguridadSocial.data;
      setFormData({
        nombre: nombre ?? "",
        nit: nit ?? "",
        direccion: direccion ?? "",
        fecha_inicio: fecha_inicio?.slice(0, 10) ?? "",
        fecha_fin: fecha_fin?.slice(0, 10) ?? "",
        status: status ?? true,
      });
    } else if (!uuid) {
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [seguridadSocial, uuid]);

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
        ? await seguridadSocialService.updateSeguridadSocial(uuid, formData)
        : await seguridadSocialService.createSeguridadSocial(formData);

      showToast("success", response.data.message || (uuid ? "Actualizado exitosamente" : "Registrado exitosamente"));
      queryClient.invalidateQueries(["seguridadSocial"]);
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
