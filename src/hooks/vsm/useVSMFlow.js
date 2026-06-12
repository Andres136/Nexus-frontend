import { useState, useEffect, useRef } from "react";
import { vsmForecastService } from "../../services/vsm";

export default function useVSMFlow(params = {}) {
  const [data, setData] = useState({
    resumen: {},
    etapas: [],
    analisis: {
      procesos: [],
      cuello_botella: null,
      ordenes_detenidas: [],
    },
    pendientes: [],
    inventario: [],
    alistando: [],
    finalizadas: [],
    delivery: [],
    entregadas: [],
  });

  const [loading, setLoading] = useState(true);

  // Siempre definido en el mismo orden → NO rompe hooks
  const prevDataRef = useRef(null);

  // Comparación segura
  const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const fetchFlow = async () => {
    try {
      const res = await vsmForecastService.vsmFlow(params);
   //   console.log("Flujo VSM cargado:", res.data);
      const newData = res.data;

      // Evita el salto visual → No actualizamos si no cambió la data
      if (!prevDataRef.current || !isEqual(prevDataRef.current, newData)) {
        setData(newData);
        prevDataRef.current = newData;
      }

      setLoading(false);

    } catch (error) {
      console.log("Error cargando flujo VSM", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlow();

    const interval = setInterval(fetchFlow, 10000);
    return () => clearInterval(interval);
  }, [params.umbral_horas]);

  return { data, loading };
}
