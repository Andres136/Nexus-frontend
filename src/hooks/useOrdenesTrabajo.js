import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import clienteAxios from "../config/axios";


export default function useOrdenesTrabajo() {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [fecha, setFecha] = useState(""); // ← NUEVO
  const [sede, setSede] = useState(""); // ← NUEVO
  const [fechaInicio, setFechaInicio] = useState("");
const [fechaFin, setFechaFin] = useState("");



const fetchOrdenesTrabajo = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await clienteAxios.get(
      `/api/ordenes-trabajo?page=${pagina}
        &search=${busqueda}
        &fecha=${fecha}
        &fecha_inicio=${fechaInicio}
        &fecha_fin=${fechaFin}
        &sede=${sede}`
        .replace(/\s+/g, ""),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
   // console.log("Respuesta de órdenes de trabajo:", response);
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
    queryKey: ["ordenes-trabajo", pagina, busqueda, fecha, sede, fechaInicio, fechaFin],
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
    setFecha,       // ← NUEVO
    sede,          // ← NUEVO
    setSede,      // ← NUEVO
    fechaInicio,   // ← NUEVO
    setFechaInicio,// ← NUEVO
    fechaFin,      // ← NUEVO
    setFechaFin,   // ← NUEVO
  };
}
