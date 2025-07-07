import { useEffect, useState } from "react";
import clienteAxios from "../config/axios";

export function useProveedores (){

    const [proveedores, setProveedores] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

  const obtenerProveedores = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get("/api/proveedores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProveedores(response.data.proveedores);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  }


  const obtenerOrdenes = async (page = 1, search = "") => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await clienteAxios.get(`/api/ordenes-compra-proveedor`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          search, // 👈 Envía el término
        },
      });
      console.log(response.data.ordenes);
      setOrdenes(response.data.ordenes);
      setPagina(response.data.ordenes.current_page);
      setLastPage(response.data.ordenes.last_page);
    } catch (error) {
      console.error("Error al traer las órdenes", error);
    } finally {
      setLoading(false);
    }
  };
  
 
  useEffect(() => {
    obtenerProveedores();
    obtenerOrdenes(pagina);
   
  }, [pagina]);


    return{
  proveedores,
  ordenes,
  loading,
  pagina,
  lastPage,
  searchTerm,
  setPagina,
obtenerOrdenes,
setSearchTerm,

    }
}