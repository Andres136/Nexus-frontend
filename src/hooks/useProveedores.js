import { useEffect, useState } from "react";
import clienteAxios from "../config/axios";
import Swal from "sweetalert2";

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


  const obtenerOrdenes = async (page = 1, search = "", fechaInicio = "", fechaFin = "") => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await clienteAxios.get(`/api/ordenes-compra-proveedor`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          search, // 👈 Envía el término
      fecha_inicio: fechaInicio,
  fecha_fin: fechaFin
        },
      });
     // console.log(response.data.ordenes);
      setOrdenes(response.data.ordenes);
      setPagina(response.data.ordenes.current_page);
      setLastPage(response.data.ordenes.last_page);
    } catch (error) {
      console.error("Error al traer las órdenes", error);
    } finally {
      setLoading(false);
    }
  };
  
//Eliminar orden de compra proveedor
const eliminarOrden = async (id) => {
  const token = localStorage.getItem("token");

  const confirma = await Swal.fire({
    title: "¿Eliminar orden?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirma.isConfirmed) return;

  try {
    await clienteAxios.delete(`/api/ordenes-compra-proveedor/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Remover del estado
    setOrdenes((prev) => ({
      ...prev,
      data: prev.data.filter((o) => o.id !== id),
    }));

    Swal.fire("Eliminado", "La orden fue eliminada.", "success");

  } catch (error) {
    console.error("Error al eliminar la orden", error);
    Swal.fire("Error", "No se pudo eliminar la orden.", "error");
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
  eliminarOrden,
  setPagina,
obtenerOrdenes,
setSearchTerm,


    }
}