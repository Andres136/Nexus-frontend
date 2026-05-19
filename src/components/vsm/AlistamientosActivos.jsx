import { FaPause, FaPlay } from "react-icons/fa";
import { useAlistamientosActivos } from "../../hooks/vsm/useAlistamientoActivos";
import { vsmProduccionService, vsmService } from "../../services/vsm";
import { toast } from "react-toastify";
import { useAlistamientos } from "../../hooks/vsm/useAlistamiento";
import { 
  Clock,  Package,Play, Pause, 
  Square, Timer,  Plus, ChevronDown, ChevronUp, CheckCircle2, 
  Trash2
} from "lucide-react";
import Swal from "sweetalert2";
import { useState } from "react";
import Select from "react-select";
import {useSedes} from "../../hooks/useSedes";

export default function AlistamientosActivos() {
  const { alistamientos, loading, refresh,  } = useAlistamientosActivos();
  const { pausar, reanudar, finalizar } = useAlistamientos();
  const { sedes } = useSedes();
const [sedeSeleccionada, setSedeSeleccionada] = useState("");

  const handlePausa = async (alistId) => {
    const { value: razon } = await Swal.fire({
      title: "Pausar alistamiento",
      text: "Describe el motivo de la pausa",
      input: "text",
      inputPlaceholder: "Motivo...",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      confirmButtonColor: "#d97706",
      inputValidator: (value) => !value && "Debes escribir un motivo."
    });
    if (razon) { await pausar(alistId, razon); refresh(sedeSeleccionada ? { sede_id: sedeSeleccionada } : {}); }
  };

  const handleReanudar = async (alistId) => {
    const res = await Swal.fire({
      title: "¿Reanudar alistamiento?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, reanudar",
      confirmButtonColor: "#16a34a",
    });
    if (res.isConfirmed) { await reanudar(alistId); refresh(sedeSeleccionada ? { sede_id: sedeSeleccionada } : {}); }
  };

  const handleFinalizar = async (alistId) => {
    const res = await Swal.fire({
      title: "¿Finalizar alistamiento?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, finalizar",
      confirmButtonColor: "#dc2626",
    });
    if (res.isConfirmed) {
      const data = await finalizar(alistId);
      toast.success(data.message || "Alistamiento finalizado");
      refresh(sedeSeleccionada ? { sede_id: sedeSeleccionada } : {});
    }
  };

  const handlePausaSede = async () => {
    
  const { value: razon } = await Swal.fire({
    title: "Pausar TODA la sede",
    text: "Esto pausará TODAS las órdenes activas",
    input: "text",
    inputPlaceholder: "Motivo de la pausa...",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, pausar todo",
    confirmButtonColor: "#dc2626",
    inputValidator: (value) => !value && "Debes escribir un motivo."
  });

  if (!razon) return;

  try {
     const response = await vsmProduccionService.postPausarProduccion({
      razon
      // ❌ NO mandes sede_id (ya lo definimos backend)
    });
  
    toast.success(response.data.message);

    refresh(sedeSeleccionada ? { sede_id: sedeSeleccionada } : {});

  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      "Error al pausar la sede";

    toast.error(msg);
  }
};

const handleReanudarSede = async () => {

  const res = await Swal.fire({
    title: "Reanudar TODA la sede",
    text: "Se reactivarán todas las órdenes pausadas",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, reanudar",
    confirmButtonColor: "#16a34a"
  });

  if (!res.isConfirmed) return;

  try {
    const response = await vsmProduccionService.postReanudarProduccion();

    toast.success(response.data.message);

    // 🔥 IMPORTANTE
    setSedeSeleccionada("");
    refresh();

  } catch (e) {
    toast.error(e?.response?.data?.message || "Error al reanudar");
  }
};

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 gap-3">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-500 font-medium">Cargando operaciones...</span>
    </div>
  );

  return (
    <div className="space-y-6 p-4">
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

  {/* IZQUIERDA */}
  <div className="flex items-center gap-3">
    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg">
      <Clock className="w-5 h-5" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800">Alistamientos Activos</h2>
    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">
      {alistamientos.length}
    </span>
  </div>
<button
  onClick={handlePausaSede}
  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700"
>
  ⛔ Pausar toda la sede
</button>

<button
  onClick={handleReanudarSede}
  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
>
  ▶️ Reanudar toda la sede
</button>
  {/* 🔥 SELECT SEDE */}
  <div className="flex items-center gap-2">
    <select
      value={sedeSeleccionada}
      onChange={(e) => {
        setSedeSeleccionada(e.target.value);
        refresh({ sede_id: e.target.value }); // 🔥 aquí llamas filtro
      }}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Mi sede</option>
      {sedes?.map(s => (
        <option key={s.id} value={s.id}>
          {s.nombre}
        </option>
      ))}
    </select>
  </div>

</div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {alistamientos.map((alist) => (
          <AlistamientoCard 
            key={alist.id} 
            alist={alist}
            onUpdate={() => refresh(sedeSeleccionada ? { sede_id: sedeSeleccionada } : {})}
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
  const [activeUserPanel, setActiveUserPanel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuariosDisp, setUsuariosDisp] = useState([]);
  const [usuarioSel, setUsuarioSel] = useState("");
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [guardando, setGuardando] = useState(false);

 const formatTime = (seg) => {
  const safe = Math.max(0, Math.floor(Number(seg) || 0));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${h}h ${m}m ${s}s`;
};



  const abrirModalUsuarios = async () => {
    setLoadingUsuarios(true);
    setModalOpen(true);
    setUsuarioSel("");
    try {
      const response = await vsmService.usuariosDisponibles(alist.id);
      setUsuariosDisp(response.data);
      if (response.data.length === 0) toast.info("No hay usuarios disponibles");
    } catch {
      toast.error("Error al cargar usuarios");
      setModalOpen(false);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleConfirmarUsuario = async () => {
    if (!usuarioSel) return toast.warning("Selecciona un usuario");
    setGuardando(true);
    try {
      await vsmService.agregarUsuario(alist.id, { usuario_id: usuarioSel });
      toast.success("Usuario agregado");
      setModalOpen(false);
      onUpdate();
    } catch {
      toast.error("Error al agregar usuario");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* HEADER */}
      <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 border-b">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Orden Trabajo</span>
            <h3 className="font-black text-gray-900 text-lg leading-tight">#{alist.orden_trabajo_id}</h3>
            <p className="text-xs text-gray-500 truncate w-40">{alist.cliente?.nombre}</p>
          </div>
          <div className={`px-2 py-1 rounded-md   text-[10px] font-bold border ${
            alist.estado === 'PAUSADO' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'
          }`}>
            {alist.estado}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Timer className="w-4 h-4 text-blue-600" />
          <span className="font-mono font-bold text-sm">{formatTime(alist.segundos_transcurridos)}</span>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[450px]">
        {/* RESUMEN PRODUCTOS (Solo Lectura) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <Package className="w-3 h-3" />
            <h4 className="text-[10px] font-bold uppercase">Estado de Productos</h4>
          </div>
          {alist.detalles.map(d => (
            <div key={d.id} className="flex justify-between text-[11px] bg-gray-50 p-1.5 rounded">
              <span className="truncate pr-2">{d.product}</span>
              <span className="font-mono font-bold">{d.alistada}/{d.programada}</span>
            </div>
          ))}
        </div>

        {/* LISTA DE USUARIOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase text-gray-400">Personal & Producción</h4>
            <button onClick={abrirModalUsuarios} className="text-blue-600 hover:text-blue-800 text-[10px] font-bold flex items-center gap-1">
              <Plus className="w-3 h-3" /> AGREGAR
            </button>
          </div>
          
          {alist.usuarios.map(u => (
            <div key={u.id} className="border rounded-xl bg-white overflow-hidden">
              <UsuarioRow 
                usuario={u} 
                alistId={alist.id} 
                onUpdate={onUpdate}
                isExpanded={activeUserPanel === u.id}
                onToggle={() => setActiveUserPanel(activeUserPanel === u.id ? null : u.id)}
              />
              
              {activeUserPanel === u.id && (
                <div className="bg-slate-50 border-t p-3 animate-in fade-in duration-200">
                  <ProductionForm 
                    usuario={u} 
                    detalles={alist.detalles} 
                    alistId={alist.id} 
                    onUpdate={onUpdate} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER ACCIONES */}
      <div className="p-3 bg-gray-50 border-t grid grid-cols-3 gap-2">
        <button onClick={() => onPausa(alist.id)} disabled={alist.estado === 'PAUSADO'} className="flex flex-col items-center py-2 rounded-lg bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 disabled:opacity-40">
          <Pause size={14} /><span className="text-[9px] font-bold mt-1">PAUSAR</span>
        </button>
        <button onClick={() => onReanudar(alist.id)} disabled={alist.estado !== 'PAUSADO'} className="flex flex-col items-center py-2 rounded-lg bg-white border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-40">
          <Play size={14} /><span className="text-[9px] font-bold mt-1">REANUDAR</span>
        </button>
        <button onClick={() => onFinalizar(alist.id)} className="flex flex-col items-center py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
          <Square size={14} /><span className="text-[9px] font-bold mt-1 text-white">FINALIZAR</span>
        </button>

      </div>

      {/* MODAL AGREGAR USUARIO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-800">Agregar operario</h3>
            <p className="text-xs text-gray-400">Orden #{alist.orden_trabajo_id}</p>

            {loadingUsuarios ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
          <Select
  options={usuariosDisp.map(u => ({
    value: u.id,
    label: u.name
  }))}

  placeholder="Selecciona un operario"

  value={
    usuariosDisp
      .map(u => ({
        value: u.id,
        label: u.name
      }))
      .find(option => option.value == usuarioSel) || null
  }

  onChange={(selectedOption) => {
    setUsuarioSel(selectedOption?.value || "");
  }}

  isSearchable
  isClearable

  className="text-sm"

  styles={{
    control: (base, state) => ({
      ...base,
      minHeight: 45,
      borderRadius: 12,
      borderColor: state.isFocused
        ? "#3b82f6"
        : "#d1d5db",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(59,130,246,0.2)"
        : "none",

      "&:hover": {
        borderColor: "#3b82f6"
      }
    }),

    menu: (base) => ({
      ...base,
      borderRadius: 12,
      overflow: "hidden",
      zIndex: 9999
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? "#eff6ff"
        : "#fff",

      color: state.isSelected
        ? "#fff"
        : "#111827",

      cursor: "pointer",
      fontSize: 14
    }),
  }}
/>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarUsuario}
                disabled={guardando || !usuarioSel}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsuarioRow({ usuario, alistId, onUpdate, isExpanded, onToggle }) {
  const toggleEstado = async (e) => {
    e.stopPropagation(); // Evitar que abra el panel de producción al hacer clic en el botón
    try {



  
      if (usuario.estado === "PAUSADO") {
        const res = await Swal.fire({
          title: "Reanudar usuario",
          text: `¿Reanudar a ${usuario.name}?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#16a34a"
        });
        if (res.isConfirmed) { await vsmService.reanudarUsuario(alistId, usuario.id); onUpdate(); }
      } else {
        const { value: razon } = await Swal.fire({
          title: "Pausar usuario",
          input: "text",
          inputPlaceholder: "Motivo de la pausa...",
          showCancelButton: true,
          inputValidator: (value) => !value && "Requerido"
        });
        if (razon) { await vsmService.pausarUsuario(alistId, usuario.id, { razon }); onUpdate(); }
      }
    } catch (e) { toast.error("Error al cambiar estado"); }
  };
const formatUserTime = (seg) => {
  const safe = Math.max(0, Math.floor(Number(seg) || 0));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${h}h ${m}m ${s}s`;
};


    const eliminarUsuario = async (e) => {
  e.stopPropagation();

  const res = await Swal.fire({
    title: "Eliminar usuario",
    text: `¿Eliminar a ${usuario.name}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    confirmButtonColor: "#dc2626"
  });

  if (!res.isConfirmed) return;

  try {
    await vsmService.eliminarUsuario(alistId, usuario.id);
    toast.success("Usuario eliminado");
    onUpdate();
  } catch (e) {
    toast.error("Error al eliminar");
  }
};
  return (
    <div 
      onClick={onToggle}
      className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full ${usuario.estado === 'PAUSADO' ? 'bg-amber-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{usuario.name}</p>
       <p className="text-[10px] text-gray-400 font-mono">
  Tiempo: {formatUserTime(usuario.segundos_usuario)}
</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleEstado}
          className={`p-2 rounded-lg transition-colors ${usuario.estado === 'PAUSADO' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}
        >
          {usuario.estado === 'PAUSADO' ? <FaPlay size={10} /> : <FaPause size={10} />}
        </button>
        {isExpanded ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}


        <button 
  onClick={eliminarUsuario}
  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
>
  <Trash2 size={10} />
</button>
      </div>
    </div>
  );
}

function ProductionForm({ usuario, detalles, alistId, onUpdate }) {
  const [vals, setVals] = useState({});

  const handleRegister = async (detalleId) => {
    const data = vals[detalleId] || {};
    const total = (Number(data.paq) || 0) * (Number(data.und) || 0);

    if (total <= 0) return toast.warning("Ingresa cantidades");

    try {
      await vsmProduccionService.registerProduccion({
        alistamiento_id: alistId,
        usuario_id: usuario.id,
        detalle_id: detalleId,
        cantidad_alistada: total
      });
      toast.success(`+${total} para ${usuario.name}`);
      setVals({ ...vals, [detalleId]: { paq: '', und: '' } });
      onUpdate();
    } catch (e) {
      console.log(e);
     const msg =
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    "Error al registrar";

  toast.error(msg);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Panel de Producción</p>
      {detalles.map(d => {
        const subtotal = (Number(vals[d.id]?.paq || 0) * Number(vals[d.id]?.und || 0));
        return (
          <div key={d.id} className="bg-white border rounded-lg p-2 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-gray-700 truncate w-32">{d.product}</span>
          
            </div>
            <div className="flex gap-1">
              <input 
                type="number" placeholder="Paq" 
                className="w-full text-xs p-1.5 border rounded"
                value={vals[d.id]?.paq || ''}
                onChange={e => setVals({...vals, [d.id]: {...vals[d.id], paq: e.target.value}})}
              />
              <input 
                type="number" placeholder="Und" 
                className="w-full text-xs p-1.5 border rounded"
                value={vals[d.id]?.und || ''}
                onChange={e => setVals({...vals, [d.id]: {...vals[d.id], und: e.target.value}})}
              />
              <button 
                onClick={() => handleRegister(d.id)}
                className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700 flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 size={14} />
                {subtotal > 0 && <span className="text-[10px] font-bold">{subtotal}</span>}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}