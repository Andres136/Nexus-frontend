import { useEffect, useRef, useState } from "react";
import { vsmForecastService } from "../../services/vsm";

const EMPTY_DATA = {
  resumen: {},
  productos: [],
  paginacion: {},
  advertencias: [],
};

export default function useVSMSupplyCoverage(params) {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const fetchCoverage = async () => {
      const requestId = ++requestIdRef.current;

      try {
        setLoading(true);
        const response = await vsmForecastService.coberturaAbastecimiento(params);
        if (requestId === requestIdRef.current) {
          setData(response.data);
        }
      } catch (error) {
        console.log("Error cargando cobertura de abastecimiento", error);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchCoverage();
  }, [params.page, params.per_page, params.search, params.estado]);

  return { data, loading };
}
