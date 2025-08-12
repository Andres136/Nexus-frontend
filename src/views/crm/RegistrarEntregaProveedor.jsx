import { useParams, useNavigate } from "react-router-dom";
import { useRef, useEffect, useState, useCallback } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import Select from "react-select";
import Swal from "sweetalert2";

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
        console.log("Proveedores cargados:", res.data.proveedores);
        const opciones = res.data.proveedores.map((p) => ({
          value: p.id,
          label: p.nombre,
        }));
        console.log("Proveedores cargados:", opciones);
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
          const ultima = det.entregas?.at(-1) ?? null;
          return {
            ...det,
            cantidad_entregada_input: "",
            observaciones_input: ultima?.observaciones ?? "",
            fecha_ultima: ultima?.fecha_entrega ?? null,
            entrega_id_ultima: ultima?.id ?? null, // usado solo si modo === "editar"
          };
        });

        setDetalles(productos);

        // Solo campos comparables
        detallesOriginal.current = productos.map((d) => ({
          id: d.id,
          descripcion: d.descripcion,
          cantidad_solicitada: d.cantidad_solicitada,
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
          };
        })
        .filter(Boolean);

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

        if (descCambio || cantCambio) {
          await clienteAxios.put(
            `/api/detalles-orden/${d.id}`,
            {
              descripcion: d.descripcion,
              cantidad_solicitada: d.cantidad_solicitada,
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

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="grid grid-cols-1">
      <div className="col-span-1">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
        >
          ← Volver
        </button>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
          <Select
            options={proveedores}
            value={proveedorSeleccionado}
            onChange={(selected) => {
              setProveedorSeleccionado(selected ?? null);
              setOrden((prev) => ({ ...prev, proveedor_id: selected?.value ?? null }));
            }}
            placeholder="Seleccione un proveedor"
            isClearable
            className="w-full md:w-1/2"
          />
        </div>

        <h3 className="text-md text-gray-700 mb-4">
          Orden de Compra: <span className="font-medium">{orden.numero_orden}</span>
        </h3>

        <button
          onClick={agregarItem}
          className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-600 text-white rounded"
        >
          + Agregar Item
        </button>

        <table className="min-w-full border mb-4">
          <thead>
            <tr>
              <th className="border px-4 py-2">Item</th>
              <th className="border px-4 py-2">Descripción</th>
              <th className="border px-4 py-2">Solicitada</th>
              <th className="border px-4 py-2">Entregada</th>
              <th className="border px-4 py-2">Faltantes</th>
              <th className="border px-4 py-2">Estado</th>
              <th className="border px-4 py-2">Última Entrega</th>
              <th className="border px-4 py-2">Historial de entregas</th>
              <th className="border px-4 py-2">Nueva Entrega</th>
              <th className="border px-4 py-2">Observaciones</th>
              <th className="border px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((detalle, index) => {
              const key = detalle.id ?? `tmp-${index}`;
              const ultima = detalle.entregas?.at(-1) ?? null;
              return (
                <tr key={key}>
                  <td className="border px-4 py-2">{detalle.item}</td>

                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={detalle.descripcion}
                      onChange={(e) => {
                        const nuevos = [...detalles];
                        nuevos[index] = { ...nuevos[index], descripcion: e.target.value };
                        setDetalles(nuevos);
                      }}
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>

                  <td className="border px-4 py-2">
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
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>

                  <td className="border px-4 py-2">{detalle.cantidad_entregada}</td>
                  <td className="border px-4 py-2">
                    {Number(detalle.cantidad_solicitada) - Number(detalle.cantidad_entregada)}
                  </td>

                  <td className="border px-4 py-2 text-white">
                    <span
                      className={`px-2 py-1 rounded text-xs ${obtenerEstadoVisual(detalle).color}`}
                    >
                      {obtenerEstadoVisual(detalle).texto}
                    </span>
                  </td>

                  {/* Última Entrega (fecha y cantidad si aplica) */}
                  <td className="border px-4 py-2">
                    {ultima ? (
                      <span className="text-sm">
                        {new Date(ultima.fecha_entrega).toLocaleString("es-CO")} —{" "}
                        <strong>{ultima.cantidad_entregada} kg</strong>
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Sin entregas</span>
                    )}
                  </td>

                  {/* Historial */}
                  <td className="border px-4 py-2 text-sm text-gray-700">
                    {detalle.entregas?.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-1">
                        {detalle.entregas.map((e) => (
                          <li key={e.id}>
                            {new Date(e.fecha_entrega).toLocaleString("es-CO")} —{" "}
                            <strong>{e.cantidad_entregada} kg</strong>
                            {e.observaciones ? ` — ${e.observaciones}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 italic">Sin entregas</span>
                    )}
                  </td>

                  {/* Nueva Entrega */}
                  <td className="border px-4 py-2">
                    <div className="flex flex-col gap-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={detalle.cantidad_entregada_input || ""}
                        onChange={(e) => handleCantidadChange(index, e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Cantidad"
                      />
                      <input
                        type="datetime-local"
                        value={fechasEntrega[index] || ""}
                        onChange={(e) => handleFechaChange(index, e.target.value)}
                        className={`border px-2 py-1 w-full rounded ${
                          erroresFecha[index] ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Fecha de entrega"
                      />
                      {erroresFecha[index] && (
                        <p className="text-red-500 text-xs mt-1">{erroresFecha[index]}</p>
                      )}
                    </div>
                  </td>

                  {/* Observaciones */}
                  <td className="border px-4 py-2">
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
                      rows={2}
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="Observaciones..."
                    />
                  </td>

                  {/* Acción */}
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => eliminarItem(index, detalle.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className={`px-4 py-2 rounded text-white ${
            isSaving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSaving ? "Guardando…" : modo === "editar" ? "Actualizar Entrega" : "Registrar Entrega"}
        </button>
      </div>
    </div>
  );
}
