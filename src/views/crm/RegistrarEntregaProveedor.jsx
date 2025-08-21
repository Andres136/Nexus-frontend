import { useParams, useNavigate } from "react-router-dom";
import { useRef, useEffect, useState, useCallback } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import Select from "react-select";
import Swal from "sweetalert2";
import { useEntregasProveedores } from "../../hooks/useEntregasProveedores";
// Util: convierte a "YYYY-MM-DDTHH:MM" local
function toDatetimeLocal(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}


export default function RegistrarEntregaProveedor({ modo = "crear" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const {proveedoresAll, procesos}=useEntregasProveedores();
 

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


  const obtenerEstadoVisual = useCallback((detalle) => {
    const entregada = Number(detalle.cantidad_entregada) || 0;
    const solicitada = Number(detalle.cantidad_solicitada) || 0;
    if (entregada === 0) return { texto: "Pendiente", color: "bg-red-500" };
    if (entregada < solicitada) return { texto: "Parcial", color: "bg-yellow-400" };
    if (entregada === solicitada) return { texto: "Completo", color: "bg-green-500" };
    if (entregada > solicitada) return { texto: "Extra", color: "bg-purple-500" };
    return { texto: "—", color: "bg-gray-400" };
  }, []);

  // Cargar proveedores con cancelación
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

  // Cargar detalles con cancelación
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
          console.log("Detalle recibido:", det);
          const ultima = det.entregas?.at(-1) ?? null;
          return {
            ...det,
            cantidad_entregada_input: "",
            observaciones_input: ultima?.observaciones ?? "",
            fecha_ultima: ultima?.fecha_entrega ?? null,
            entrega_id_ultima: ultima?.id ?? null,
            proveedor_id: det.proveedor_id ?? null,
            proceso_bolsas_id: det.proceso_bolsas_id ?? null,

      
          };
        });

        setDetalles(productos);

        // Solo campos comparables
        detallesOriginal.current = productos.map((d) => ({
          id: d.id,
          descripcion: d.descripcion,
          cantidad_solicitada: d.cantidad_solicitada,
          proveedor_id: d.proveedor_id ?? null,
          proceso_bolsas_id: d.proceso_bolsas_id ?? null,
        }));

        // Fechas iniciales para inputs
        const fechasIniciales = {};
        productos.forEach((d, idx) => {
          fechasIniciales[idx] = toDatetimeLocal(d.fecha_ultima);
        });
        setFechasEntrega(fechasIniciales);

        // Proveedor original y preselección
        setProveedorOriginal(data.proveedor_id ?? null);
        setProveedorPreSeleccionado(
          data.proveedor_id ? { value: data.proveedor_id, label: data.proveedor } : null
        );

        setOrden({
          proveedor_id: data.proveedor_id ?? null,
          numero_orden: data.numero_orden,
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

  // Preseleccionar proveedor cuando lleguen ambos
  useEffect(() => {
    if (proveedorPreSeleccionado && proveedores.length) {
      const actual = proveedores.find((p) => p.value === proveedorPreSeleccionado.value);
      setProveedorSeleccionado(actual ?? null);
    }
  }, [proveedorPreSeleccionado, proveedores]);

  const handleFechaChange = useCallback((index, value) => {
    setFechasEntrega((prev) => ({ ...prev, [index]: value }));
  }, []);

  const handleCantidadChange = useCallback((idx, value) => {
    setDetalles((prev) => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], cantidad_entregada_input: value };
      if (modo === "crear") {
        // fuerza POST en crear
        copia[idx].entrega_id_ultima = null;
      }
      return copia;
    });
  }, [modo]);

  const agregarItem = useCallback(() => {
    const nuevoItem = {
      id: null,
      item: (detalles?.length || 0) + 1,
      descripcion: "",
      cantidad_solicitada: 0,
      cantidad_entregada: 0,
      cantidad_entregada_input: "",
      observaciones_input: "",
      proveedor_id: null,
      proceso_bolsas_id: null,
      entrega_id: null,
      entregas: [],
      updated_at: null,
      fecha_ultima: null,
      entrega_id_ultima: null,
    };
    setDetalles((prev) => [...prev, nuevoItem]);
  }, [detalles?.length]);

  const handleSubmit = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      console.log("Detalles antes de enviar:", detalles);
      const token = localStorage.getItem("token");
      const nuevosErrores = {};

      // Construcción de entregas a enviar
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
   

            
          };
        })
        .filter(Boolean);
        console.log("Entregas enviadas:", entregas)


      if (Object.keys(nuevosErrores).length > 0) {
        setErroresFecha(nuevosErrores);
        toast.error("Completa las fechas de las nuevas entregas.");
        setIsSaving(false); // ← importante: liberar el botón
        return;
      }

      setErroresFecha({});

      // 1) Actualizar proveedor solo si hay cambio y NO se limpió
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

      // 2) Crear/actualizar detalles de orden
      //   - POST si no tiene id
      //   - PUT si cambió descripción o cantidad_solicitada
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
// ✅ CORREGIR: Normalizar valores antes de comparar
// Convertir a números o null antes de comparar
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

      // 3) Crear/actualizar entregas (PUT si viene id; POST en caso contrario)
      for (const entrega of entregas) {
        await clienteAxios({
          method: entrega.id ? "put" : "post",
          url: entrega.id ? `/api/entregas-proveedor/${entrega.id}` : "/api/entregas-proveedor",
          data: entrega,
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success("Entrega registrada correctamente");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar entrega");
      setIsSaving(false); // aseguramos liberación incluso con error
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
  ]);

  const eliminarItem = useCallback(
    async (index, detalleId) => {
      const resultado = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará el ítem seleccionado.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e3342f",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!resultado.isConfirmed) return;

      if (!detalleId) {
        setDetalles((prev) => prev.filter((_, i) => i !== index));
        Swal.fire("Eliminado", "Ítem eliminado del formulario.", "success");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        await clienteAxios.delete(`/api/detalles-orden/${detalleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDetalles((prev) => prev.filter((_, i) => i !== index));
        Swal.fire("Eliminado", "Ítem eliminado correctamente.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo eliminar el ítem.", "error");
      }
    },
    []
  );
if (loading) return (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
  </div>
);
  return (
    <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header mejorado */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {modo === "editar" ? "Actualizar Entrega" : "Registrar Entrega"}
              </h1>
              <p className="text-gray-600 mt-1">Gestiona las entregas de proveedores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card de información de orden */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🏢 Proveedor Principal
            </label>
            <Select
              options={proveedores}
              value={proveedorSeleccionado}
              onChange={(selected) => {
                setProveedorSeleccionado(selected ?? null);
                setOrden((prev) => ({ ...prev, proveedor_id: selected?.value ?? null }));
              }}
              placeholder="Seleccione un proveedor"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderColor: '#d1d5db',
                  borderRadius: '0.75rem',
                  padding: '0.25rem',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#9ca3af'
                  },
                  '&:focus-within': {
                    borderColor: '#10b981',
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                  }
                })
              }}
            />
          </div>
          
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 w-full">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Orden de Compra</p>
                  <p className="text-xl font-bold text-gray-900">{orden.numero_orden}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón agregar item mejorado */}
      <div className="mb-6">
        <button
          onClick={agregarItem}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Nuevo Ítem
        </button>
      </div>

      {/* Tabla mejorada con scroll horizontal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  { label: "#", icon: "🏷️" },
                  { label: "Descripción", icon: "📝" },
                  { label: "Solicitada", icon: "📋" },
                  { label: "Entregada", icon: "📦" },
                  { label: "Faltantes", icon: "⚠️" },
                  { label: "Estado", icon: "🔄" },
                  { label: "Proveedor", icon: "🏢" },
                  { label: "Proceso", icon: "⚙️" },
                  { label: "Última Entrega", icon: "🕐" },
                  { label: "Historial", icon: "📊" },
                  { label: "Nueva Entrega", icon: "➕" },
                  { label: "Observaciones", icon: "💬" },
                  { label: "Acciones", icon: "🔧" }
                ].map((col, idx) => (
                  <th key={idx} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <span>{col.icon}</span>
                      <span>{col.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detalles.map((detalle, index) => {
                const key = detalle.id ?? `tmp-${index}`;
                const ultima = detalle.entregas?.at(-1) ?? null;
                const estado = obtenerEstadoVisual(detalle);
                
                return (
                  <tr key={key} className="hover:bg-gray-50 transition-colors">
                    {/* Número de ítem */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold text-blue-600">{detalle.item}</span>
                      </div>
                    </td>

                    {/* Descripción */}
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={detalle.descripcion}
                        onChange={(e) => {
                          const nuevos = [...detalles];
                          nuevos[index] = { ...nuevos[index], descripcion: e.target.value };
                          setDetalles(nuevos);
                        }}
                        className="w-full min-w-48 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="Descripción del ítem..."
                      />
                    </td>

                    {/* Cantidad solicitada */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          lang="es-CO"
                          value={detalle.cantidad_solicitada}
                          onChange={(e) => {
                            const nuevos = [...detalles];
                            nuevos[index] = {
                              ...nuevos[index],
                              cantidad_solicitada: parseFloat(e.target.value) || 0,
                            };
                            setDetalles(nuevos);
                          }}
                          className="w-24 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <span className="absolute right-2 top-2 text-xs text-gray-400">kg</span>
                      </div>
                    </td>

                    {/* Cantidad entregada */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-lg px-3 py-1">
                          <span className="text-sm font-semibold text-green-800">
                            {detalle.cantidad_entregada} kg
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Faltantes */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-orange-100 rounded-lg px-3 py-1">
                          <span className="text-sm font-semibold text-orange-800">
                            {Number(detalle.cantidad_solicitada) - Number(detalle.cantidad_entregada)} kg
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estado.color} text-white shadow-sm`}>
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        {estado.texto}
                      </span>
                    </td>

                {/* Proveedor del ítem - BLOQUEADO SI ESTÁ COMPLETO */}
                    <td className="px-6 py-4">
                      {detalle.cantidad_entregada >= detalle.cantidad_solicitada ? (
                        // ✅ MODO CERRADO - Solo lectura
                        <div className="relative min-w-48">
                          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-600 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">
                              {detalle.proveedor_id ? 
                                proveedoresAll.find(p => p.id === detalle.proveedor_id)?.nombre || 'Proveedor definido' 
                                : 'Sin proveedor asignado'
                              }
                            </span>
                          </div>
                          <div className="absolute top-0 right-0 -mr-2 -mt-2">
                            <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                              ✓
                            </div>
                          </div>
                          <div className="text-xs text-green-600 mt-1 font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Campo cerrado - Entrega completada
                          </div>
                        </div>
                      ) : (
                        // ✅ MODO EDITABLE - Select normal
                        <div className="min-w-48">
                          <Select
                            options={proveedoresAll.map((p) => ({ value: p.id, label: p.nombre }))}
                            value={proveedoresAll.find((p) => p.id === detalle.proveedor_id) ? { value: detalle.proveedor_id, label: proveedoresAll.find((p) => p.id === detalle.proveedor_id).nombre } : null}
                            onChange={(selected) => {
                              const nuevos = [...detalles];
                              nuevos[index] = {
                                ...nuevos[index],
                                proveedor_id: selected?.value ?? null,
                              };
                              setDetalles(nuevos);
                            }}
                            placeholder="Seleccionar proveedor..."
                            isClearable
                            className="min-w-48"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                borderColor: '#d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem'
                              })
                            }}
                          />
                          <div className="text-xs text-amber-600 mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pendiente - Puedes modificar
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Proceso - BLOQUEADO SI ESTÁ COMPLETO */}
                    <td className="px-6 py-4">
                      {detalle.cantidad_entregada >= detalle.cantidad_solicitada ? (
                        // ✅ MODO CERRADO - Solo lectura
                        <div className="relative min-w-44">
                          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-600 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">
                              {detalle.proceso_bolsas_id ? 
                                procesos.find(p => p.id === detalle.proceso_bolsas_id)?.nombre || 'Proceso definido' 
                                : 'Sin proceso asignado'
                              }
                            </span>
                          </div>
                          <div className="absolute top-0 right-0 -mr-2 -mt-2">
                            <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                              ✓
                            </div>
                          </div>
                          <div className="text-xs text-green-600 mt-1 font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Proceso finalizado - Campo cerrado
                          </div>
                        </div>
                      ) : (
                        // ✅ MODO EDITABLE - Select normal
                        <div className="min-w-44">
                          <Select
                            options={procesos.map((p) => ({ value: p.id, label: p.nombre }))}
                            value={procesos.find((p) => p.id === detalle.proceso_bolsas_id) ? { value: detalle.proceso_bolsas_id, label: procesos.find((p) => p.id === detalle.proceso_bolsas_id).nombre } : null}
                            onChange={(selected) => {
                              const nuevos = [...detalles];
                              nuevos[index] = {
                                ...nuevos[index],
                                proceso_bolsas_id: selected?.value ?? null,
                              };
                              setDetalles(nuevos);
                            }}
                            placeholder="Seleccionar proceso..."
                            isClearable
                            className="min-w-44"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                borderColor: '#d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem'
                              })
                            }}
                          />
                          <div className="text-xs text-orange-600 mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-5 5l-7-7" />
                            </svg>
                            En proceso - Puedes modificar
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Última Entrega */}
                    <td className="px-6 py-4">
                      {ultima ? (
                        <div className="bg-blue-50 rounded-lg p-3 min-w-48">
                          <div className="text-xs text-blue-600 font-medium mb-1">
                            📅 {new Date(ultima.fecha_entrega).toLocaleDateString("es-CO")}
                          </div>
                          <div className="text-sm font-bold text-blue-900">
                            📦 {ultima.cantidad_entregada} kg
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-lg p-3 text-center min-w-48">
                          <div className="text-2xl text-gray-400 mb-1">📭</div>
                          <div className="text-xs text-gray-500">Sin entregas</div>
                        </div>
                      )}
                    </td>

                    {/* Historial mejorado */}
                    <td className="px-6 py-4">
                      {detalle.entregas?.length > 0 ? (
                        <div className="min-w-80 max-w-96">
                          {/* Resumen */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-blue-800">📦 Total entregas</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                                {detalle.entregas.length}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-blue-800">🏭 Peso total</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                {detalle.cantidad_entregada} kg
                              </span>
                            </div>
                          </div>

                          {/* Lista de entregas */}
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {detalle.entregas.slice().reverse().map((entrega, idx) => (
                              <div 
                                key={entrega.id || idx} 
                                className={`rounded-lg p-3 border-l-4 shadow-sm ${
                                  idx === 0 ? 'border-l-green-500 bg-green-50' : 'border-l-blue-400 bg-white'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    idx === 0 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {idx === 0 ? '🆕 Reciente' : `#${detalle.entregas.length - idx}`}
                                  </span>
                                  <div className="text-right">
                                    <div className="font-bold text-lg text-gray-900">
                                      {entrega.cantidad_entregada} kg
                                    </div>
                                  </div>
                                </div>

                                <div className="text-xs text-gray-600 space-y-1">
                                  <div className="flex items-center">
                                    <span className="mr-2">📅</span>
                                    {new Date(entrega.fecha_entrega).toLocaleDateString("es-CO", {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })} - {new Date(entrega.fecha_entrega).toLocaleTimeString("es-CO", {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  
                                  {entrega.observaciones && (
                                    <div className="flex items-start">
                                      <span className="mr-2">💬</span>
                                      <span className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 italic text-gray-700">
                                        "{entrega.observaciones}"
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-lg p-4 text-center min-w-64">
                          <div className="text-gray-400 text-3xl mb-2">📭</div>
                          <div className="text-gray-500 text-sm font-medium mb-1">Sin entregas registradas</div>
                          <div className="text-xs text-gray-400">Registra la primera entrega</div>
                        </div>
                      )}
                    </td>

                    {/* Nueva Entrega */}
                    <td className="px-6 py-4">
                      <div className="bg-green-50 rounded-lg p-4 min-w-52">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad (kg)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              value={detalle.cantidad_entregada_input || ""}
                              onChange={(e) => handleCantidadChange(index, e.target.value)}
                              className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha y hora</label>
                            <input
                              type="datetime-local"
                              value={fechasEntrega[index] || ""}
                              onChange={(e) => handleFechaChange(index, e.target.value)}
                              className={`w-full rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 ${
                                erroresFecha[index] ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-green-500"
                              }`}
                            />
                            {erroresFecha[index] && (
                              <p className="text-red-500 text-xs mt-1 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {erroresFecha[index]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Observaciones */}
                    <td className="px-6 py-4">
                      <textarea
                        value={detalle.observaciones_input || ""}
                        onChange={(e) => {
                          const nuevos = [...detalles];
                          nuevos[index] = {
                            ...nuevos[index],
                            observaciones_input: e.target.value,
                          };
                          setDetalles(nuevos);
                        }}
                        rows={3}
                        className="min-w-48 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                        placeholder="Observaciones adicionales..."
                      />
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => eliminarItem(index, detalle.id)}
                        className="flex items-center justify-center w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        title="Eliminar ítem"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón de guardar mejorado */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className={`flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            isSaving 
              ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          }`}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Guardando...
            </>
          ) : (
            <>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {modo === "editar" ? "Actualizar Entrega" : "Registrar Entrega"}
            </>
          )}
        </button>
      </div>
    </div>
  </div>
  );
}
