import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PublicacionMarketingService } from "../../services/marketingService";
import { showToast } from "../../helpers/utils/showToast";

const initialState = {
  titulo: "",
  red_social_id: "",
  tipo_post_id: "",
  fecha: "",
  estado: "programado",
  link: "",
  descripcion: "",
};

export const useRegistrarPublicacion = () => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => setFormData(initialState);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await PublicacionMarketingService.createPublicacion(formData);
      showToast("success", response.data.message || "Publicación registrada exitosamente");
      resetForm();
      queryClient.invalidateQueries(["publicaciones-marketing"]);
      return true;
    } catch (err) {
      console.error("Error al registrar la publicación:", err);
      if (err.response?.status === 422) {
        setError(err.response.data.errors);
      } else {
        showToast("error", "Hubo un problema al registrar la publicación");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCampos = async (id, data) => {
    try {
      await PublicacionMarketingService.updatePublicacion(id, data);
      showToast("success", "Publicación actualizada exitosamente");
      queryClient.invalidateQueries(["publicaciones-marketing"]);
      return true;
    } catch (err) {
      console.error("Error al actualizar la publicación:", err);
      showToast("error", "Hubo un problema al actualizar la publicación");
      return false;
    }
  };

  const handleUpdateEstado = (id, estado) => handleUpdateCampos(id, { estado });

  const handleDelete = async (id) => {
    try {
      await PublicacionMarketingService.deletePublicacion(id);
      showToast("success", "Publicación eliminada exitosamente");
      queryClient.invalidateQueries(["publicaciones-marketing"]);
    } catch (err) {
      console.error("Error al eliminar la publicación:", err);
      showToast("error", "Hubo un problema al eliminar la publicación");
    }
  };

  return {
    formData,
    setFormData,
    error,
    loading,
    handleChange,
    handleSubmit,
    handleUpdateEstado,
    handleUpdateCampos,
    handleDelete,
    resetForm,
  };
};
