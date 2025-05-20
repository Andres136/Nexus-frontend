// hooks/useMisOrdenesCompra.js
import { useEffect, useState } from "react";
import clienteAxios from "../config/axios";

export default function useMisOrdenesCompra() {
  const [ordenes, setOrdenes]       = useState([]);  // ahora siempre es un array
  const [isLoading, setIsLoading]   = useState(true);
  const [isError, setIsError]       = useState(false);
  const [busqueda, setBusqueda]     = useState("");
  const [pagina, setPagina]         = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const fetchOrdenes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const { data, last_page } = (await clienteAxios.get(
        `/api/mis-ordenes`,
        {
          params: { search: busqueda, page: pagina },
          headers: { Authorization: `Bearer ${token}` },
        }
      )).data;

      setOrdenes(data);           // <-- sólo el array de órdenes
      setTotalPaginas(last_page); // <-- número de páginas
      setIsError(false);
    } catch (error) {
      console.error("Error al cargar órdenes", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, [busqueda, pagina]);

  return {
    ordenes,
    isLoading,
    isError,
    busqueda,
    setBusqueda,
    pagina,
    setPagina,
    totalPaginas,
    refetch: fetchOrdenes,
  };
}
