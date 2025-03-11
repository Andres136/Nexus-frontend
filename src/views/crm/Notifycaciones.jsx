import { useQuery } from "@tanstack/react-query";
import ClienteAxios from "../../config/axios";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function Notificaciones() {
  
  // Función para solicitar la generación de notificaciones de órdenes vencidas
  const generarNotificaciones = async () => {
    const token = localStorage.getItem("token");
    await ClienteAxios.get("api/notificar-ordenes", {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  // Función para obtener notificaciones de órdenes vencidas
  const fetchNotificacionesOrdenes = async () => {
    const token = localStorage.getItem("token");
    const response = await ClienteAxios.get("api/notificaciones", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Notificaciones:", response.data);
    return response.data;
  };

  // Ejecutar la solicitud de generación de notificaciones antes de cargarlas
  useEffect(() => {
    generarNotificaciones();
  }, []);

  // React Query: Ejecutar cada 20 segundos para actualizar la lista
  const { data, isLoading, error } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: fetchNotificacionesOrdenes,
    refetchInterval: 20000, // Actualizar cada 20 segundos
  });

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">🔔 Notificaciones de Órdenes de Trabajo</h2>

      {isLoading ? (
        <p className="text-gray-500">Cargando notificaciones...</p>
      ) : error ? (
        <p className="text-red-500">Error al cargar notificaciones</p>
      ) : (
        <>
          {data?.notificaciones?.length > 0 ? (
            <div className="overflow-x-auto">
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
                  {data.notificaciones.map((noti) => (
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
                          Ver Órdenes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No tienes notificaciones de órdenes de trabajo.</p>
          )}
        </>
      )}
    </div>
  );
}
