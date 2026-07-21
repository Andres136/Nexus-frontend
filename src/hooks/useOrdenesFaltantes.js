import { useState, useEffect } from "react";
import { ordenesApi } from "../services/api";

export function useOrdenesFaltantes(page = 1, search = "", estado = "", sedeId = null, bodegaId = null) {

  const [ordenes, setOrdenes] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchData = async () => {

      try {

        setIsLoading(true);
        setError(null);

        const res = await ordenesApi.getFaltantesPendientes(page, search, estado, sedeId, bodegaId);

        // Compatibilidad con la respuesta corregida y con el formato anterior
        // que envolvía un JsonResponse dentro de otro JsonResponse.
        const payload = res.data?.original ?? res.data ?? {};
        const normalizedPayload = payload.original ?? payload;

        setOrdenes(Array.isArray(normalizedPayload.data) ? normalizedPayload.data : []);
        setPagination(normalizedPayload.pagination || {});

      } catch (err) {

        console.error("Error cargando faltantes", err);
        setError(err);

      } finally {

        setIsLoading(false);

      }

    };

    fetchData();

  }, [page, search, estado, sedeId, bodegaId]);

  return { ordenes, pagination, isLoading, error };
}
