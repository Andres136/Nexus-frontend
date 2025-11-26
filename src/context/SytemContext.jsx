import { createContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";

const SystemContext = createContext();
const SystemProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const [obtenerOrdenesCompra, setObtenerOrdenesCompra] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  //  const [totalPaginas, setTotalPaginas] = useState(1)
  const [busquedaOrdenesCompra, setBusquedaOrdenesCompra] = useState("");

  const handleRegisterDepartaments = async (data, setErrores) => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.post("/api/departamentos", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setErrores({});
      toast(response.data.message);
      return true;
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const erroresPorCampo = {};
        Object.keys(error.response.data.errors).forEach((campo) => {
          erroresPorCampo[campo] = error.response.data.errors[campo][0];
        });
        setErrores(erroresPorCampo);
        console.log(" Errores por campo: ", erroresPorCampo);
      }
      return false;
    }
  };

  const handlerConsultarUsuarios = async () => {
    try {
      const response = await clienteAxios.get("/api/users");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Función para obtener órdenes de compra
const fetOrdenesCompra = async ({ queryKey }) => {
  const [, page, search] = queryKey;
  const token = localStorage.getItem("token");

  // 🔒 Validar autenticación
  if (!token) {
    console.warn("No hay token de autenticación. No se consultarán órdenes.");
    throw new Error("Usuario no autenticado");
  }

  try {
    const response = await clienteAxios.get(
      `/api/orden-compras?page=${page}&search=${search}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Órdenes de compra obtenidas:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener órdenes de compra:", error);
    throw new Error("Error al obtener órdenes de compra");
  }
};


  // 🔹 React Query para obtener órdenes de compra
  const {
    data: ordenesCompra,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["ordenesCompra", paginaActual, busquedaOrdenesCompra], // ✅ Mantener el queryKey correcto
    queryFn: fetOrdenesCompra, // ✅ Llamar la función sin argumentos
    keepPreviousData: true, // ✅ Mantener los datos anteriores
    staleTime: 60000, // Cachea datos por 60 segundos
    refetchOnWindowFocus: false,
  });




  //Api para traer los productos de siigo

  return (
    <SystemContext.Provider
      value={{
        darkMode,
        obtenerOrdenesCompra,
        paginaActual,
        busquedaOrdenesCompra,
        ordenesCompra,
        isError,
        isLoading,
        setBusquedaOrdenesCompra,
        toggleDarkMode,
        handleRegisterDepartaments,
        handlerConsultarUsuarios,
        setObtenerOrdenesCompra,
        setPaginaActual,
        refetchOrdenesCompra: refetch,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};
export { SystemProvider };
export default SystemContext;
