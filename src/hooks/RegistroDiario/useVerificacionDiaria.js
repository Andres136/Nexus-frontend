import { useEffect, useState } from "react";
import { showToast } from "../../helpers/utils/showToast";
import { apiClienteVerificacion } from "../../services/registroDiarioService";

export const useVerificacionDiaria = (registroSeleccionado) => {

  const [formData, setFormData] = useState({
    registro_diario_id: null,
    pregunta_id: null,
    estado: '',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //  AUTOCARGA desde el registro seleccionado
  useEffect(() => {
    if (!registroSeleccionado) return;

    setFormData(prev => ({
      ...prev,
      registro_diario_id: registroSeleccionado.id,
      pregunta_id: registroSeleccionado.pregunta?.id ?? null,
    }));

  }, [registroSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClienteVerificacion.create(formData);
      showToast('success', 'Verificación registrada');

      // reset SOLO campos editables
      setFormData(prev => ({
        ...prev,
        estado: '',
        observaciones: '',
      }));

    } catch (err) {
        console.error(err);
      if (err.response?.status === 422) {
        setError(err.response.data);
      } else {
        showToast('error', 'Error al registrar verificación');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
  };
};
