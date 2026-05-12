import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { soporteTareasService } from "../../services/calidaService";

export const useRegisterSoporteTarea = ({ id = null, tipo = "tarea" }) => {
  const queryClient = useQueryClient();
  const [soportes, setSoportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilesChange = (files) => {
    if (!files) return;
    setSoportes((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (index) => {
    setSoportes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitSoportes = async () => {
    if (!soportes.length) return;
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      soportes.forEach((archivo) => formData.append("soporte_tarea[]", archivo));

      if (tipo === "tarea") formData.append("tarea_id", id);
      if (tipo === "hallazgo") formData.append("hallazgo_id", id);

      const response = await soporteTareasService.createTarea(formData);

      showToast("success", response?.data?.message || "Soportes registrados correctamente");
      setSoportes([]);

      // Refrescar la lista de soportes del hallazgo/tarea
      queryClient.invalidateQueries({ queryKey: [tipo === "hallazgo" ? "soporte-hallazgo" : "soporte-tarea", id] });

      return response.data;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        setError(err.response.data.errors);
        showToast("error", "Errores de validación");
      } else {
        setError({ general: ["Error al registrar soportes"] });
        showToast("error", "Error al registrar soportes");
      }
    } finally {
      setLoading(false);
    }
  };

  return { soportes, loading, error, handleFilesChange, removeFile, handleSubmitSoportes };
};
