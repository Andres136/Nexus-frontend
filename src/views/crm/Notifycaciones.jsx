import { useQuery } from "@tanstack/react-query";
import ClienteAxios from "../../config/axios";



export default function Notificaciones() {
  // 🧠 Helper para obtener el nombre corto de la clase
  const classBasename = (fullType) =>
    fullType?.split("\\").pop().replace("Notification", "");
  const fetchNotificaciones = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("⚠️ No hay token disponible.");
      return {
        notificaciones: {},
        total_no_leidas: 0,
      };
    }

    try {
      const response = await ClienteAxios.get("/api/notificaciones", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { notificaciones = [], total_no_leidas = 0 } = response.data;

      // Agrupar por tipo
      const agrupadas = notificaciones.reduce((acc, noti) => {
        const tipo = noti.type;
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(noti);
        return acc;
      }, {});

      console.log("✔ Notificaciones agrupadas correctamente:", agrupadas);

      return {
        notificaciones: agrupadas,
        total_no_leidas,
      };
    } catch (error) {
      console.error("❌ Error al obtener notificaciones:", error);

      if (error.response?.status === 401) {
        console.warn("⚠️ Token inválido. Redirigiendo al login...");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      return {
        notificaciones: {},
        total_no_leidas: 0,
      };
    }
  };

  const marcarTodasComoLeidas = async () => {
    const token = localStorage.getItem("token");
    try {
      await ClienteAxios.post("/api/notificaciones/marcar-leidas", null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Vuelve a consultar las notificaciones
      refetch();
    } catch (error) {
      console.error("❌ Error al marcar como leídas:", error);
    }
  };

  // React Query: Ejecutar cada 60 segundos
  const {
    data = { ordenes_compra: [], tareas: [], ingresos: [], total_no_leidas: 0 },
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: fetchNotificaciones,

    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  });
  const traducirTipoNotificacion = (tipo) => {
    const traducciones = {
      NotifyAdminUserLoggedIn: "Inicio de sesión",
    OrdenTrabajoCreada: "Orden de trabajo creada",
    OrdenTrabajoListaParcial: "Orden con productos listos parcialmente",
    TareaVencidaNotificacion: "Tarea vencida",
    ContactoNotificacion: "Nuevo contacto recibido",
    NuevaTareaAsignada: "Nueva tarea asignada",
    OrdenCompraNotificacion: "Nueva orden de compra",
    OrdenesPorVencerNotificacion: "Órdenes por vencer",
    pqrNotifycaciones: "Nuevo mensaje de PQR",

      // Agrega más según tus notificaciones
    };

    return traducciones[tipo] || tipo; // Si no está traducido, muestra el original
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🔔 Notificaciones
      </h2>
      <button
        onClick={marcarTodasComoLeidas}
        className="mb-4 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded transition"
      >
        ✔ Marcar todas como leídas
      </button>

      {isLoading ? (
        <p className="text-gray-500">Cargando notificaciones...</p>
      ) : error ? (
        <p className="text-red-500">
          Ocurrió un error al cargar las notificaciones.
        </p>
      ) : Object.keys(data.notificaciones).length === 0 ? (
        <p className="text-gray-500">No hay notificaciones no leídas.</p>
      ) : (
        Object.entries(data.notificaciones).map(([tipo, grupo]) => (
          <div key={tipo} className="mb-6">
            <h3 className="text-lg font-bold text-blue-700 mb-2">
              {traducirTipoNotificacion(classBasename(tipo))}
            </h3>

            <ul className="space-y-3">
              {grupo.map((noti) => (
                <li
                  key={noti.id}
                  className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow transition"
                >
                  <div className="text-sm text-gray-700">
                    {noti.data?.mensaje ||
                      noti.data?.descripcion ||
                      "Sin mensaje"}
                  </div>

                  {noti.data?.usuario && (
                    <div className="text-sm text-indigo-700 mt-1">
                      👤 Usuario: {noti.data.usuario}
                    </div>
                  )}
                  {noti.data?.orden_id && (
                    <div className="text-sm text-blue-600 mt-1">
                      🧾 Orden ID: {noti.data.orden_id}
                    </div>
                  )}

                  {noti.data?.cliente && (
                    <div className="text-sm text-green-700 mt-1">
                      👤 Cliente: {noti.data.cliente}
                    </div>
                  )}

                  {noti.data?.numero_factura && (
                    <div className="text-sm text-amber-700 mt-1">
                      🧾 Factura: {noti.data.numero_factura}
                    </div>
                  )}

           

                

                  {noti.data?.producto && (
                    <div className="text-sm text-red-700 mt-1">
                      📦 Producto: {noti.data.producto}
                    </div>
                )}

                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(noti.created_at).toLocaleString("es-CO")}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
