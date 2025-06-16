import { useParams, useNavigate } from "react-router-dom";
import  { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import Select from "react-select";
// Convierte cualquier fecha (string) a "YYYY-MM-DDTHH:MM" en tu zona horaria
export function toDatetimeLocal(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
           .toISOString()
           .slice(0, 16);
}



export default function RegistrarEntregaProveedor({ modo = "crear" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState({});
  const [proveedorOriginal, setProveedorOriginal] = useState(null);
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
      const productos = data.productos.map((detalle) => {
        const ultima = detalle.entregas?.[detalle.entregas.length - 1] || null;
  
        return {
          ...detalle,
          cantidad_entregada_input: "",            // ← SIEMPRE vacío
          entrega_id: ultima?.id || null,          // para actualizar si edita entrega
          fecha_ultima: ultima?.fecha_entrega || null,
        };
      });
  
      setDetalles(productos);
  
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
    if (proveedorPreSeleccionado !== null && proveedores.length > 0) {
      const actual = proveedores.find((p) => p.value === proveedorPreSeleccionado);
      setProveedorSeleccionado(actual || null);
    }
    if(proveedorPreSeleccionado && proveedores.length){
      const actual = proveedores.find((p) => p.value === proveedorPreSeleccionado.value);
      setProveedorSeleccionado(actual || null);
    }
  }, [proveedorPreSeleccionado, proveedores]);
  

  const handleFechaChange = (index, value) => {
    setFechasEntrega((prev) => ({ ...prev, [index]: value }));
  };

  const handleChange = (index, value) => {
    const nuevos = [...detalles];
    nuevos[index].cantidad_entregada_input = value;
    setDetalles(nuevos);
  };

  const agregarItem = () => {
    const nuevoItem = {
      id: null,
      item: detalles.length + 1,
      descripcion: "",
      cantidad_solicitada: 0,
      cantidad_entregada: 0,
      cantidad_entregada_input: "",
      entrega_id: null,
      entregas: [],
    };
    setDetalles((prev) => [...prev, nuevoItem]);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const nuevosErrores = {};
  
    const entregas = detalles
      .map((d, index) => {
        const cantidad = parseFloat(d.cantidad_entregada_input);
        const fecha = fechasEntrega[index];
        if (cantidad > 0 && !fecha) {
          nuevosErrores[index] = "La fecha es obligatoria";
          return null;
        }
        if (cantidad > 0) {
          return { 
            id: d.entrega_id, 
            detalle_id: d.id, 
            cantidad_entregada: cantidad, 
            fecha_entrega: fecha 
          };
        }
        return null;
      })
      .filter((e) => e !== null);
  
    if (Object.keys(nuevosErrores).length > 0) {
      setErroresFecha(nuevosErrores);
      toast.error("Completa las fechas");
      return;
    }
  
    setErroresFecha({});
    try {
      // 🔐 SOLO ACTUALIZAMOS PROVEEDOR SI EL USUARIO REALMENTE LO MODIFICÓ
   const proveedorId = proveedorSeleccionado?.value || null;
if (proveedorId !== proveedorOriginal) {
  console.log('🔄 Actualizando proveedor:', proveedorSeleccionado.value);
  await clienteAxios.put(
    `/api/ordenes-compra-proveedor/${id}/update-proveedor`,
    { proveedor_id: proveedorSeleccionado.value },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('✅ petición PUT /update-proveedor completada');
}

  
      // 🔐 PROCESAMOS DETALLES SI HUBO MODIFICACIONES DE ITEMS
      for (const d of detalles) {
        if (d.id) {
          await clienteAxios.put(`/api/detalles-orden/${d.id}`, {
            descripcion: d.descripcion,
            cantidad_solicitada: d.cantidad_solicitada
          }, { headers: { Authorization: `Bearer ${token}` } });
        } else {
          await clienteAxios.post(`/api/detalles-orden`, {
          
            orden_id: id,
            descripcion: d.descripcion,
            cantidad_solicitada: d.cantidad_solicitada,
            item: d.item
          }, { headers: { Authorization: `Bearer ${token}` } });
        }
      }
  
      // 🔐 REGISTRAMOS LAS ENTREGAS NORMALMENTE
      for (const entrega of entregas) {
        const endpoint = entrega.id 
          ? `/api/entregas-proveedor/${entrega.id}` 
          : "/api/entregas-proveedor";
  
        await clienteAxios({
          method: entrega.id ? "put" : "post",
          url: endpoint,
          data: entrega,
          headers: { Authorization: `Bearer ${token}` },
        });
      }
  
      toast.success("Entrega registrada correctamente");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar entrega");
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
    </tr>
  ))}
</tbody>

        </table>

        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {modo === "editar" ? "Actualizar Entrega" : "Registrar Entrega"}
        </button>

      </div>
    </div>
  );
}
