import { useEffect, useState } from "react";
import clienteAxios from "../config/axios";

export default function useMisOrdenesCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const fetchOrdenes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await clienteAxios.get(`/api/mis-ordenes`, {
        params: { search: busqueda, page: pagina },
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrdenes(response.data);
      setTotalPaginas(response.data.last_page);
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
