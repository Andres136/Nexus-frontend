// src/hooks/useVehiculos.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clienteAxios from "../config/axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export function useListarVehiculos() {
  const [vehiculos, setVehiculos] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // UI state desacoplado
  const [expanded, setExpanded] = useState(null);
  const [fotosPorVehiculo, setFotosPorVehiculo] = useState({});
  const [openLightbox, setOpenLightbox] = useState(false);
  const [galeria, setGaleria] = useState([]);
  const [paginasInternas, setPaginasInternas] = useState({});
  const [fechasInternas, setFechasInternas] = useState({});
  const [edicionFechas, setEdicionFechas] = useState({});
  const [archivosEditados, setArchivosEditados] = useState({});

  const cancelRef = useRef({ canceled: false });

  const tokenHeader = useMemo(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const fetchVehiculos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clienteAxios.get(
        `/api/vehiculos-all?search=${encodeURIComponent(search)}&page=${page}`,
        { headers: tokenHeader }
      );
  
      if (!cancelRef.current.canceled) setVehiculos(data.vehiculos);
    } catch (e) {
      console.error("Error fetching vehiculos:", e);
      if (!cancelRef.current.canceled) toast.error("No se pudieron cargar los vehículos");
    } finally {
      if (!cancelRef.current.canceled) setLoading(false);
    }
  }, [search, page, tokenHeader]);

  useEffect(() => {
    cancelRef.current.canceled = false;
    fetchVehiculos();
    return () => {
      cancelRef.current.canceled = true;
    };
  }, [fetchVehiculos]);

  const toggleExpand = useCallback(async (vehiculoId) => {
    setExpanded((prev) => (prev === vehiculoId ? null : vehiculoId));
    if (!fotosPorVehiculo[vehiculoId]) {
      await cargarFotosVehiculo(vehiculoId);
    }
  }, [fotosPorVehiculo]);

  const cargarFotosVehiculo = useCallback(async (vehiculoId) => {
    try {
      const { data } = await clienteAxios.get(`/api/vehiculos/${vehiculoId}/fotos`, {
        headers: tokenHeader,
      });
      if (!cancelRef.current.canceled) {
        setFotosPorVehiculo((prev) => ({ ...prev, [vehiculoId]: data }));
      }

    } catch (e) {
      console.error("Error al cargar fotos del vehículo", e);
    }
  }, [tokenHeader]);

  // Ediciones de documentos
  const manejarCambioArchivo = useCallback((documentoId, archivo) => {
    setArchivosEditados((prev) => ({ ...prev, [documentoId]: archivo }));
  }, []);

  const manejarCambioFecha = useCallback((documentoId, campo, valor) => {
    setEdicionFechas((prev) => ({
      ...prev,
      [documentoId]: { ...(prev[documentoId] || {}), [campo]: valor },
    }));
  }, []);

  const guardarFechasDocumento = useCallback(async (documentoId) => {
    const datos = edicionFechas[documentoId];
    if (!datos?.fecha_vencimiento) return toast.error("La fecha de vencimiento es obligatoria");

    try {
      const formData = new FormData();
      formData.append("fecha_vencimiento", datos.fecha_vencimiento);
      formData.append("fecha_renovacion", datos.fecha_renovacion ?? "");
      if (archivosEditados[documentoId]) {
        formData.append("documento_pdf", archivosEditados[documentoId]);
      }

      await clienteAxios.post(`/api/documentos/${documentoId}/fechas?_method=PUT`, formData, {
        headers: { ...tokenHeader, "Content-Type": "multipart/form-data" },
      });

      toast.success("Fechas actualizadas correctamente");
      fetchVehiculos(); // refresca
      setEdicionFechas((prev) => {
        const nuevo = { ...prev };
        delete nuevo[documentoId];
        return nuevo;
      });
      setArchivosEditados((prev) => {
        const nuevo = { ...prev };
        delete nuevo[documentoId];
        return nuevo;
      });
    } catch (e) {
      console.error("Error al actualizar fechas", e);
      toast.error("No se pudieron guardar las fechas");
    }
  }, [edicionFechas, archivosEditados, tokenHeader, fetchVehiculos]);

  const actualizarPagina = useCallback((vehiculoId, seccion, nuevaPagina) => {
    setPaginasInternas((prev) => ({
      ...prev,
      [vehiculoId]: { ...prev[vehiculoId], [seccion]: nuevaPagina },
    }));
  }, []);

  const actualizarFecha = useCallback((vehiculoId, seccion, nuevaFecha) => {
    setFechasInternas((prev) => ({
      ...prev,
      [vehiculoId]: { ...prev[vehiculoId], [seccion]: nuevaFecha },
    }));
  }, []);

  const obtenerPagina = useCallback((id, seccion) => paginasInternas[id]?.[seccion] || 1, [paginasInternas]);
  const obtenerFecha  = useCallback((id, seccion) => fechasInternas[id]?.[seccion] || "", [fechasInternas]);

  const filtrarYPaginar = useCallback((items = [], fecha, pagina, porPagina = 3) => {
    const filtrado = fecha
      ? items.filter(
          (i) =>
            i.fecha_programada === fecha ||
            i.fecha_vencimiento === fecha ||
            i.fecha === fecha
        )
      : items;
    const inicio = (pagina - 1) * porPagina;
    return filtrado.slice(inicio, inicio + porPagina);
  }, []);

  // Helpers de documentos (para el siguiente paso de “linkear/mostrar urgentes”)
  const diasHasta = useCallback((fecha) => {
    if (!fecha) return Infinity;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const f = new Date(fecha); f.setHours(0,0,0,0);
    return Math.ceil((f - hoy) / (1000*60*60*24));
  }, []);

  const estadoDoc = useCallback((fechaVenc) => {
    const d = diasHasta(fechaVenc);
    if (d < 0) return "VENCIDO";
    if (d <= 30) return "POR_VENCER";
    return "VIGENTE";
  }, [diasHasta]);

  const resumenDocumentos = useCallback((vehiculo) => {
    const docs = vehiculo?.documentos || [];
    let vencidos = 0, porVencer = 0, vigentes = 0;
    let masUrgente = null;
    for (const d of docs) {
      const est = estadoDoc(d.fecha_vencimiento);
      if (est === "VENCIDO") vencidos++;
      else if (est === "POR_VENCER") porVencer++;
      else vigentes++;

      const dias = diasHasta(d.fecha_vencimiento);
      if ((est === "VENCIDO" || est === "POR_VENCER") &&
          (!masUrgente || dias < masUrgente.dias)) {
        masUrgente = { tipo: d.tipo_documento, fecha: d.fecha_vencimiento, dias };
      }
    }
    return { vencidos, porVencer, vigentes, masUrgente };
  }, [estadoDoc, diasHasta]);

  // Lightbox
  const abrirLightbox = useCallback((slides) => {
    setGaleria(slides);
    setOpenLightbox(true);
  }, []);
  const cerrarLightbox = useCallback(() => {
    setOpenLightbox(false);
    setGaleria([]);
  }, []);

  // Eliminar
  const eliminarVehiculo = useCallback(async (id) => {
    const resultado = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!resultado.isConfirmed) return;

    try {
      await clienteAxios.delete(`/api/vehiculos/${id}`, { headers: tokenHeader });
      await Swal.fire("¡Eliminado!", "El vehículo fue eliminado correctamente.", "success");
      fetchVehiculos();
    } catch (e) {
      console.error("Error al eliminar el vehículo:", e);
      Swal.fire("Error", "Hubo un problema al intentar eliminar el vehículo.", "error");
    }
  }, [tokenHeader, fetchVehiculos]);


  const eliminarRegistro = useCallback(async (registroId, tipoSeccion) => {
    const confirmResult = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmResult.isConfirmed) return;

    try {
      const endpoints = {
        mantenimientos: `/api/mantenimientos/${registroId}`,
        documentos: `/api/documentos-vehiculos/${registroId}`,
        inspecciones: `/api/inspecciones/${registroId}`
      };
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoints[tipoSeccion]}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...tokenHeader
        }
      });
      if (!response.ok) throw new Error('Error al eliminar el registro');
      await Swal.fire("¡Eliminado!", "El registro fue eliminado correctamente.", "success");
      fetchVehiculos();
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      Swal.fire("Error", "Hubo un problema al intentar eliminar el registro.", "error");
    }
  }, [tokenHeader, fetchVehiculos]);
  // dentro del hook useListarVehiculos
const toYMD = (d) => (d ? String(d).slice(0, 10) : "");

const getFechaEdit = (doc, campo) =>
  edicionFechas[doc.id]?.[campo] ?? toYMD(doc[campo]) ?? "";


  return {
    // datos
    vehiculos, loading, search, page,
    // setters
    setSearch, setPage,
    // UI state
    expanded, toggleExpand,
    fotosPorVehiculo, cargarFotosVehiculo,
    openLightbox, galeria, abrirLightbox, cerrarLightbox,
    paginasInternas, fechasInternas, edicionFechas, archivosEditados,
    actualizarPagina, actualizarFecha,
    manejarCambioArchivo, manejarCambioFecha, guardarFechasDocumento,
    obtenerPagina, obtenerFecha, filtrarYPaginar,
    eliminarVehiculo,
    // util docs (para el siguiente paso de links/urgentes)
    diasHasta, estadoDoc, resumenDocumentos,eliminarRegistro,getFechaEdit,
  };
}
