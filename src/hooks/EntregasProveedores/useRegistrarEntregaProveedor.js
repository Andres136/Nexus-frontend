// hooks/useRegistrarEntregaProveedor.js
import { useParams, useNavigate } from "react-router-dom";
import { useRef, useEffect, useState, useCallback } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useAuth } from "../useAuth";
import { useSedes } from "../useSedes";
import { useEntregasProveedores } from "../useEntregasProveedores"; 
import Swal from "sweetalert2";
import { ordenesCompraProveedoresApi } from "../../services/api";
import { showToast } from "../../helpers/utils/showToast";

// Util: convierte a "YYYY-MM-DD" local
function toDatetimeLocal(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function useRegistrarEntregaProveedor(modo = "crear") {
  const { user } = useAuth({ middleware: 'auth' });
  const { bodegas } = useSedes();
  const { id } = useParams();
  const navigate = useNavigate();
  const { proveedoresAll, procesos } = useEntregasProveedores();

  // Estados
  const detallesOriginal = useRef([]);
  const [orden, setOrden] = useState({});
  const [proveedorOriginal, setProveedorOriginal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroresFecha, setErroresFecha] = useState({});
  const [fechasEntrega, setFechasEntrega] = useState({});
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedorPreSeleccionado, setProveedorPreSeleccionado] = useState(null);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState("");
  const [errorBodega, setErrorBodega] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historialEntregas, setHistorialEntregas] = useState([]);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [observacionModalAbierta, setObservacionModalAbierta] = useState(false);

  // Función para obtener estado visual
  const obtenerEstadoVisual = useCallback((detalle) => {
    const entregada = Number(detalle.cantidad_entregada_sede) || 0;
    const solicitada = Number(detalle.cantidad_solicitada) || 0;
    if (entregada === 0) return { texto: "Pendiente", color: "bg-red-500" };
    if (entregada < solicitada) return { texto: "Parcial", color: "bg-yellow-400" };
    if (entregada === solicitada) return { texto: "Completo", color: "bg-green-500" };
    if (entregada > solicitada) return { texto: "Extra", color: "bg-purple-500" };
    return { texto: "—", color: "bg-gray-400" };
  }, []);

  // Cargar proveedores
  useEffect(() => {
    const ac = new AbortController();
    const fetchProveedores = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await clienteAxios.get("/api/proveedores-all", {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });
        const opciones = res.data.proveedores.map((p) => ({
          value: p.id,
          label: p.nombre,
        }));
        setProveedores(opciones);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          toast.error("Error al cargar proveedores");
        }
      }
    };
    fetchProveedores();
    return () => ac.abort();
  }, []);

  // Cargar detalles
  useEffect(() => {
    const ac = new AbortController();
    const fetchDetalles = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const { data } = await clienteAxios.get(
          `/api/ordenes-compra-proveedor/${id}`,
          { headers: { Authorization: `Bearer ${token}` }, signal: ac.signal }
        );

        const productos = data.productos.map((det) => {
          const ultima = det.entregas?.at(-1) ?? null;
          return {
            ...det,
            cantidad_entregada_input: "",
            observaciones_input: ultima?.observaciones ?? "",
            fecha_ultima: ultima?.fecha_entrega ? ultima.fecha_entrega.split(" ")[0] : null,
            entrega_id_ultima: ultima?.id ?? null,
            proveedor_id: det.proveedor_id ?? null,
            proveedor: det.proveedor_nombre ?? null,
            proceso_bolsas_id: det.proceso_bolsas_id ?? null,
            producto_id: det.producto_id ?? null,
            cantidad_entregada: det.cantidad_entregada ?? 0,
            cantidad_entregada_sede: det.cantidad_entregada_sede ?? 0,
            cantidad_solicitada: det.cantidad_solicitada ?? 0,
          };
        });

        setDetalles(productos);

        detallesOriginal.current = productos.map((d) => ({
          id: d.id,
          descripcion: d.descripcion,
          cantidad_solicitada: d.cantidad_solicitada,
          proveedor_id: d.proveedor_id ?? null,
          proceso_bolsas_id: d.proceso_bolsas_id ?? null,
        }));

        const fechasIniciales = {};
        productos.forEach((d, idx) => {
          fechasIniciales[idx] = toDatetimeLocal(d.fecha_ultima);
        });
        setFechasEntrega(fechasIniciales);

        setProveedorOriginal(data.proveedor_id ?? null);
        setProveedorPreSeleccionado(
          data.proveedor_id ? { value: data.proveedor_id, label: data.proveedor } : null
        );

        setOrden({
          id: data.id,
          proveedor_id: data.proveedor_id ?? null,
          numero_orden: data.numero_orden,
          proveedor_nombre: data.proveedor_nombre ?? null,
          empresa: data.empresa ?? null,
          observaciones: data.observaciones || "",
        });
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          toast.error("Error al cargar la orden");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetalles();
    return () => ac.abort();
  }, [id, modo]);

  // Preseleccionar proveedor
  useEffect(() => {
    if (proveedorPreSeleccionado && proveedores.length) {
      const actual = proveedores.find((p) => p.value === proveedorPreSeleccionado.value);
      setProveedorSeleccionado(actual ?? null);
    }
  }, [proveedorPreSeleccionado, proveedores]);

  // Handlers
  const handleFechaChange = useCallback((index, value) => {
    setFechasEntrega((prev) => ({ ...prev, [index]: value }));
  }, []);

  const handleCantidadChange = useCallback((idx, value) => {
    setDetalles((prev) => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], cantidad_entregada_input: value };
      if (modo === "crear") {
        copia[idx].entrega_id_ultima = null;
      }
      return copia;
    });
  }, [modo]);

  const abrirHistorial = (entregas, detalleId) => {
    const entregasConDetalle = entregas.map(e => ({
      ...e,
      detalle_id: detalleId,
      producto_id: e.producto_id,
    }));
    setHistorialEntregas(entregasConDetalle);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setHistorialEntregas([]);
  };

  const handleSubmit = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    setErrorBodega(null);

    try {
      const token = localStorage.getItem("token");
      const nuevosErrores = {};

      const entregas = detalles
        .map((d, i) => {
          const cant = parseFloat(d.cantidad_entregada_input);
          const fecha = fechasEntrega[i];

          if (!Number.isFinite(cant) || cant <= 0) return null;

          if (!fecha) {
            nuevosErrores[i] = "La fecha es obligatoria";
            return null;
          }

          return {
            id: modo === "editar" ? d.entrega_id_ultima ?? undefined : undefined,
            detalle_id: d.id,
            cantidad_entregada: cant,
            fecha_entrega: fecha,
            observaciones: d.observaciones_input || "",
            proveedor_id: d.proveedor_id ?? null,
            proceso_bolsas_id: d.proceso_bolsas_id ?? null,
            producto_id: d.producto_id ?? null,
            bodega_id: bodegaSeleccionada?.value,
            empresa_id: orden.empresa?.id || null,
            sede_id: user.sede_id,
            stock: cant
          };
        })
        .filter(Boolean);

      if (Object.keys(nuevosErrores).length > 0) {
        setErroresFecha(nuevosErrores);
        toast.error("Completa las fechas de las nuevas entregas.");
        setIsSaving(false);
        return;
      }

      setErroresFecha({});

      // Actualizar proveedor
      const nuevoProveedorId = proveedorSeleccionado?.value;
      const huboCambioProveedor =
        typeof nuevoProveedorId !== "undefined" &&
        nuevoProveedorId !== null &&
        nuevoProveedorId !== proveedorOriginal;

      if (huboCambioProveedor) {
        await clienteAxios.put(
          `/api/ordenes-compra-proveedor/${id}/update-proveedor`,
          { proveedor_id: nuevoProveedorId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Actualizar detalles
      for (const d of detalles) {
        if (!d.id) {
          await clienteAxios.post(
            "/api/detalles-orden",
            {
              orden_id: id,
              descripcion: d.descripcion,
              cantidad_solicitada: d.cantidad_solicitada,
              proveedor_id: d.proveedor_id ?? null,
              proceso_bolsas_id: d.proceso_bolsas_id ?? null,
              item: d.item,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          continue;
        }

        const orig = detallesOriginal.current.find((o) => o.id === d.id);
        if (!orig) continue;

        const descCambio = d.descripcion !== orig.descripcion;
        const cantCambio = d.cantidad_solicitada !== orig.cantidad_solicitada;
        const proveedorCambio = (d.proveedor_id ? Number(d.proveedor_id) : null) !== (orig.proveedor_id ? Number(orig.proveedor_id) : null);
        const procesoBolsasCambio = (d.proceso_bolsas_id ? Number(d.proceso_bolsas_id) : null) !== (orig.proceso_bolsas_id ? Number(orig.proceso_bolsas_id) : null);

        if (descCambio || cantCambio || proveedorCambio || procesoBolsasCambio) {
          await clienteAxios.put(
            `/api/detalles-orden/${d.id}`,
            {
              descripcion: d.descripcion,
              cantidad_solicitada: d.cantidad_solicitada,
              cantidad_entregada: d.cantidad_entregada ?? 0,
              proveedor_id: d.proveedor_id ?? null,
              proceso_bolsas_id: d.proceso_bolsas_id ?? null,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      // Crear/actualizar entregas
      for (const entrega of entregas) {
     const response = await clienteAxios({
          method: entrega.id ? "put" : "post",
          url: entrega.id ? `/api/entregas-proveedor/${entrega.id}` : "/api/entregas-proveedor",
          data: {
            ...entrega,
            inventario: {
              sede_id: user.sede_id,
              bodega_id: bodegaSeleccionada?.value,
              empresa_id: orden.empresa?.id,
              producto_id: entrega.producto_id,
              stock: entrega.cantidad_entregada
            }
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("success",response.data.message);
      }

      navigate(-1);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 422) {
        setErrorBodega(error.response.data.errors.bodega_id?.[0] || null);
      }
      toast.error("Error al registrar entrega");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
  }, [
    isSaving,
    detalles,
    fechasEntrega,
    proveedorSeleccionado,
    proveedorOriginal,
    id,
    navigate,
    modo,
    bodegaSeleccionada,
    orden.empresa,
    user.sede_id
  ]);

//Eliminar un item  con swal
const eliminarItem = async (detalleId) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás deshacer esta acción",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (result.isConfirmed) {
    try {
      await ordenesCompraProveedoresApi.delete(detalleId);
      setDetalles((prevDetalles) => prevDetalles.filter((d) => d.id !== detalleId));
      Swal.fire("Eliminado", "El item ha sido eliminado", "success");
    } catch (error) {
      console.error("Error al eliminar el item:", error);
      Swal.fire("Error", "No se pudo eliminar el item", "error");
    }
  }
};

  return {
    // Estados
    loading,
    orden,
    detalles,
    setDetalles,
    fechasEntrega,
    erroresFecha,
    isSaving,
    proveedores,
    proveedorSeleccionado,
    setProveedorSeleccionado,
    bodegaSeleccionada,
    setBodegaSeleccionada,
    errorBodega,
    setErrorBodega,
    isModalOpen,
    setIsModalOpen,
    historialEntregas,
    setHistorialEntregas,
    detalleSeleccionado,
    setDetalleSeleccionado,
    observacionModalAbierta,
    setObservacionModalAbierta,

    // Datos externos
    user,
    bodegas,
    proveedoresAll,
    procesos,

    // Funciones
    obtenerEstadoVisual,
    handleFechaChange,
    handleCantidadChange,
    abrirHistorial,
    cerrarModal,
    handleSubmit,
    navigate,
    toDatetimeLocal,
    eliminarItem
  };
}