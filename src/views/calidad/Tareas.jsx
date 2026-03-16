import { useEffect, useState, useMemo } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { 
  ChevronDown, ChevronUp, Calendar, User, Building, Hash, Edit3, X, Save,
  LayoutGrid, Columns3, Clock, CheckCircle2, PlayCircle, AlertCircle, Search,
  MoreHorizontal
} from "lucide-react";
import { BsListTask } from "react-icons/bs";

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actualizar, setActualizar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [tareasExpandidas, setTareasExpandidas] = useState(new Set());
  
  // ✅ NUEVO: Vista Kanban o Grid
  const [vistaKanban, setVistaKanban] = useState(true);
  
  // Estados para edición
  const [modalEdicion, setModalEdicion] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_fin: ''
  });
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  
  const { user } = useAuth({ middleware: "auth" });

  // ✅ NUEVO: Agrupar tareas por estado para vista Kanban
  const tareasAgrupadas = useMemo(() => {
    const grupos = {
      pendientes: [],
      enCurso: [],
      completadas: [],
      vencidas: []
    };
    
    tareas.forEach(tarea => {
      const fechaLimite = tarea.fecha_fin ? new Date(tarea.fecha_fin) : null;
      const esVencida = fechaLimite && fechaLimite < new Date() && tarea.estado_id === 1;
      
      if (esVencida) {
        grupos.vencidas.push(tarea);
      } else if (tarea.estado_id === 1) {
        grupos.pendientes.push(tarea);
      } else if (tarea.estado_id === 5) {
        grupos.enCurso.push(tarea);
      } else if (tarea.estado_id === 2) {
        grupos.completadas.push(tarea);
      }
    });
    
    return grupos;
  }, [tareas]);

  // ✅ Configuración de columnas Kanban
  const columnas = [
    {
      id: 'vencidas',
      titulo: 'Vencidas',
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      headerBg: 'bg-red-100',
      textColor: 'text-red-700',
      tareas: tareasAgrupadas.vencidas
    },
    {
      id: 'pendientes',
      titulo: 'Pendientes',
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      headerBg: 'bg-amber-100',
      textColor: 'text-amber-700',
      tareas: tareasAgrupadas.pendientes
    },
    {
      id: 'enCurso',
      titulo: 'En Curso',
      icon: PlayCircle,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      headerBg: 'bg-blue-100',
      textColor: 'text-blue-700',
      tareas: tareasAgrupadas.enCurso
    },
    {
      id: 'completadas',
      titulo: 'Completadas',
      icon: CheckCircle2,
      color: 'green',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      headerBg: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      tareas: tareasAgrupadas.completadas
    }
  ];

  const toggleTareaExpandida = (tareaId) => {
    const nuevasExpandidas = new Set(tareasExpandidas);
    if (nuevasExpandidas.has(tareaId)) {
      nuevasExpandidas.delete(tareaId);
    } else {
      nuevasExpandidas.add(tareaId);
    }
    setTareasExpandidas(nuevasExpandidas);
  };

  const abrirModalEdicion = (tarea) => {
    setTareaEditando(tarea);
    setFormData({
      nombre: tarea.nombre || '',
      descripcion: tarea.descripcion || '',
      fecha_fin: tarea.fecha_fin ? tarea.fecha_fin.split('T')[0] : ''
    });
    setModalEdicion(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicion(false);
    setTareaEditando(null);
    setFormData({ nombre: '', descripcion: '', fecha_fin: '' });
  };

  const actualizarTarea = async () => {
    if (!tareaEditando) return;
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre de la tarea es obligatorio');
      return;
    }
    
    if (!formData.descripcion.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }

    setCargandoEdicion(true);
    const token = localStorage.getItem("token");
    
    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        fecha_fin: formData.fecha_fin || null,
        usuario_id: tareaEditando.usuario_id,
        departamento_id: tareaEditando.departamento_id
      };

      await clienteAxios.put(`/api/tareas/update/${tareaEditando.id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Tarea actualizada correctamente');
      cerrarModalEdicion();
      setActualizar(!actualizar);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la tarea');
    } finally {
      setCargandoEdicion(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      let nuevoEstado = estado_id;
      if (estado_id === 1) nuevoEstado = 5;
      else if (estado_id === 5) nuevoEstado = 2;

      await clienteAxios.patch(
        `/api/tareas/estado/${id}`,
        { estado_id: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActualizar(!actualizar);
      toast.success("Estado actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar estado");
      console.error(error);
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

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  useEffect(() => {
    obtenerTareas(pagina);
    generarNotificaciones();
  }, [actualizar, pagina, busqueda]);

  // ✅ Componente de Tarjeta Kanban (compacta estilo Notion/Trello)
  const TarjetaKanban = ({ tarea, columna }) => {
    const fechaLimite = tarea.fecha_fin ? new Date(tarea.fecha_fin) : null;
    const esVencida = fechaLimite && fechaLimite < new Date() && tarea.estado_id === 1;
    
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 hover:shadow-md transition-all duration-200 cursor-pointer group"
        onClick={() => toggleTareaExpandida(tarea.id)}
      >
        {/* Header con título y acciones */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium text-gray-900 leading-snug flex-1">
            {truncateText(tarea.nombre, 60)}
          </h4>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {(user?.role_id === 1 || user?.role_id === 2) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  abrirModalEdicion(tarea);
                }}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Descripción (solo si está expandida) */}
        {tareasExpandidas.has(tarea.id) && (
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            {tarea.descripcion}
          </p>
        )}

        {/* Tags y metadata */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Usuario asignado */}
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            <User className="w-3 h-3" />
            <span className="max-w-[80px] truncate">{tarea.usuario?.name || "N/A"}</span>
          </div>
          
          {/* Fecha límite */}
          {fechaLimite && (
            <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              esVencida 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{formatearFecha(fechaLimite)}</span>
            </div>
          )}
          
          {/* ID */}
          <span className="text-xs text-gray-400">#{tarea.id}</span>
        </div>

        {/* Botón de acción (solo si no está completada) */}
        {tarea.estado_id !== 2 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              cambiarEstado(tarea.id, tarea.estado_id);
            }}
            className={`w-full mt-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tarea.estado_id === 1
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            {tarea.estado_id === 1 ? '▶ Iniciar' : '✓ Completar'}
          </button>
        )}
      </div>
    );
  };

  // ✅ Componente de Columna Kanban
  const ColumnaKanban = ({ columna }) => {
    const IconoColumna = columna.icon;
    
    return (
      <div className={`flex flex-col min-w-[280px] max-w-[320px] ${columna.bgColor} rounded-xl border ${columna.borderColor}`}>
        {/* Header de columna */}
        <div className={`${columna.headerBg} px-4 py-3 rounded-t-xl border-b ${columna.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconoColumna className={`w-4 h-4 ${columna.textColor}`} />
              <h3 className={`font-semibold text-sm ${columna.textColor}`}>
                {columna.titulo}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${columna.headerBg} ${columna.textColor}`}>
                {columna.tareas.length}
              </span>
            </div>
            <button className="p-1 hover:bg-white/50 rounded transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Lista de tareas */}
        <div className="flex-1 p-3 overflow-y-auto max-h-[calc(100vh-320px)] space-y-2">
          {columna.tareas.length > 0 ? (
            columna.tareas.map(tarea => (
              <TarjetaKanban key={tarea.id} tarea={tarea} columna={columna} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Sin tareas</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header estilo Notion */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Título */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BsListTask className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestión de Tareas</h1>
                <p className="text-sm text-gray-500">{pagination.total || 0} tareas en total</p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por usuario..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Toggle Vista */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setVistaKanban(true)}
                  className={`p-2 rounded-md transition-all ${
                    vistaKanban 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vista Kanban"
                >
                  <Columns3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVistaKanban(false)}
                  className={`p-2 rounded-md transition-all ${
                    !vistaKanban 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vista Tarjetas"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-6">
        {vistaKanban ? (
          /* ✅ VISTA KANBAN */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columnas.map(columna => (
              <ColumnaKanban key={columna.id} columna={columna} />
            ))}
          </div>
        ) : (
          /* ✅ VISTA GRID (original mejorada) */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.isArray(tareas) && tareas.length > 0 ? (
                tareas.map((tarea) => {
                  const fechaLimite = tarea.fecha_fin ? new Date(tarea.fecha_fin) : null;
                  const esVencida = fechaLimite && fechaLimite < new Date() && tarea.estado_id === 1;
                  const estaExpandida = tareasExpandidas.has(tarea.id);
                  
                  return (
                    <div
                      key={tarea.id}
                      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${
                        tarea.estado_id === 1 
                          ? esVencida ? 'border-red-500' : 'border-amber-500'
                          : tarea.estado_id === 5 ? 'border-blue-500' : 'border-emerald-500'
                      }`}
                    >
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 leading-tight flex-1">
                            {truncateText(tarea.nombre, 50)}
                          </h3>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {(user?.role_id === 1 || user?.role_id === 2) && (
                              <button
                                onClick={() => abrirModalEdicion(tarea)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              tarea.estado_id === 1
                                ? esVencida ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                : tarea.estado_id === 5 ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {tarea.estado_id === 1 && (esVencida ? "Vencida" : "Pendiente")}
                              {tarea.estado_id === 5 && "En curso"}
                              {tarea.estado_id === 2 && "Completada"}
                            </span>
                          </div>
                        </div>

                        {/* Descripción */}
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                          {estaExpandida ? tarea.descripcion : truncateText(tarea.descripcion, 80)}
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{tarea.usuario?.name || "N/A"}</span>
                          </div>
                          {fechaLimite && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatearFecha(fechaLimite)}</span>
                            </div>
                          )}
                          <span className="text-gray-400">#{tarea.id}</span>
                        </div>

                        {/* Expandir */}
                        <button
                          onClick={() => toggleTareaExpandida(tarea.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1"
                        >
                          {estaExpandida ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {estaExpandida ? 'Ver menos' : 'Ver más'}
                        </button>

                        {/* Botón de acción */}
                        <button
                          className={`w-full py-2 text-xs font-medium rounded-lg transition-all ${
                            tarea.estado_id === 1
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : tarea.estado_id === 5
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          onClick={() => cambiarEstado(tarea.id, tarea.estado_id)}
                          disabled={tarea.estado_id === 2}
                        >
                          {tarea.estado_id === 1 && "▶ Iniciar tarea"}
                          {tarea.estado_id === 5 && "✓ Completar tarea"}
                          {tarea.estado_id === 2 && "✅ Completada"}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-600 mb-1">No hay tareas</h3>
                  <p className="text-sm text-gray-400">No se encontraron tareas</p>
                </div>
              )}
            </div>

            {/* Paginación */}
            {pagination.total > 0 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!pagination.prev_page_url}
                  onClick={() => setPagina(pagina - 1)}
                >
                  ← Anterior
                </button>
                <span className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-medium">
                  {pagination.current_page || 1}
                </span>
                <button
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!pagination.next_page_url}
                  onClick={() => setPagina(pagina + 1)}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Edición (sin cambios en lógica) */}
      {modalEdicion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Editar Tarea</h2>
                <p className="text-xs text-gray-500">#{tareaEditando?.id} • {tareaEditando?.usuario?.name}</p>
              </div>
              <button onClick={cerrarModalEdicion} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <button
                onClick={cerrarModalEdicion}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                disabled={cargandoEdicion}
              >
                Cancelar
              </button>
              <button
                onClick={actualizarTarea}
                disabled={cargandoEdicion}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {cargandoEdicion ? (
                  <><div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Guardando...</>
                ) : (
                  <><Save className="w-4 h-4" /> Guardar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}