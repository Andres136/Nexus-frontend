import { useQuery } from "@tanstack/react-query";
import ClienteAxios from "../../config/axios";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Notificaciones() {
  const [filtro, setFiltro] = useState("todas");

  // Función para solicitar la generación de notificaciones
  const generarNotificaciones = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ No hay token disponible.");
      return;
    }

    try {
      await ClienteAxios.get("/api/notificar-ordenes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✔ Notificaciones generadas correctamente.");
    } catch (error) {
      console.error("❌ Error al generar notificaciones:", error);
    }
  };

  // Obtener notificaciones
  const fetchNotificaciones = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ No hay token disponible.");
      return { ordenes_compra: [], tareas: [], total_no_leidas: 0 };
    }

    try {
      const response = await ClienteAxios.get("/api/notificaciones", {
        headers: { Authorization: `Bearer ${token}` },
        
      });
      console.log("✔ Notificaciones obtenidas correctamente:", response.data);
      return response.data.notificaciones || { ordenes_compra: [], tareas: [], ingresos:[], total_no_leidas: 0 };
      
    } catch (error) {
      console.error("❌ Error al obtener notificaciones:", error);

      if (error.response?.status === 401) {
        console.warn("⚠️ Token inválido o expirado. Redirigiendo al login...");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      return { ordenes_compra: [], tareas: [], ingresos:[], total_no_leidas: 0 };
    }
  };

  // Ejecutar la generación de notificaciones una sola vez al montar el componente
  useEffect(() => {
    generarNotificaciones();
  }, []);

  // React Query: Ejecutar cada 20 segundos
  const { data = { ordenes_compra: [], tareas: [], ingresos:[], total_no_leidas: 0 }, isLoading, error } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: fetchNotificaciones,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">🔔 Notificaciones</h2>

      {/* Botones de Filtro */}
      <div className="flex space-x-2 mb-4">
        {["todas", "ordenes_compra", "tareas"].map((tipo) => (
          <button
            key={tipo}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              filtro === tipo ? "bg-gray-900 text-white shadow-lg" : "bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() => setFiltro(tipo)}
          >
            {tipo === "todas" ? "Todas" : tipo === "ordenes_compra" ? "Órdenes de Compra" : "Tareas"}
          </button>
        ))}
      </div>

      {/* Indicador de carga */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h2zm2 5.292A7.962 7.962 0 014 12H2a10 10 0 0010 10v-2a7.962 7.962 0 01-6-2.708z"></path>
          </svg>
        </div>
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
                      <td className="py-3 px-6">{noti.data?.mensaje || "Mensaje no disponible"}</td>
                      <td className="py-3 px-6">{noti.data?.cliente || "N/A"}</td>
                      <td className="py-3 px-6">{noti.data?.fecha_entrega ? new Date(noti.data.fecha_entrega).toLocaleDateString() : "Sin fecha"}</td>
                      <td className="py-3 px-6">{noti.data?.ubicacion_entrega || "No especificado"}</td>
                      <td className="py-3 px-6 text-center">
                        <Link
                          to={`/auth/crm/ordenes-trabajo/${noti.data?.orden_id}`}
                          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all w-full"
                        >
                          Ver
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
              </table>
            </div>
          )}

{filtro !== "ordenes_compra" && filtro !== "tareas" && data.ingresos?.length > 0 && (
  <div className="mb-6">
    <h3 className="text-lg font-bold text-gray-700 mb-2">Usuarios que ingresaron</h3>
    <table className="min-w-full bg-white border border-gray-200">
      <thead>
        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
          <th className="py-3 px-6 text-left">Nombre</th>
          <th className="py-3 px-6 text-left">Fecha y hora</th>
        </tr>
      </thead>
      <tbody className="text-gray-700 text-sm">
        {data.ingresos.map((noti, idx) => (
          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-100">
            <td className="py-3 px-6">{noti.data?.name || "Sin nombre"}</td>
            <td className="py-3 px-6">
              {new Date(noti.created_at).toLocaleString("es-CO", {
                dateStyle: "short",
                timeStyle: "short",
              })}
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
