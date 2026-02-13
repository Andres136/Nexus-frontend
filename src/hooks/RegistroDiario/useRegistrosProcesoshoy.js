import { useEffect, useState } from "react";
import { apiClienteVerificacion } from "../../services/registroDiarioService";

export const useRegistrosProcesoshoy = (departamentoId) => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRegistros = async () => {
    if (!departamentoId) {
      setRegistros([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Asumiendo que tienes un endpoint para obtener registros por departamento
      const response = await apiClienteVerificacion.getById(departamentoId);
      setRegistros(response.data);
    } catch (err) {
      setError(err.response?.data || err.message);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, [departamentoId]);

  return {
    registros,
    loading,
    error,
  };
};