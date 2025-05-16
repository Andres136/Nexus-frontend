import { useEffect, useState } from "react";
import clienteAxios from "../config/axios";

export default function useMisCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const fetchCotizaciones = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await clienteAxios.get("/api/mis-cotizaciones", {
        params: { search: busqueda, page: pagina },
        headers: { Authorization: `Bearer ${token}` },
      });

      setCotizaciones(response.data.data); // Asumiendo formato Laravel paginado
      setTotalPaginas(response.data.last_page);
      setIsError(false);
    } catch (error) {
      console.error("Error al cargar cotizaciones", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCotizaciones();
  }, [busqueda, pagina]);

  return {
    cotizaciones,
    isLoading,
    isError,
    busqueda,
    setBusqueda,
    pagina,
    setPagina,
    totalPaginas,
    refetch: fetchCotizaciones,
  };
}
