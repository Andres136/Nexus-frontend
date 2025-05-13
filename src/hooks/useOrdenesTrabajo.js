import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import clienteAxios from "../config/axios";


export default function useOrdenesTrabajo() {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [fecha, setFecha] = useState(""); // ← NUEVO

  const fetchOrdenesTrabajo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.get(
        `/api/ordenes-trabajo?page=${pagina}&search=${busqueda}&fecha=${fecha}`,
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
    queryKey: ["ordenes-trabajo", pagina, busqueda, fecha],
    queryFn: fetchOrdenesTrabajo,
    staleTime: 20000,
  });

  return {
    ordenesTrabajo,
    isLoading,
    error,
    pagina,
    setPagina,
    busqueda,
    setBusqueda,
    fecha,         // ← NUEVO
    setFecha       // ← NUEVO
  };
}
