import { useState, useEffect } from "react";

import { vsmForecastService } from "../../services/vsm";


export default function useVSMForecast(usuarios = 1) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await vsmForecastService.pronosticoGlobal(usuarios);
      console.log("Pronóstico VSM cargado:", res.data);
      setData(res.data);
    } catch (error) {
      console.error("Error cargando pronóstico VSM", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [usuarios]);

  return { data, loading };
}
