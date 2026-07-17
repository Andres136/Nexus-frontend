import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import clienteAxios from "../config/axios";


export default function useOrdenesTrabajo() {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [fecha, setFecha] = useState("");
  const [sede, setSede] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState(""); // "" = pendientes + parciales (default backend)


  const fetchOrdenesTrabajo = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await clienteAxios.get("/api/ordenes-trabajo", {
        params: {
          page: pagina,
          search: busqueda || undefined,
          fecha: fecha || undefined,
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
          sede: sede || undefined,
          estado: estado || undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

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
    queryKey: ["ordenes-trabajo", pagina, busqueda, fecha, sede, fechaInicio, fechaFin, estado],
    queryFn: fetchOrdenesTrabajo,
    placeholderData: keepPreviousData,
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
    fecha,
    setFecha,
    sede,
    setSede,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    estado,
    setEstado,
  };
}
