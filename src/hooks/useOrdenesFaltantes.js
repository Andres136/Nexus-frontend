import { useState, useEffect } from "react";
import { ordenesApi } from "../services/api";


export function useOrdenesFaltantes() {
  const [ordenes, setOrdenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ordenesApi.getFaltantesPendientes();
        setOrdenes(res.data.ordenes || []);
        console.log("✅ Órdenes con faltantes cargadas:", res.data.ordenes);
      } catch (err) {
        console.error("❌ Error al cargar faltantes:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { ordenes, isLoading, error };
}
