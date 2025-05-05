import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actualizar, setActualizar] = useState(false);
  const [busqueda, setBusqueda] = useState(""); // Estado para almacenar el nombre del usuario
  const { auth } = useAuth({ middleware: "auth" });

  // Función para obtener las tareas (y paginación)
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

  // Función para cambiar el estado de una tarea
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

  // Función para enviar notificaciones de tareas vencidas
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

  // useEffect para cargar tareas y generar notificaciones
  useEffect(() => {
    obtenerTareas(pagina);
    generarNotificaciones();
  }, [actualizar, pagina, busqueda]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Tareas</h1>

      {/* Input para la búsqueda de tareas por usuario */}
      <div className="mb-4 flex justify-between p-4">
        <input
          type="text"
          placeholder="Buscar por usuario asignado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border p-2 rounded-lg w-full md:w-1/3"
        />
        {/* Si decides usar un botón para la búsqueda, podrías activar obtenerTareas(1) aquí */}
      </div>

      {/* Renderizado de las tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(tareas) && tareas.length > 0 ? (
          tareas.map((tarea) => (
            <div key={tarea.id} className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold">
                De: {tarea.departamentos?.nombre}
              </h3>
              <h3 className="text-lg font-semibold">Codigo de La Tarea {tarea.id}</h3>
              <h3 className="text-lg font-semibold">{tarea.nombre}</h3>
              <p className="text-gray-600">{tarea.descripcion}</p>

              {/* Mostrar Usuario */}
              <p className="text-sm text-gray-500">
                <strong>Asignado a:</strong> {tarea.usuario?.name || "N/A"}
              </p>

              {/* Mostrar Fecha límite */}
              <p className="text-sm text-gray-500">
                <strong>Fecha límite:</strong>{" "}
                {tarea.fecha_fin
                  ? new Date(tarea.fecha_fin).toLocaleDateString()
                  : "Sin definir"}
              </p>

              {/* Mostrar Fecha de Asignación */}
              <p className="text-sm text-gray-500">
                <strong>Fecha asignada:</strong>{" "}
                {tarea.created_at
                  ? new Date(tarea.created_at).toLocaleDateString()
                  : ""}
              </p>

              {/* Botón para cambiar estado */}
              <div className="mt-4">
              <button
  className={`px-4 py-2 text-sm font-medium rounded-lg w-full transition ${
    tarea.estado_id === 1
      ? "bg-gray-500 text-white hover:bg-green-600 cursor-pointer"
      : "bg-green-300 text-white cursor-not-allowed"
  }`}
  onClick={() => cambiarEstado(tarea.id, tarea.estado_id)}
  disabled={tarea.estado_id !== 1}
>
  {tarea.estado_id === 1 ? "Pendiente" : "Completado"}
</button>

              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No hay tareas disponibles.</p>
        )}
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
          disabled={!pagination.prev_page_url}
          onClick={() => setPagina(pagina - 1)}
        >
          Anterior
        </button>
        <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
          Página {pagination.current_page}
        </span>
        <button
          className="px-4 py-2 bg-gray-800 text-white rounded-lg"
          disabled={!pagination.next_page_url}
          onClick={() => setPagina(pagina + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
