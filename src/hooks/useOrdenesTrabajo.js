import { useQuery} from "@tanstack/react-query";
import { useState } from "react";
import clienteAxios from "../config/axios";

export default function useOrdenesTrabajo() {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  // Función para obtener órdenes de trabajo con paginación y búsqueda
  const fetchOrdenesTrabajo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.get(
        `/api/ordenes-trabajo?page=${pagina}&search=${busqueda}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error obteniendo órdenes de trabajo:", error);
      throw new Error("No se pudieron obtener las órdenes de trabajo");
    }
  };

  const {
    data: ordenesTrabajo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ordenes-trabajo", pagina, busqueda],
    queryFn: fetchOrdenesTrabajo,
    staleTime: 20000, // 20 segundos
  });

  return {
    ordenesTrabajo,
    isLoading,
    error,
    pagina,
    setPagina,
    busqueda,
    setBusqueda,
  };
}
