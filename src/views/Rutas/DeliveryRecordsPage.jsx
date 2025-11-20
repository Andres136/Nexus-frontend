import { useEffect, useState } from "react";
import { deliveryEventsApi } from "../../services/api";
import { 
  Truck, 
  Calendar, 
  Clock, 
  Package, 
  User, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Navigation,
  FileText,
  Hash
} from "lucide-react";

export default function DeliveryRecordsPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");

  const cargarEventos = async () => {
    const res = await deliveryEventsApi.getEntregasPorUsuario();
    console.log("Entregas por usuario obtenidas:", res.data.data)
    setEventos(res.data.data);
    
    // ✅ Obtener el nombre del primer usuario para el saludo
    if (res.data.data && res.data.data.length > 0) {
      const primerEvento = res.data.data[0];
      setNombreUsuario(primerEvento.usuario?.name || "Usuario");
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    setLoading(true);
    try {
      await deliveryEventsApi.updateEstado(id, { estado: nuevoEstado });
      // Actualizar visualmente
      setEventos(prev =>
        prev.map(ev => (ev.id === id ? { ...ev, estado: nuevoEstado } : ev))
      );
    } catch (error) {
      console.error("Error actualizando estado:", error);
    } finally {
      setLoading(false);
    }
  };

  const colorEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "en_ruta":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completado":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelado":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ✅ Función para obtener icono del estado
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return <Clock className="w-3 h-3" />;
      case 'en_ruta': return <Navigation className="w-3 h-3" />;
      case 'completado': return <CheckCircle2 className="w-3 h-3" />;
      case 'cancelado': return <XCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Header responsive con saludo personalizado */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              {/* ✅ Saludo personalizado */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Hola {nombreUsuario}, tus entregas
              </h2>
              <p className="text-sm text-gray-600 hidden sm:block">
                Gestiona el estado de tus entregas asignadas
              </p>
            </div>
          </div>

          {/* ✅ Estadísticas rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-700">
                {eventos.filter(e => e.estado === 'pendiente').length}
              </div>
              <div className="text-xs text-yellow-600">Pendientes</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-700">
                {eventos.filter(e => e.estado === 'en_ruta').length}
              </div>
              <div className="text-xs text-blue-600">En Ruta</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-700">
                {eventos.filter(e => e.estado === 'completado').length}
              </div>
              <div className="text-xs text-green-600">Completadas</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-red-700">
                {eventos.filter(e => e.estado === 'cancelado').length}
              </div>
              <div className="text-xs text-red-600">Canceladas</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Lista responsive */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {eventos.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entregas</h3>
            <p className="text-gray-600">No tienes entregas asignadas aún.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventos.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* ✅ Layout móvil */}
                <div className="block sm:hidden p-4 space-y-3">
                  {/* Header móvil */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">OC #{ev.orden_id}</p>
                        <p className="text-sm text-gray-600">{ev.orden?.cliente?.nombre}</p>
                      </div>
                    </div>
                    
                    {/* Estado móvil */}
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${colorEstado(ev.estado)}`}>
                      <div className="flex items-center gap-1">
                        {getEstadoIcon(ev.estado)}
                        {ev.estado}
                      </div>
                    </span>
                  </div>

                  {/* ✅ Información adicional móvil */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {ev.fecha_entrega}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {ev.hora}
                      </div>
                    </div>

                    {/* Cantidad */}
                    <div className="flex items-center gap-1 text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>Cantidad: <span className="font-semibold text-blue-600">{ev.cantidad}</span></span>
                    </div>

                    {/* ✅ Información del vehículo */}
                    {ev.vehiculo && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-green-700">
                          <Truck className="w-4 h-4" />
                          <span className="font-medium">Vehículo:</span>
                        </div>
                        <div className="text-sm text-green-800 mt-1 space-y-1">
                          <p><span className="font-medium">Placa:</span> {ev.vehiculo.placa}</p>
                          <p><span className="font-medium">Marca:</span> {ev.vehiculo.marca} {ev.vehiculo.modelo}</p>
                          <p><span className="font-medium">Conductor:</span> {ev.vehiculo.conductor}</p>
                        </div>
                      </div>
                    )}

                    {/* Observaciones */}
                    {ev.observaciones && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <div className="flex items-start gap-1">
                          <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-yellow-700 font-medium">Observaciones:</p>
                            <p className="text-sm text-yellow-800">{ev.observaciones}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controles móvil */}
                  <div className="flex flex-col gap-2">
                    <select
                      value={ev.estado}
                      onChange={(e) => cambiarEstado(ev.id, e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      disabled={loading}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_ruta">En Ruta</option>
                      <option value="completado">Completada</option>
                      <option value="cancelado">Cancelado</option>
                    </select>

                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={ev.estado === "completado"}
                        onChange={(e) =>
                          e.target.checked && cambiarEstado(ev.id, "completado")
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-700">Marcar como completada</span>
                    </div>
                  </div>
                </div>

                {/* ✅ Layout desktop */}
                <div className="hidden sm:block">
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    {/* Información principal */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <p className="font-bold text-gray-900 text-lg">OC #{ev.orden_id}</p>
                          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${colorEstado(ev.estado)}`}>
                            <div className="flex items-center gap-1">
                              {getEstadoIcon(ev.estado)}
                              Estado: {ev.estado}
                            </div>
                          </span>
                        </div>
                        
                        {/* ✅ Grid de información en desktop */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm text-gray-600">
                          {/* Cliente */}
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">Cliente:</span>
                            <span>{ev.orden?.cliente?.nombre}</span>
                          </div>

                          {/* Fecha y hora */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{ev.fecha_entrega}</span>
                            <Clock className="w-4 h-4 ml-2" />
                            <span>{ev.hora}</span>
                          </div>

                          {/* Cantidad */}
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Cantidad:</span>
                            <span className="font-semibold text-blue-600">{ev.cantidad}</span>
                          </div>

                          {/* ID de entrega */}
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">ID Entrega:</span>
                            <span className="text-gray-500">#{ev.id}</span>
                          </div>
                        </div>

                        {/* ✅ Información del vehículo en desktop */}
                        {ev.vehiculo && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">Información del Vehículo</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-green-800">
                              <div><span className="font-medium">Placa:</span> {ev.vehiculo.placa}</div>
                              <div><span className="font-medium">Marca:</span> {ev.vehiculo.marca} {ev.vehiculo.modelo}</div>
                              <div><span className="font-medium">Conductor:</span> {ev.vehiculo.conductor}</div>
                            </div>
                          </div>
                        )}

                        {/* ✅ Observaciones en desktop */}
                        {ev.observaciones && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-yellow-700">Observaciones:</p>
                                <p className="text-sm text-yellow-800 mt-1">{ev.observaciones}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controles desktop */}
                    <div className="flex flex-col items-end space-y-3 min-w-[200px]">
                      {/* SELECT DEL ESTADO */}
                      <select
                        value={ev.estado}
                        onChange={(e) => cambiarEstado(ev.id, e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_ruta">En Ruta</option>
                        <option value="completado">Completada</option>
                        <option value="cancelado">Cancelado</option>
                      </select>

                      {/* CHECKBOX SOLO PARA COMPLETAR */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg w-full">
                        <input
                          type="checkbox"
                          checked={ev.estado === "completado"}
                          onChange={(e) =>
                            e.target.checked && cambiarEstado(ev.id, "completado")
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={loading}
                        />
                        <span className="text-sm text-gray-700">Marcar completada</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}