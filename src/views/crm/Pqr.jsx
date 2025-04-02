
import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";

export default function Pqr() {
  const [pqrs, setPqrs] = useState([]);
  const [empresa, setEmpresa] = useState("");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState({});
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);


  const fetchPqrs = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await clienteAxios.get(`/api/pqrs`, {
        params: {
          empresa,
          estado,
          page: pagina
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPqrs(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        total: response.data.total,
        prev_page_url: response.data.prev_page_url,
        next_page_url: response.data.next_page_url,
      });

    } catch (error) {
      console.error("Error al cargar PQRs", error);
    }
  };

  // funcion para  cambiar el estado de una PQR
  const cambiarEstado = async (id, estadoId) => {
    const token = localStorage.getItem("token");
    const nuevoEstado = estadoId === 1 ? 2 : 1;
  
    try {
          const response =   await clienteAxios.put(`/api/pqrs/${id}/estado`, { estado_id: nuevoEstado }, {
        headers: { Authorization: `Bearer ${token}` }
      });
     toast.success(response.data.message);
      fetchPqrs(); // Recarga los datos
    } catch (error) {
      console.error("❌ Error al cambiar el estado", error);
    }
  };
  

  useEffect(() => {
    fetchPqrs();
  }, [empresa, estado, pagina]);

  return (
    <div className="container p-4">
      <h2 className="text-2xl font-bold mb-4">📋 Listado de PQRs</h2>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por empresa"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        <input
          type="text"
          placeholder="Buscar por estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
      </div>
  <div className="grid grid-cols-1">
  <table className="w-full bg-white border shadow-sm text-sm col-span-1">
      <thead className="bg-gray-800 text-white uppercase">
  <tr>
    <th className="py-2 px-4 text-left">Nombre</th>
    <th className="py-2 px-4 text-left">Empresa</th>
    <th className="py-2 px-4 text-left">Teléfono</th>
    <th className="py-2 px-4 text-left">Mensaje </th>
    <th className="py-2 px-4 text-left">Estado</th>
    <th className="py-2 px-4 text-left">Fecha</th>
    <th className="py-2 px-4 text-left">Fecha de Actualizacion</th>
  </tr>
</thead>
<tbody>
  {pqrs.map((pqr) => (
    <tr key={pqr.id} className="border-t hover:bg-gray-50">
      <td className="py-2 px-4">{pqr.nombre}</td>
      <td className="py-2 px-4">{pqr.empresa}</td>
      <td className="py-2 px-4">{pqr.telefono}</td>
      <td className="py-2 px-4">
        <button
          onClick={() => setMensajeSeleccionado(pqr.mensaje)}
          className=" hover:underline"
        >
          Ver Mensaje
        </button>
</td>

<td className="py-2 px-4">
  {pqr.estado?.nombre || "Sin estado"}
  <button
    onClick={() => cambiarEstado(pqr.id, pqr.estado_id)}
    className="ml-2 text-sm text-green-600 underline"
  >
    Cambiar estado
  </button>
</td>

      <td className="py-2 px-4">
        {new Date(pqr.created_at).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}{" "}
        {new Date(pqr.created_at).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="py-2 px-4">
        {new Date(pqr.updated_at).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}{" "}
        {new Date(pqr.updated_at).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
    </tr>
  ))}
</tbody>

      </table>

  </div>
     

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPagina(pagina - 1)}
          disabled={!pagination.prev_page_url}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm">Página {pagination.current_page}</span>
        <button
          onClick={() => setPagina(pagina + 1)}
          disabled={!pagination.next_page_url}
          className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      {mensajeSeleccionado && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h3 className="text-xl font-semibold mb-4">📩 Mensaje completo</h3>
      <p className="text-gray-800 whitespace-pre-line">{mensajeSeleccionado}</p>
      <div className="mt-6 text-right">
        <button
          onClick={() => setMensajeSeleccionado(null)}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
