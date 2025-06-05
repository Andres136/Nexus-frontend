
import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";

export default function RegistrarEntregaProveedor({modo = "crear"}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState({});

  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroresFecha, setErroresFecha] = useState({});


  const [fechasEntrega, setFechasEntrega] = useState({});

  const obtenerEstadoVisual = (detalle) => {
    const entregada = detalle.cantidad_entregada;
    const solicitada = detalle.cantidad_solicitada;
  
    if (entregada === 0) return { texto: "Pendiente", color: "bg-red-500" };
    if (entregada < solicitada) return { texto: "Parcial", color: "bg-yellow-400" };
    if (entregada === solicitada) return { texto: "Completo", color: "bg-green-500" };
    if (entregada > solicitada) return { texto: "Extra", color: "bg-purple-500" };
  };
  const handleFechaChange = (index, value) => {
    setFechasEntrega((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleChange = (index, value) => {
    const nuevos = [...detalles];
    nuevos[index].cantidad_entregada_input = value;
    setDetalles(nuevos);
  };
  
  
  useEffect(() => {
    const fetchDetalles = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await clienteAxios.get(`/api/ordenes-compra-proveedor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const productos = response.data.productos.map((detalle) => {
          const ultimaEntrega = detalle.entregas?.[detalle.entregas.length - 1]; // última entrega
        
          return {
            ...detalle,
            cantidad_entregada_input: modo === "editar" ? ultimaEntrega?.cantidad_entregada || "" : "",
            entrega_id: modo === "editar" ? ultimaEntrega?.id : null, // 👈 aquí guardas el id de la entrega
          };
        });
        
        setDetalles(productos);
        setOrden({
          proveedor: response.data.proveedor,
          numero_orden: response.data.numero_orden,
        });
  
      } catch (error) {
        toast.error("Error al cargar los detalles de la orden");
      } finally {
        setLoading(false);
      }
    };
  
    fetchDetalles();
  }, [id, modo]);
  
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
          id: d.entrega_id, // 👈 necesario solo en edición
          detalle_id: d.id,
          cantidad_entregada: cantidad,
          fecha_entrega: fecha,
        };
      }
  
      return null;
    })
    .filter((e) => e !== null);
  
  
    if (Object.keys(nuevosErrores).length > 0) {
      setErroresFecha(nuevosErrores);
      toast.error("Por favor completa todas las fechas requeridas");
      return;
    }
  
    setErroresFecha({}); // limpia si está todo bien
    try {
      for (const entrega of entregas) {
        const endpoint = modo === "editar"
          ? `/api/entregas-proveedor/${entrega.id}` // usando el id específico
          : "/api/entregas-proveedor";
      
        await clienteAxios({
          method: modo === "editar" ? "put" : "post",
          url: endpoint,
          data: entrega,
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      toast.success(
        modo === "editar"
          ? "Entregas actualizadas correctamente"
          : "Entregas registradas correctamente"
      );
      navigate(-1);
    } catch (error) {
      toast.error("Error al registrar o actualizar entregas");
      console.error("Error:", error);
    }
    
  };
  
  

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="grid grid-cols-1">
      <div className="col-span-1">
      <button
  onClick={() => navigate(-1)} // 👈 vuelve a la ruta anterior
  className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
>
  ← Volver
</button>

  <h2 className="text-xl font-bold mb-2">
  Entrega Proveedor: <span className="text-blue-600">{orden.proveedor}</span>
</h2>
<h3 className="text-md text-gray-700 mb-4">
  Orden de Compra: <span className="font-medium">{orden.numero_orden}</span>
</h3>


      <table className="min-w-full border mb-4">
        <thead>
          <tr>
            <th className="border px-4 py-2">Item</th>
            <th className="border px-4 py-2">Descripción</th>
            <th className="border px-4 py-2">Solicitada</th>
            <th className="border px-4 py-2">Entregada</th>
            <th className="border px-4 py-2">Faltantes</th>
            <th className="border px-4 py-2">Estado</th>
            <th className="border px-4 py-2">Ultima Entrega</th>
            <th className="border px-4 py-2">Historial de entregas</th>
            <th className="border px-4 py-2">Nueva Entrega</th>
          </tr>
        </thead>
        <tbody>
  {detalles.map((detalle, index) => (
    <React.Fragment key={detalle.id}>
      {/* Fila principal del ítem */}
      <tr>
  <td className="border px-4 py-2">{detalle.item}</td>
  <td className="border px-4 py-2">{detalle.descripcion}</td>
  <td className="border px-4 py-2">{detalle.cantidad_solicitada}</td>
  <td className="border px-4 py-2">{detalle.cantidad_entregada}</td>
  <td className="border px-4 py-2">
    {detalle.cantidad_solicitada - detalle.cantidad_entregada}
  </td>
  <td className="border px-4 py-2 text-white">
    {(() => {
      const estado = obtenerEstadoVisual(detalle);
      return (
        <span className={`px-2 py-1 rounded text-xs ${estado.color}`}>
          {estado.texto}
        </span>
      );
    })()}
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
      <input
        type="number"
        min="0"
        step="0.01"
        value={detalle.cantidad_entregada_input || ""}
        onChange={(e) => handleChange(index, e.target.value)}
        className="border rounded px-2 py-1 w-full"
        placeholder="Cantidad"
      />
      <>
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
      </>
    </div>
  </td>
</tr>


 
    </React.Fragment>
  ))}
</tbody>

      </table>

      <button
  onClick={handleSubmit}
  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
>
  {modo === "editar" ? "Actualizar Entrega" : "Registrar Entrega"}
</button>

      </div>
    </div>
  );
}
