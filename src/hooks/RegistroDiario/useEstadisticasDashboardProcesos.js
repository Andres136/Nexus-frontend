import { useEffect, useState } from "react";

import { apiCliente } from "../../services/registroDiarioService";

export const useEstadisticasDashboardProcesos = (anio) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!anio) return;

    setLoading(true);

    apiCliente.getEstadisticas(anio)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [anio]);

  return { data, loading };
};
