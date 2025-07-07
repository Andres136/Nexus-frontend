import { useParams, useNavigate } from "react-router-dom";
import  { useRef, useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import Select from "react-select";
import Swal from "sweetalert2";
// Convierte cualquier fecha (string) a "YYYY-MM-DDTHH:MM" en tu zona horaria




export default function RegistrarEntregaProveedor({ modo = "crear" }) {
function toDatetimeLocal(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
           .toISOString()
           .slice(0, 16);
}

  
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

  const obtenerEstadoVisual = (detalle) => {
    const entregada = detalle.cantidad_entregada;
    const solicitada = detalle.cantidad_solicitada;
    if (entregada === 0) return { texto: "Pendiente", color: "bg-red-500" };
    if (entregada < solicitada) return { texto: "Parcial", color: "bg-yellow-400" };
    if (entregada === solicitada) return { texto: "Completo", color: "bg-green-500" };
    if (entregada > solicitada) return { texto: "Extra", color: "bg-purple-500" };
  };

  useEffect(() => { fetchProveedores(); }, []);
  useEffect(() => { fetchDetalles(); }, [id, modo]);

  const fetchProveedores = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await clienteAxios.get("/api/proveedores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const opciones = res.data.proveedores.data.map((p) => ({ value: p.id, label: p.nombre }));
      setProveedores(opciones);
    } catch (err) {
      toast.error("Error al cargar proveedores");
    }
  };
  const fetchDetalles = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const { data } = await clienteAxios.get(
        `/api/ordenes-compra-proveedor/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      /* 1.  Construimos el arreglo de detalles */
const productos = data.productos.map(det => {
  const ultima = det.entregas?.at(-1) ?? null;
  return {
    ...det,
    // para la UI
    cantidad_entregada_input: "",
    observaciones_input: ultima?.observaciones ?? "", // ← aquí
    fecha_ultima: ultima?.fecha_entrega ?? null,
    // para la lógica:
    entrega_id_ultima: ultima?.id ?? null,   // ← NO se usa si modo==="crear"

  };
});

  
      setDetalles(productos);

        // ⬇️ guarda solo los campos que compararás
  detallesOriginal.current = productos.map((d) => ({
    id: d.id,
    descripcion: d.descripcion,
    cantidad_solicitada: d.cantidad_solicitada,
  }));
  
      /* 2.  Generamos fechas iniciales para los <input type="datetime-local"> */
      const fechasIniciales = {};
      productos.forEach((d, idx) => {
        fechasIniciales[idx] = toDatetimeLocal(d.fecha_ultima); // "" si no existe
      });
      setFechasEntrega(fechasIniciales);
  
      /* 3.  Proveedor: guardamos original y pre-seleccionamos en el <Select> */
      setProveedorOriginal(data.proveedor_id ?? null);
      setProveedorPreSeleccionado(
        data.proveedor_id ? { value: data.proveedor_id, label: data.proveedor } : null
      );
  
      /* 4.  Info básica de la orden */
      setOrden({
        proveedor_id: data.proveedor_id ?? null,
        numero_orden: data.numero_orden,
      });
    } catch (err) {
      toast.error("Error al cargar la orden");
    } finally {
      setLoading(false);
    }
  };
  
useEffect(() => {
  if (proveedorPreSeleccionado && proveedores.length) {
    const actual = proveedores.find(
      (p) => p.value === proveedorPreSeleccionado.value
    );
    setProveedorSeleccionado(actual ?? null);
  }
}, [proveedorPreSeleccionado, proveedores]);



  const handleFechaChange = (index, value) => {
    setFechasEntrega((prev) => ({ ...prev, [index]: value }));
  };

const handleChange = (idx, value) => {
  setDetalles(prev => {
    const copia = [...prev];
    copia[idx].cantidad_entregada_input = value;

    if (modo === "crear") {
      // siempre fuerza POST
      copia[idx].entrega_id_ultima = null;
    }
    // en "editar" NO se toca, así PUT usará ese id
    return copia;
  });
};



  const agregarItem = () => {
    const nuevoItem = {
      id: null,
      item: detalles.length + 1,
      descripcion: "",
      cantidad_solicitada: 0,
      cantidad_entregada: 0,
      cantidad_entregada_input: "",
      observaciones_input: "",
      entrega_id: null,
      entregas: [],
    };
    setDetalles((prev) => [...prev, nuevoItem]);
  };

  const handleSubmit = async () => {
  if (isSaving) return;
    const token = localStorage.getItem("token");
    const nuevosErrores = {};
    setIsSaving(true);

const entregas = detalles
  .map((d, i) => {
    const cant  = parseFloat(d.cantidad_entregada_input);
    const fecha = fechasEntrega[i];
  if (!Number.isFinite(cant) || cant <= 0) return null;
    if (!fecha) {
      nuevosErrores[i] = "La fecha es obligatoria";
      return null;
    }

    return {
      id:   modo === "editar" ? d.entrega_id_ultima : undefined, // ← clave
      detalle_id: d.id,
      cantidad_entregada: cant,
      fecha_entrega:      fecha,
      observaciones:      d.observaciones_input || "",
    };
  })
  .filter(Boolean);


  
    if (Object.keys(nuevosErrores).length > 0) {
      setErroresFecha(nuevosErrores);
      toast.error("Completa las fechas");
      return;
    }
  
    setErroresFecha({});
    try {
   
// 2. Comparación estricta en el submit
const proveedorId = Number(proveedorSeleccionado?.value ?? 0);
if (proveedorId !== proveedorOriginal) {
  await clienteAxios.put(`/api/ordenes-compra-proveedor/${id}/update-proveedor`,
    { proveedor_id: proveedorId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

  
// 3. PUT solo si cambió algo
for (const d of detalles) {
  // si es nuevo -> POST
  if (!d.id) {
    await clienteAxios.post("/api/detalles-orden", {
      orden_id: id,
      descripcion: d.descripcion,
      cantidad_solicitada: d.cantidad_solicitada,
      item: d.item,
    }, { headers: { Authorization: `Bearer ${token}` } });
    continue;
  }

  // buscar el original
  const orig = detallesOriginal.current.find((o) => o.id === d.id);
  if (!orig) continue;                       // seguridad extra

  const descCambio = d.descripcion !== orig.descripcion;
  const cantCambio = d.cantidad_solicitada !== orig.cantidad_solicitada;

  if (descCambio || cantCambio) {
    await clienteAxios.put(`/api/detalles-orden/${d.id}`, {
      descripcion: d.descripcion,
      cantidad_solicitada: d.cantidad_solicitada,
    }, { headers: { Authorization: `Bearer ${token}` } });
  }
}

  for (const entrega of entregas) {
  await clienteAxios({
    method: entrega.id ? "put" : "post",
    url:    entrega.id
            ? `/api/entregas-proveedor/${entrega.id}`
            : "/api/entregas-proveedor",
    data:   entrega,
    headers:{ Authorization: `Bearer ${token}` },
  });
}

  
      toast.success("Entrega registrada correctamente");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar entrega");
    } finally {
      setIsSaving(false);
    }
    
  };
const eliminarItem = async (index, id) => {
  const resultado = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el ítem seleccionado.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e3342f',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (!resultado.isConfirmed) return;

  // Si no tiene ID => solo borrar en frontend
  if (!id) {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
    Swal.fire('Eliminado', 'Ítem eliminado del formulario.', 'success');
    return;
  }

  // Si tiene ID => eliminar en backend
  try {
    const token = localStorage.getItem('token');
    await clienteAxios.delete(`/api/detalles-orden/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setDetalles((prev) => prev.filter((_, i) => i !== index));
    Swal.fire('Eliminado', 'Ítem eliminado correctamente.', 'success');
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'No se pudo eliminar el ítem.', 'error');
  }
};


  if (loading) return <p>Cargando...</p>;

  return (
    <div className="grid grid-cols-1">

      <div className="col-span-1">

        <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm">← Volver</button>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
          <Select
            options={proveedores}
            value={proveedorSeleccionado}
            onChange={(selected) => {
              setProveedorSeleccionado(selected);
              setOrden((prev) => ({ ...prev, proveedor_id: selected.value }));
            }}
            placeholder="Seleccione un proveedor"
            isClearable
            className="w-full md:w-1/2"
          />
        </div>

        <h3 className="text-md text-gray-700 mb-4">
          Orden de Compra: <span className="font-medium">{orden.numero_orden}</span>
        </h3>

        <button onClick={agregarItem} className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-600 text-white rounded">+ Agregar Item</button>

        <table className="min-w-full border mb-4">
          <thead>
            <tr>
              <th className="border px-4 py-2">Item</th>
              <th className="border px-4 py-2">Descripción</th>
              <th className="border px-4 py-2">Solicitada</th>
              <th className="border px-4 py-2">Entregada</th>
              <th className="border px-4 py-2">Faltantes</th>
              <th className="border px-4 py-2">Estado</th>
              <th className="border px-4 py-2">Historial de entregas</th>
              <th className="border px-4 py-2">Ultima Entrega</th>
         
              <th className="border px-4 py-2">Nueva Entrega</th>
                 <th className="border px-4 py-2">Observaciones</th>

              <th className="border px-4 py-2">Acción</th>

            </tr>
          </thead>
          <tbody>
  {detalles.map((detalle, index) => (
    <tr key={index}>
      <td className="border px-4 py-2">{detalle.item}</td>

      <td className="border px-4 py-2">
        <input type="text" value={detalle.descripcion} onChange={(e) => {
          const nuevos = [...detalles];
          nuevos[index].descripcion = e.target.value;
          setDetalles(nuevos);
        }} className="w-full border rounded px-2 py-1" />
      </td>

      <td className="border px-4 py-2">
        <input type="number" value={detalle.cantidad_solicitada} onChange={(e) => {
          const nuevos = [...detalles];
          nuevos[index].cantidad_solicitada = parseFloat(e.target.value) || 0;
          setDetalles(nuevos);
        }} className="w-full border rounded px-2 py-1" />
      </td>

      <td className="border px-4 py-2">{detalle.cantidad_entregada}</td>
      <td className="border px-4 py-2">{detalle.cantidad_solicitada - detalle.cantidad_entregada}</td>

      <td className="border px-4 py-2 text-white">
        <span className={`px-2 py-1 rounded text-xs ${obtenerEstadoVisual(detalle).color}`}>
          {obtenerEstadoVisual(detalle).texto}
        </span>
      </td>

      <td className="border px-4 py-2">
    {new Date(detalle.updated_at).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
  </td>
      <td className="border px-4 py-2 text-sm text-gray-700">
    {detalle.entregas?.length > 0 ? (
      <ul className="list-disc pl-4 space-y-1">
        {detalle.entregas.map((e) => (
          <li key={e.id}>
            {new Date(e.fecha_entrega).toLocaleString("es-CO")} —{" "}
            <strong>{e.cantidad_entregada} kg</strong>
            {e.observaciones && ` — ${e.observaciones}`}
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-gray-400 italic">Sin entregas</span>
    )}
  </td>
      <td className="border px-4 py-2">
        <div className="flex flex-col gap-1">
          <input type="number" min="0" step="0.01" value={detalle.cantidad_entregada_input || ""} onChange={(e) => handleChange(index, e.target.value)} className="border rounded px-2 py-1 w-full" placeholder="Cantidad" />
          <input type="datetime-local" value={fechasEntrega[index] || ""} onChange={(e) => handleFechaChange(index, e.target.value)} className={`border px-2 py-1 w-full rounded ${erroresFecha[index] ? "border-red-500" : "border-gray-300"}`} placeholder="Fecha de entrega" />
          {erroresFecha[index] && <p className="text-red-500 text-xs mt-1">{erroresFecha[index]}</p>}
        </div>
      </td>
       <td className="border px-4 py-2">
  <textarea
    value={detalle.observaciones_input || ""}
    onChange={(e) => {
      const nuevos = [...detalles];
      nuevos[index].observaciones_input = e.target.value;
      setDetalles(nuevos);
    }}
    rows={2}
    className="w-full border rounded px-2 py-1 text-sm"
    placeholder="Observaciones..."
  />
</td>

      <td className="border px-4 py-2 text-center">
  <button
    onClick={() => eliminarItem(index, detalle.id)}
    className="text-red-600 hover:text-red-800 text-sm"
  >
    🗑 Eliminar
  </button>
</td>

    </tr>
  ))}
</tbody>

        </table>
<button
  onClick={handleSubmit}
  disabled={isSaving}                     // ← deshabilitado mientras guarda
  className={`px-4 py-2 rounded text-white ${
    isSaving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
  }`}
>
  {isSaving
    ? "Guardando…"                       // texto mientras envía
    : modo === "editar"
      ? "Actualizar Entrega"
      : "Registrar Entrega"}
</button>

      </div>
    </div>
  );
}
