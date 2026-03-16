import { useEffect,  useRef,  useState } from "react";

import { toast } from "react-toastify";
import { ordenesCompraProveedoresApi } from "../../services/api";
import { showToast } from "../../helpers/utils/showToast";
 
export default function useReferenciasExcedidas({ ordenId = null, modo = "orden" }={}) {
 // console.log("🚀  ordenId en useReferenciasExcedidas:", ordenId);


    const [referencias, setReferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filaAbierta, setFilaAbierta] = useState(null);
    const [estadoAbierto, setEstadoAbierto] = useState(null);
const dropdownRef = useRef(null);

  const elementosPorPagina = 15; // ✅ Aumentamos para tabla compacta
 useEffect(() => {

  const obtenerReferencias = async () => {
    try {
      setLoading(true);

      let response;

      if (modo === "orden" && ordenId) {
        response = await ordenesCompraProveedoresApi.faltantesPendientesbyId(ordenId);
      }

      if (modo === "global") {
        response = await ordenesCompraProveedoresApi.faltantesPendientes();
      }

      setReferencias(response?.data?.referencias_faltantes || []);

    } catch (error) {
      console.log("Error al obtener referencias:", error);
      toast.error("Error al obtener referencias");
      setReferencias([]);
    } finally {
      setLoading(false);
    }
  };

  obtenerReferencias();

}, [ordenId, modo]);


  const getEstadoStyles = (estado) => {
  switch (estado) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-800";
    case "en_proceso":
      return "bg-blue-100 text-blue-800";
    case "completado":
      return "bg-green-100 text-green-800";
    case "cancelado":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const actualizarEstado = async (observacionId, nuevoEstado) => {
  
  try {
   const response = await ordenesCompraProveedoresApi.actualizarEstadoObservacion(observacionId, nuevoEstado);
  
   showToast('success', response.data.message );
    return response.data.observacion;

    // Refrescar referencias
    // O actualizar estado localmente
  } catch (error) {
    console.log("Error al actualizar estado:", error);
    toast.error("Error al actualizar estado");
  }
};



  // Filtro en tiempo real
  const referenciasFiltradas = referencias.filter((ref) => {
    if (!filtro.trim()) return true;
    
    const texto = filtro.toLowerCase();
    const descripcion = ref.descripcion?.toLowerCase() || '';
    const proveedor = ref.proveedor?.toLowerCase() || '';
    const numeroOrden = ref.numero_orden?.toString() || '';
    
    return (
      descripcion.includes(texto) ||
      proveedor.includes(texto) ||
      numeroOrden.includes(texto)
    );
  });

  // Paginación
  const totalPaginas = Math.ceil(referenciasFiltradas.length / elementosPorPagina);
  const referenciasPaginadas = referenciasFiltradas.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  // Estadísticas
  const totalFaltante = referencias.reduce((sum, ref) => sum + (ref.cantidad_faltante || 0), 0);
  const proveedoresAfectados = new Set(referencias.map(ref => ref.proveedor)).size;
  const sinEntregar = referencias.filter(ref => ref.cantidad_entregada === 0).length

  return {
    // estado
    referenciasPaginadas,
    totalPaginas,
    paginaActual,
    filtro,
    filaAbierta,
    loading,
    // funciones
    setPaginaActual,
    setFiltro,
    setFilaAbierta,
    // estadísticas
    totalFaltante,
    proveedoresAfectados,
    sinEntregar,
    referencias,
    referenciasFiltradas,
    getEstadoStyles,
    actualizarEstado,
    estadoAbierto,
     setEstadoAbierto,
      dropdownRef,
  

 
  };
}