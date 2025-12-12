import { useEffect, useState } from "react";
import { otAlistamientoService } from "../../services/vsm";


export function useAlistamientosActivos() {
  const [alistamientos, setAlistamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivos = async () => {
    try {
      const res = await otAlistamientoService.alistamientoActivoPorOT();

      console.log("Alistamientos activos:", res.data);
      setAlistamientos(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();

    // refrescar cada 2 segundos
    const interval = setInterval(fetchActivos, 2000);

    return () => clearInterval(interval);
  }, []);

  return { alistamientos, loading, refresh: fetchActivos };
}
