import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actualizar, setActualizar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const { auth } = useAuth({ middleware: "auth" });

  const obtenerTareas = async (paginaActual = 1) => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get(
        `/api/tareas?page=${paginaActual}&usuario=${busqueda}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTareas(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        next_page_url: response.data.next_page_url,
        prev_page_url: response.data.prev_page_url,
        total: response.data.total,
      });
    } catch (error) {
      console.log("Error al obtener tareas", error);
      setTareas([]);
    }
  };

  const cambiarEstado = async (id, estado_id) => {
    const token = localStorage.getItem("token");
    try {
      const nuevoEstado = estado_id === 1 ? 2 : 1;
      await clienteAxios.patch(
        `/api/tareas/estado/${id}`,
        { estado_id: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActualizar(!actualizar);
      toast.success("Estado actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar estado");
      console.error("Error al actualizar estado", error);
    }
  };

  const generarNotificaciones = async () => {
    const token = localStorage.getItem("token");
    try {
      await clienteAxios.get("api/tareas-vencidas", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error al generar notificaciones:", error);
    }
  };

  useEffect(() => {
    obtenerTareas(pagina);
    generarNotificaciones();
  }, [actualizar, pagina, busqueda]);

  return (
    <div className="container mx-auto text-sm p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📋 Lista de Tareas
      </h1>

      {/* Input de búsqueda */}
      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar por usuario asignado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full md:w-1/3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
        />
      </div>

      {/* Lista de tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(tareas) && tareas.length > 0 ? (
          tareas.map((tarea) => (
            <div
              key={tarea.id}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-lg rounded-xl p-5 transition"
            >
              <h3 className="text-lg font-semibold text-blue-600 mb-1">
                {tarea.nombre}
              </h3>
              <p className="text-gray-600 mb-2">{tarea.descripcion}</p>

              <div className="text-sm text-gray-500 space-y-1 mb-3">
                <p>
                  <strong>Código:</strong> {tarea.id}
                </p>
                <p>
                  <strong>De:</strong> {tarea.departamentos?.nombre || "N/A"}
                </p>
                <p>
                  <strong>Asignado a:</strong> {tarea.usuario?.name || "N/A"}
                </p>
                <p>
                  <strong>Fecha límite:</strong>{" "}
                  {tarea.fecha_fin
                    ? new Date(tarea.fecha_fin).toLocaleDateString()
                    : "Sin definir"}
                </p>
                <p>
                  <strong>Fecha asignada:</strong>{" "}
                  {tarea.created_at
                    ? new Date(tarea.created_at).toLocaleDateString()
                    : ""}
                </p>
              </div>

              {/* Estado */}
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg w-full transition ${
                  tarea.estado_id === 1
                    ? "bg-yellow-500 text-white hover:bg-green-600"
                    : "bg-green-500 text-white cursor-not-allowed"
                }`}
                onClick={() => cambiarEstado(tarea.id, tarea.estado_id)}
                disabled={tarea.estado_id !== 1}
              >
                {tarea.estado_id === 1 ? "⏳ Pendiente" : "✅ Completado"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center py-10">
            No hay tareas disponibles.
          </p>
        )}
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center mt-8 space-x-3">
        <button
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!pagination.prev_page_url}
          onClick={() => setPagina(pagina - 1)}
        >
          ← Anterior
        </button>
        <span className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold">
          Página {pagination.current_page || 1}
        </span>
        <button
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!pagination.next_page_url}
          onClick={() => setPagina(pagina + 1)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
