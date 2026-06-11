import { useEffect, useState } from "react";
import { vsmForecastService } from "../../services/vsm";

const EMPTY_DATA = {
  resumen: {},
  ordenes: [],
  advertencias: [],
};

export default function useVSMCapacity(usuarios, diasObjetivo) {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        setLoading(true);
        const response = await vsmForecastService.capacidad({
          usuarios,
          dias_objetivo: diasObjetivo,
        });
        setData(response.data);
      } catch (error) {
        console.log("Error cargando capacidad VSM", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapacity();
  }, [usuarios, diasObjetivo]);

  return { data, loading };
}
