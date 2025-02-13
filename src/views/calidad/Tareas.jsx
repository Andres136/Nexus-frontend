import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [pagina, setPagina] = useState(1); // Control de página actual
  const [pagination, setPagination] = useState({}); // Guardará info de paginación
  const [actualizar, setActualizar] = useState(false);

  const ObtenerTareas = async (paginaActual = 1) => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get(`/api/tareas?page=${paginaActual}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Tareas:", response.data); // Debug en consola

      // Ajustar datos para la paginación
      setTareas(response.data.data); // Accedemos correctamente a las tareas
      setPagination({
        current_page: response.data.current_page,
        next_page_url: response.data.next_page_url,
        prev_page_url: response.data.prev_page_url,
        total: response.data.total,
      });
    } catch (error) {
      console.log("Error al obtener tareas", error);
      setTareas([]); // Evitar que tareas sea undefined
    }
  };

  const cambiarEstado = async (id, estado_id) => {
    const token = localStorage.getItem("token");
    try {
      const nuevoEstado = estado_id === 1 ? 2 : 1;
      await clienteAxios.put(
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

  useEffect(() => {
    ObtenerTareas(pagina);
  }, [actualizar, pagina]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Tareas </h1>

      {/* Renderizado de las tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(tareas) && tareas.length > 0 ? (
          tareas.map((tarea) => (
            <div key={tarea.id} className="bg-white shadow-md rounded-lg p-4">
               <h3 className="text-lg font-semibold"> De: {tarea.departamentos?.nombre}</h3>
              <h3 className="text-lg font-semibold">{tarea.nombre}</h3>
              <p className="text-gray-600">{tarea.descripcion}</p>

              {/* Mostrar Usuario */}
              <p className="text-sm text-gray-500">
                <strong>Asignado a:</strong> {tarea.usuario?.name || "N/A"}
              </p>

             

              {/* Mostrar Fecha límite */}
              <p className="text-sm text-gray-500">
                <strong>Fecha límite:</strong>{" "}
                {tarea.fecha_fin ? new Date(tarea.fecha_fin).toLocaleDateString() : "Sin definir"}
              </p>

              {/* Botón para cambiar estado */}
              <div className="mt-4">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg w-full ${
                    tarea.estado_id === 1
                      ? "bg-gray-500 text-white hover:bg-green-600"
                      : "bg-green-500 text-white hover:bg-gray-600"
                  }`}
                  onClick={() => cambiarEstado(tarea.id, tarea.estado_id)}
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
        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
          Página {pagination.current_page}
        </span>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          disabled={!pagination.next_page_url}
          onClick={() => setPagina(pagina + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
