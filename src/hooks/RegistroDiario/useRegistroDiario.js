import { useState } from "react";
import { apiCliente } from "../../services/registroDiarioService";
import { showToast } from "../../helpers/utils/showToast";

export const useRegistroDiario = () => {
  const initialFormData = {
    departamento_id: null,
    pregunta_id: null,
    tipo: 'no',
    novedad: '',
    numero_no_conformidad: '',
    fuentes: '',
    tipo_accion: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, option) => {
    setFormData(prev => ({
      ...prev,
      [name]: option?.value ?? null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
       const response = await apiCliente.create(formData);
         showToast('success', response.data.message );
      setFormData(initialFormData);
      return true;

    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data);
      } else {
        setError({ message: 'Error inesperado' });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    handleChange,
    handleSelectChange,
    handleSubmit,
  };
};
