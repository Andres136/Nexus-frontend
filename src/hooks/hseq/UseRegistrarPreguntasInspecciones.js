import { useState } from "react";

import { PreguntasInspeccionesService } from "../../services/hseqService";
import { showToast } from "../../helpers/utils/showToast";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";

export const useRegistrarPreguntasInspecciones = () => {
  const [formData, setFormData] = useState({
    tipo_inspeccion_id: "",
    preguntas: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  // Agregar nueva pregunta
  const addPregunta = () => {
    setFormData((prev) => ({
      ...prev,
      preguntas: [
        ...prev.preguntas,
        {
          pregunta: "",
          tipo_respuesta: "",
          orden: prev.preguntas.length + 1,
          activa: true,
        },
      ],
    }));
  };

  // Actualizar pregunta
  const updatePregunta = (index, field, value) => {
    const nuevasPreguntas = [...formData.preguntas];
    nuevasPreguntas[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      preguntas: nuevasPreguntas,
    }));
  };

  // Eliminar pregunta
  const removePregunta = (index) => {
    const nuevasPreguntas = formData.preguntas.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      preguntas: nuevasPreguntas,
    }));
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      const response = await PreguntasInspeccionesService.createPreguntaInspeccion(formData);
  showToast("success", response.data.message || "Preguntas de inspección registradas exitosamente");
        queryClient.invalidateQueries(["preguntasInspeccion"]);
      setFormData({
        tipo_inspeccion_id: "",
        preguntas: [],
      });
      return response;
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };


  //Actualizar pregunta
 const handleUpdate = async (id) => {
  try {
    setLoading(true);
    setErrors({});

    const response = await PreguntasInspeccionesService.updatePreguntaInspeccion(
      id,
      {
        pregunta: formData.preguntas[0].pregunta,
        tipo_respuesta: formData.preguntas[0].tipo_respuesta,
      }
    );

    showToast("success", response.data.message);

 
    queryClient.invalidateQueries(["preguntasInspeccion"]);

    setFormData({
      tipo_inspeccion_id: "",
      preguntas: [],
    });

    return response;
  } catch (error) {
    if (error.response?.status === 422) {
      setErrors(error.response.data.errors);
    }
    throw error;
  } finally {
    setLoading(false);
  }
};
  //Eliminar pregunta
  const eliminarPregunta = async (id) => {
    if (Swal) {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) {
        return;
      }
    
    }


    try {
      setLoading(true);
      await PreguntasInspeccionesService.deletePreguntaInspeccion(id);
     Swal.fire("Eliminado", "La pregunta de inspección ha sido eliminada.", "success");
            queryClient.invalidateQueries(["preguntasInspeccion"]);
    } catch (error) {
      console.error("Error al eliminar la pregunta de inspección:", error);
      showToast("error", "Hubo un problema al eliminar la pregunta de inspección");
    } finally {
      setLoading(false);
    }
  }

  return {
    formData,
    setFormData,
    addPregunta,
    updatePregunta,
    removePregunta,
    handleSubmit,
    eliminarPregunta,
    handleUpdate,
    loading,
    errors,
  };
};