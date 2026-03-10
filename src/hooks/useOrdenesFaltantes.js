import { useState, useEffect } from "react";
import { ordenesApi } from "../services/api";

export function useOrdenesFaltantes(page = 1, search = "") {

  const [ordenes, setOrdenes] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchData = async () => {

      try {

        setIsLoading(true);

        const res = await ordenesApi.getFaltantesPendientes(page, search);

        console.log("Respuesta de ordenes faltantes:", res.data.original);

        const payload = res.data.original;

        setOrdenes(payload.data || []);
        setPagination(payload.pagination || {});

      } catch (err) {

        console.error("Error cargando faltantes", err);
        setError(err);

      } finally {

        setIsLoading(false);

      }

    };

    fetchData();

  }, [page, search]);

  return { ordenes, pagination, isLoading, error };
}