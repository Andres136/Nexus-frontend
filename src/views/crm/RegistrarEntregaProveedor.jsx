
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";

export default function RegistrarEntregaProveedor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState({});

  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const obtenerEstadoVisual = (detalle) => {
    const entregada = detalle.cantidad_entregada;
    const solicitada = detalle.cantidad_solicitada;
  
    if (entregada === 0) return { texto: "Pendiente", color: "bg-red-500" };
    if (entregada < solicitada) return { texto: "Parcial", color: "bg-yellow-400" };
    if (entregada === solicitada) return { texto: "Completo", color: "bg-green-500" };
    if (entregada > solicitada) return { texto: "Extra", color: "bg-purple-500" };
  };
  
  useEffect(() => {
    const fetchDetalles = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await clienteAxios.get(`/api/ordenes-compra-proveedor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDetalles(response.data.productos);
        setOrden({
          proveedor: response.data.proveedor,
          numero_orden: response.data.numero_orden
        });
        console.log(response.data.productos);
      } catch (error) {
        toast.error("Error al cargar los detalles de la orden");
        console.error("Error al cargar los detalles de la orden:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalles();
  }, [id]);

  const handleChange = (index, value) => {
    const nuevos = [...detalles];
    nuevos[index].cantidad_entregada_input = value;
    setDetalles(nuevos);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const payload = {
      detalles: detalles.map((d) => ({
        id: d.id,
        cantidad_entregada: parseFloat(d.cantidad_entregada_input || 0),
      })),
    };

    try {
      await clienteAxios.put(`/api/ordenes-compra-proveedor/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Entrega registrada correctamente");
      navigate(-1);
    } catch (error) {
      toast.error("Error al registrar la entrega");
      console.error("Error al registrar la entrega:", error);
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
            <th className="border px-4 py-2">Nueva Entrega</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle, index) => (
            <tr key={detalle.id}>
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
    minute: "2-digit"
  })}
</td>

              <td className="border px-4 py-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={detalle.cantidad_entregada_input || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Registrar Entrega
      </button>
      </div>
    </div>
  );
}
