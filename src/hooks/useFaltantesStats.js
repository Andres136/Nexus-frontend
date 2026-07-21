import { useState, useEffect } from "react";
import { ordenesApi } from "../services/api";

export function useFaltantesStats(sedeId = null, bodegaId = null) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await ordenesApi.getFaltantesEstadisticas(sedeId, bodegaId);
        setStats(res.data);
      } catch (err) {
        console.error("Error cargando estadísticas faltantes", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [sedeId, bodegaId]);

  return { stats, isLoading };
}
