import { useEffect, useState } from "react";
import { apiClientePreguntas } from "../../services/registroDiarioService";
import { showToast } from "../../helpers/utils/showToast";

export const usePreguntas = (departamentoId) => {

  const [formData, setFormData] = useState({
    departamento_id: null,
    preguntas: [{ pregunta: '' }],
  });

  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Listar preguntas por departamento
  useEffect(() => {
    if (!departamentoId) {
      setPreguntas([]);
      return;
    }

    const fetchPreguntas = async () => {
      try {
        setLoading(true);
        const res = await apiClientePreguntas.getById(departamentoId);
        setPreguntas(res.data);
      } finally {
        setLoading(false);
      }
    };

    fetchPreguntas();
  }, [departamentoId]);

  // 🔹 Cambio simple (departamento)
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // limpiar error del campo
    if (error?.errors?.[name]) {
      setError(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: null,
        },
      }));
    }
  };

  // 🔹 Cambio de pregunta por índice
  const handlePreguntaChange = (index, value) => {
    const nuevas = [...formData.preguntas];
    nuevas[index].pregunta = value;

    setFormData(prev => ({
      ...prev,
      preguntas: nuevas,
    }));

    if (error?.errors?.[`preguntas.${index}.pregunta`]) {
      setError(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [`preguntas.${index}.pregunta`]: null,
        },
      }));
    }
  };

  const addPregunta = () => {
    setFormData(prev => ({
      ...prev,
      preguntas: [...prev.preguntas, { pregunta: '' }],
    }));
  };

  const removePregunta = (index) => {
    setFormData(prev => ({
      ...prev,
      preguntas: prev.preguntas.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiClientePreguntas.create(formData);
      showToast('success', response.data.message);

      // reset limpio
      setFormData({
        departamento_id: null,
        preguntas: [{ pregunta: '' }],
      });

      setError(null);
    } catch (err) {
        console.error(err);
      if (err.response?.status === 422) {
        setError(err.response.data);
      } else {
        showToast('error', 'Error de conexión');
      }
    }
  };

  return {
    preguntas,
    loading,
    error,
    formData,
    handleChange,
    handlePreguntaChange,
    handleSubmit,
    addPregunta,
    removePregunta,
  };
};
