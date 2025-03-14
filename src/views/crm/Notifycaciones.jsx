import { useQuery } from "@tanstack/react-query";
import ClienteAxios from "../../config/axios";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Notificaciones() {
  const [filtro, setFiltro] = useState("todas");
  // Función para solicitar la generación de notificaciones de órdenes vencidas
  const generarNotificaciones = async () => {
    const token = localStorage.getItem("token");
    await ClienteAxios.get("api/notificar-ordenes", {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  const fetchNotificaciones = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await ClienteAxios.get("/api/notificaciones", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Notificaciones:", response.data); // Verifica estructura
  
      return response.data.notificaciones || { ordenes_compra: [], tareas: [], total_no_leidas: 0 };
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      return { ordenes_compra: [], tareas: [], total_no_leidas: 0 }; // Retorna estructura vacía en caso de error
    }
  };
  
  // Ejecutar la solicitud de generación de notificaciones antes de cargarlas
  useEffect(() => {
    generarNotificaciones();
  }, []);

  // React Query: Ejecutar cada 20 segundos para actualizar la lista
  const { data = { ordenes_compra: [], tareas: [], total_no_leidas: 0 }, isLoading, error } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: fetchNotificaciones,
    refetchInterval: 20000, // Actualizar cada 20 segundos
  });

  
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg">
    <h2 className="text-2xl font-semibold text-gray-700 mb-4">🔔 Notificaciones</h2>

    {/* Botones de Filtro */}
    <div className="flex space-x-2 mb-4">
      <button 
        className={`px-4 py-2 rounded-lg ${filtro === "todas" ? "bg-gray-900 text-white" : "bg-gray-300"}`}
        onClick={() => setFiltro("todas")}
      >
        Todas
      </button>
      <button 
        className={`px-4 py-2 rounded-lg ${filtro === "ordenes_compra" ? "bg-gray-900 text-white" : "bg-gray-300"}`}
        onClick={() => setFiltro("ordenes_compra")}
      >
        Órdenes de Compra
      </button>
      <button 
        className={`px-4 py-2 rounded-lg ${filtro === "tareas" ? "bg-gray-900 text-white" : "bg-gray-300"}`}
        onClick={() => setFiltro("tareas")}
      >
        Tareas
      </button>
    </div>

    {/* Tablas de Notificaciones */}
    {isLoading ? (
      <p className="text-gray-500">Cargando notificaciones...</p>
    ) : error ? (
      <p className="text-red-500">Error al cargar notificaciones</p>
    ) : (
      <>
        {/* Tabla de Órdenes de Compra */}
        {filtro !== "tareas" && data.ordenes_compra.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-2">Órdenes de Compra</h3>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Mensaje</th>
                  <th className="py-3 px-6 text-left">Cliente</th>
                  <th className="py-3 px-6 text-left">Fecha de Entrega</th>
                  <th className="py-3 px-6 text-left">Ubicación</th>
                  <th className="py-3 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {data.ordenes_compra.map((noti) => (
                  <tr key={noti.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6">{noti.data.mensaje}</td>
                    <td className="py-3 px-6">{noti.data.cliente || "N/A"}</td>
                    <td className="py-3 px-6">{new Date(noti.data.fecha_entrega).toLocaleDateString()}</td>
                    <td className="py-3 px-6">{noti.data.ubicacion_entrega || "No especificado"}</td>
                    <td className="py-3 px-6 text-center">
                      <Link
                        to={`/auth/crm/ordenes-trabajo/${noti.data.orden_id}`}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
                      >
                        Ver Orden
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla de Tareas */}
        {filtro !== "ordenes_compra" && data.tareas.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Tareas</h3>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Mensaje</th>
                  <th className="py-3 px-6 text-left">Fecha Límite</th>
                  <th className="py-3 px-6 text-center">Descripcion</th>
                  <th className="py-3 px-6 text-center">Asignada</th>
                  <th className="py-3 px-6 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {data.tareas.map((noti) => (
                  <tr key={noti.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6">{noti.data.mensaje}</td>
                    <td className="py-3 px-6">{new Date(noti.data.fecha_fin).toLocaleDateString()}</td>
                    <td className="py-3 px-6 text-center">{noti.data.descripcion}</td>
                    <td className="py-3 px-6 text-center">{noti.data.usuario || "N/A"}</td>
                    <td className="py-3 px-6 text-center">
                      <Link
                        to={`/auth/crm/tareas/${noti.data.tarea_id}`}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
                      >
                        Ver Tarea
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )}
  </div>

  );
}
