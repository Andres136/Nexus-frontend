import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import {
  ChevronDown, ChevronUp, Calendar, User, Edit3, X, Save,
  Clock, PlayCircle, AlertCircle, Search
} from "lucide-react";
import { BsListTask } from "react-icons/bs";
import { SoportesTarea } from "./SoportesTarea";

export default function Tareas() {

  const [tareas, setTareas] = useState([]);
  const [actualizar, setActualizar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [tareasExpandidas, setTareasExpandidas] = useState(new Set());

  const [modalEdicion, setModalEdicion] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha_fin: ""
  });

  const [cargandoEdicion, setCargandoEdicion] = useState(false);

  const { user } = useAuth({ middleware: "auth" });

  /*
  =====================================
  OBTENER TAREAS
  =====================================
  */

  const obtenerTareas = async () => {
    const token = localStorage.getItem("token");
    try {
      const params = new URLSearchParams();
      if (busqueda.trim() !== "") {
        params.append("usuario", busqueda.trim());
      }
      const response = await clienteAxios.get(
        `/api/tareas?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTareas(response.data);
    } catch (error) {
      console.log("Error al obtener tareas", error);
      setTareas([]);
    }
  };

  /*
  =====================================
  AGRUPAR TAREAS
  =====================================
  */

  const tareasAgrupadas = useMemo(() => {
    const grupos = {
      vencidas: [],
      pendientes: [],
      enCurso: []
    };

    tareas.forEach(tarea => {
      const fechaLimite = tarea.fecha_fin ? new Date(tarea.fecha_fin) : null;
      const esVencida = fechaLimite && fechaLimite < new Date() && tarea.estado_id === 1;

      if (esVencida) grupos.vencidas.push(tarea);
      else if (tarea.estado_id === 1) grupos.pendientes.push(tarea);
      else if (tarea.estado_id === 5) grupos.enCurso.push(tarea);
    });

    return grupos;
  }, [tareas]);

  const esVencida = (tarea) => {
  const fechaLimite = tarea.fecha_fin ? new Date(tarea.fecha_fin) : null;
  return fechaLimite && fechaLimite < new Date();
};

  /*
  =====================================
  COLUMNAS KANBAN
  =====================================
  */

  const columnas = [
    {
      id: "vencidas",
      titulo: "Vencidas",
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      bgCard: "bg-gradient-to-br from-red-50 to-rose-50",
      borderAccent: "border-l-red-500",
      badgeBg: "bg-red-500",
      tareas: tareasAgrupadas.vencidas
    },
    {
      id: "pendientes",
      titulo: "Pendientes",
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgCard: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderAccent: "border-l-amber-500",
      badgeBg: "bg-amber-500",
      tareas: tareasAgrupadas.pendientes
    },
    {
      id: "enCurso",
      titulo: "En Curso",
      icon: PlayCircle,
      gradient: "from-blue-500 to-indigo-600",
      bgCard: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderAccent: "border-l-blue-500",
      badgeBg: "bg-blue-500",
      tareas: tareasAgrupadas.enCurso
    }
  ];

  /*
  =====================================
  CAMBIAR ESTADO
  =====================================
  */

  const cambiarEstado = async (id, estado_id) => {
  const token = localStorage.getItem("token");

  try {
    let nuevoEstado = estado_id;

    // 👉 SI está pendiente → cualquiera puede iniciar
    if (estado_id === 1) {
      nuevoEstado = 5;
    }

    // 👉 SI está en curso → SOLO ADMIN puede completar
    else if (estado_id === 5) {
      if (user?.role_id !== 1) {
        toast.error("No tienes permiso para completar esta tarea");
        return;
      }
      nuevoEstado = 2;
    }

    await clienteAxios.patch(
      `/api/tareas/estado/${id}`,
      { estado_id: nuevoEstado },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Estado actualizado");
    setActualizar(!actualizar);

  } catch {
    toast.error("Error al actualizar estado");
  }
};

  /*
  =====================================
  EXPANDIR TAREA
  =====================================
  */

  const toggleTareaExpandida = (id) => {
    const nuevas = new Set(tareasExpandidas);
    if (nuevas.has(id)) nuevas.delete(id);
    else nuevas.add(id);
    setTareasExpandidas(nuevas);
  };

  /*
  =====================================
  EDITAR TAREA
  =====================================
  */

  const abrirModalEdicion = (tarea) => {
    setTareaEditando(tarea);
    setFormData({
      nombre: tarea.nombre,
      descripcion: tarea.descripcion,
      fecha_fin: tarea.fecha_fin?.split("T")[0] || ""
    });
    setModalEdicion(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicion(false);
    setTareaEditando(null);
  };

  /*
  =====================================
  ACTUALIZAR TAREA
  =====================================
  */

  const actualizarTarea = async () => {
    const token = localStorage.getItem("token");
    try {
      setCargandoEdicion(true);
      await clienteAxios.put(
        `/api/tareas/update/${tareaEditando.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Tarea actualizada");
      cerrarModalEdicion();
      setActualizar(!actualizar);
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setCargandoEdicion(false);
    }
  };

  /*
  =====================================
  FORMATEAR FECHA
  =====================================
  */

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short"
    });
  };

  /*
  =====================================
  USE EFFECT
  =====================================
  */

  useEffect(() => {
    obtenerTareas();
  }, [actualizar, busqueda]);

  /*
  =====================================
  TARJETA KANBAN
  =====================================
  */

  const TarjetaKanban = ({ tarea, borderAccent }) => {
    TarjetaKanban.propTypes = { tarea: PropTypes.object.isRequired, borderAccent: PropTypes.string };
    const fechaLimite = tarea.fecha_fin ? new Date(tarea.fecha_fin) : null;
    const expandida = tareasExpandidas.has(tarea.id);
    const vencida = esVencida(tarea);
     const colorAcento = vencida ? "border-l-red-500" : borderAccent;

    return (
      <div 
        className={`
          bg-white rounded-xl border-l-4 ${colorAcento} 
          shadow-sm hover:shadow-md transition-all duration-200
          overflow-hidden
        `}
      >
        {/* Header clickeable */}
        <div 
          onClick={() => toggleTareaExpandida(tarea.id)}
          className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-800 text-sm truncate">
                  {tarea.nombre}
                </h4>
                {expandida ? (
                  <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                )}
              </div>

              {/* Info compacta */}
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <User size={12} className="text-gray-400" />
                  {tarea.usuario?.name || "Sin asignar"}
                </span>

                {fechaLimite && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} className="text-gray-400" />
                    {formatearFecha(fechaLimite)}
                  </span>
                )}
              </div>
            </div>

            {/* Botón editar */}
            {(user?.role_id === 1 ) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  abrirModalEdicion(tarea);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Contenido expandible */}
        <div className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${expandida ? "max-h-96" : "max-h-0"}
        `}>
          <div className="px-4 pb-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              {tarea.descripcion || "Sin descripción"}
            </p>

            <SoportesTarea tareaId={tarea.id} />

            {tarea.estado_id !== 2 && (
              <button
                onClick={() => cambiarEstado(tarea.id, tarea.estado_id)}
                className={`
                  w-full mt-4 py-2.5 text-sm font-medium rounded-lg
                  transition-all duration-200
                  ${tarea.estado_id === 1 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25" 
                    : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/25"
                  }
                `}
              >
              {tarea.estado_id === 1 
  ? "Iniciar Tarea" 
  : user?.role_id === 1 
    ? "Marcar Completada" 
    : "En proceso"
}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /*
  =====================================
  COLUMNA
  =====================================
  */

  const Columna = ({ col }) => {
    const Icon = col.icon;

    return (
      <div className="flex flex-col">
        {/* Header columna */}
        <div className={`
          bg-gradient-to-r ${col.gradient} 
          rounded-t-2xl p-4 shadow-lg
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">
                {col.titulo}
              </h3>
            </div>
            <span className={`
              px-3 py-1 rounded-full text-sm font-bold
              bg-white/20 text-white backdrop-blur-sm
            `}>
              {col.tareas.length}
            </span>
          </div>
        </div>

        {/* Lista de tareas */}
        <div className={`
          ${col.bgCard} rounded-b-2xl p-3 
          min-h-[200px] max-h-[calc(100vh-280px)] 
          overflow-y-auto space-y-3
          border border-t-0 border-gray-200/50
        `}>
          {col.tareas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Icon size={40} strokeWidth={1.5} className="mb-3 opacity-40" />
              <p className="text-sm">Sin tareas</p>
            </div>
          ) : (
            col.tareas.map(t => (
              <TarjetaKanban 
                key={t.id} 
                tarea={t} 
                borderAccent={col.borderAccent}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  /*
  =====================================
  RENDER
  =====================================
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                <BsListTask size={26} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-2xl text-gray-800">
                  Gestión de Tareas
                </h1>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {tareas.length} tareas activas
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="
                  w-72 pl-11 pr-4 py-3
                  bg-gray-50 border border-gray-200 rounded-xl
                  text-sm placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                  transition-all duration-200
                "
              />
            </div>

          </div>
        </div>
      </div>

      {/* Tablero Kanban */}
      <div className="p-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {columnas.map(col => (
            <Columna key={col.id} col={col} />
          ))}
        </div>
      </div>

      {/* Modal Edición */}
      {modalEdicion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Editar Tarea</h3>
                <button 
                  onClick={cerrarModalEdicion}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={cerrarModalEdicion}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={actualizarTarea}
                disabled={cargandoEdicion}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {cargandoEdicion ? "Guardando..." : "Guardar"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}