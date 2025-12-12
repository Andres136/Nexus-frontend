import { FaPause, FaPlay } from "react-icons/fa";
import { useAlistamientosActivos } from "../../hooks/vsm/useAlistamientoActivos";
import { vsmService } from "../../services/vsm";
import { toast } from "react-toastify";
import { useAlistamientos } from "../../hooks/vsm/useAlistamiento";
import { 
  Clock, 
  Users, 
  Package, 
  Building2, 
  Play, 
  Pause, 
  Square,
  Timer,
  User,

} from "lucide-react";
import Swal from "sweetalert2";
import VsmDashboard from "./VsmDashboard";

export default function AlistamientosActivos() {
  const { alistamientos, loading, refresh } = useAlistamientosActivos();
  const { pausar, reanudar, finalizar } = useAlistamientos();

  // -------------------------------------------------------------------
  // 4. PAUSAR / REANUDAR / FINALIZAR
  // -------------------------------------------------------------------
 const handlePausa = async (alistId) => {
  const { value: razon } = await Swal.fire({
    title: "Pausar alistamiento",
    text: "Describe el motivo de la pausa",
    input: "text",
    inputPlaceholder: "Motivo...",
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d97706", // Amarillo
    cancelButtonColor: "#6b7280", // Gris
    inputValidator: (value) => {
      if (!value) {
        return "Debes escribir un motivo.";
      }
    }
  });

  if (!razon) return;

  await pausar(alistId, razon);
  refresh();
};
const handleReanudar = async (alistId) => {
  await Swal.fire({
    title: "¿Reanudar alistamiento?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, reanudar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#16a34a", // Verde
    cancelButtonColor: "#6b7280",
  });

  await reanudar(alistId);
  refresh();
};


  const handleFinalizar = async (alistId) => {
    const data = await finalizar(alistId);
   toast.success(data.message || "Alistamiento finalizado");
    refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Cargando alistamientos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ✅ Header compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Alistamientos Activos</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {alistamientos.length}
          </span>
        </div>
      </div>

      {alistamientos.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500">No hay alistamientos activos</p>
        </div>
      )}

      {/* ✅ Grid de 4 columnas responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {alistamientos.map((alist) => (
          <AlistamientoCard 
            key={alist.id} 
            alist={alist}
            onUpdate={refresh} 
            onPausa={handlePausa}
            onReanudar={handleReanudar}
            onFinalizar={handleFinalizar}
          />
        ))}
      </div>
    </div>
  );
}

function AlistamientoCard({ alist, onUpdate, onPausa, onReanudar, onFinalizar }) {
  const formatTime = (seg) => {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const s = seg % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // ✅ Función para determinar color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'INICIADO':
      case 'REANUDADO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PAUSADO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      
      {/* ✅ Header compacto con estado */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Package className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">OT #{alist.orden_trabajo_id}</span>
            <span className="text-xs text-gray-500">{alist.cliente?.nombre}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(alist.estado)}`}>
            {alist.estado}
          </span>
        </div>

        {/* ✅ Info principal compacta */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Building2 className="w-3 h-3" />
            <span>{alist.sede?.nombre ?? "Sin sede"}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Timer className="w-3 h-3 text-blue-600" />
            <span className="font-semibold text-sm text-gray-900">
              {formatTime(alist.segundos_transcurridos)}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ Contenido compacto */}
      <div className="p-4 space-y-4">
        
        {/* Usuarios compactos */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h4 className="font-medium text-sm text-gray-900">
              Usuarios ({alist.usuarios.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {alist.usuarios.map((u) => (
              <UsuarioRow
                key={u.id}
                usuario={u}
                alistId={alist.id}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>

        {/* Productos compactos */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-green-600" />
            <h4 className="font-medium text-sm text-gray-900">
              Productos ({alist.detalles.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {alist.detalles.map((d, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
                <div className="font-medium text-xs text-gray-900 mb-1 truncate" title={d.producto}>
                  {d.producto}
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className="text-center">
                    <div className="text-gray-500">Prog.</div>
                    <div className="font-medium">{d.programada}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600">Alist.</div>
                    <div className="font-medium">{d.alistada}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600">Falt.</div>
                    <div className="font-medium">{d.faltante}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Botones de acción compactos */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onPausa(alist.id)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium transition-colors"
            disabled={alist.estado === 'PAUSADO'}
          >
            <Pause className="w-3 h-3" />
            Pausar
          </button>
          
          <button
            onClick={() => onReanudar(alist.id)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
            disabled={alist.estado === 'INICIADO' || alist.estado === 'REANUDADO'}
          >
            <Play className="w-3 h-3" />
            Reanudar
          </button>
          
          <button
            onClick={() => onFinalizar(alist.id)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
          >
            <Square className="w-3 h-3" />
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}

function UsuarioRow({ usuario, alistId, onUpdate }) {
const toggleEstado = async () => {
  try {
    // --------------------------------------------
    // SI ESTÁ PAUSADO → REANUDAR DIRECTO
    // --------------------------------------------
    if (usuario.estado === "PAUSADO") {

      const confirm = await Swal.fire({
        title: "Reanudar usuario",
        text: `¿Deseas reanudar a ${usuario.name}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, reanudar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#6b7280",
      });

      if (!confirm.isConfirmed) return;

      await vsmService.reanudarUsuario(alistId, usuario.id);
      onUpdate();
      return;
    }

    // --------------------------------------------
    // SI ESTÁ EN PROGRESO → PAUSAR (REQUIERE RAZÓN)
    // --------------------------------------------

    const { value: razon } = await Swal.fire({
      title: "Pausar usuario",
      text: `Ingresa el motivo de la pausa para ${usuario.name}:`,
      input: "text",
      inputPlaceholder: "Motivo...",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#6b7280",
      inputValidator: (value) => {
        if (!value) {
          return "Debes ingresar un motivo para pausar.";
        }
      }
    });

    if (!razon) return;

    await vsmService.pausarUsuario(alistId, usuario.id, { razon });
    onUpdate();

  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    toast.error("No se pudo cambiar el estado del usuario");
  }
};


  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-1 rounded-full">
            <User className="w-3 h-3 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm text-gray-900 truncate">
              {usuario.name}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                usuario.estado === "PAUSADO" 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {usuario.estado ?? "ACTIVO"}
              </span>
              <span className="text-gray-500">
                {usuario.segundos_usuario}s
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={toggleEstado}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-white text-xs font-medium transition-colors ${
          usuario.estado === "PAUSADO" 
            ? "bg-green-600 hover:bg-green-700" 
            : "bg-yellow-600 hover:bg-yellow-700"
        }`}
      >
        {usuario.estado === "PAUSADO" ? (
          <>
            <FaPlay className="w-2 h-2" />
            <span className="hidden sm:inline">Reanudar</span>
          </>
        ) : (
          <>
            <FaPause className="w-2 h-2" />
            <span className="hidden sm:inline">Pausar</span>
          </>
        )}
      </button>

 
    </div>
  );
}