import { useEffect, useState } from "react";

import { apiClienteVerificacion } from "../../services/registroDiarioService";

export const useEstadisticasDashboard = (anio = new Date().getFullYear()) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiClienteVerificacion.getEstadisticas(anio);
    
        setData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [anio]);

  return { data, loading };
};
