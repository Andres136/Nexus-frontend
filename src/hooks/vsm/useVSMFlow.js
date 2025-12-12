import { useState, useEffect, useRef } from "react";
import { vsmForecastService } from "../../services/vsm";

export default function useVSMFlow() {
  const [data, setData] = useState({
    pendientes: [],
    alistando: [],
    finalizadas: [],
    delivery: []
  });

  const [loading, setLoading] = useState(true);

  // Siempre definido en el mismo orden → NO rompe hooks
  const prevDataRef = useRef(null);

  // Comparación segura
  const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const fetchFlow = async () => {
    try {
      const res = await vsmForecastService.vsmFlow();
      const newData = res.data;

      // Evita el salto visual → No actualizamos si no cambió la data
      if (!prevDataRef.current || !isEqual(prevDataRef.current, newData)) {
        setData(newData);
        prevDataRef.current = newData;
      }

      setLoading(false);

    } catch (error) {
      console.error("Error cargando flujo VSM", error);
    }
  };

  useEffect(() => {
    fetchFlow();

    const interval = setInterval(fetchFlow, 10000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading };
}
