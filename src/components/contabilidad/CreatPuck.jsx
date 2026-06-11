import { useEffect } from "react";
import { useGetByIdPuck } from "../../hooks/contabilidad/useGetByIdPuck";
import { useRegisterPuck } from "../../hooks/contabilidad/useRegisterPuck";
import { Loader2, Hash, BookOpen } from "lucide-react";
import PropTypes from "prop-types";

export default function CreatPuck({ puck = null, onClose }) {
  const {
    puck: puckState,
    setPuck,
    loading,
    handleChange,
    handleSubmit,
    handleUpdate,
  } = useRegisterPuck();

  const { puck: puckById } = useGetByIdPuck(puck?.id);

  useEffect(() => {
    if (puck?.id && puckById) {
      setPuck({
        nombre: puckById.nombre,
        numero: puckById.numero,
        naturaleza: puckById.naturaleza ?? "",
        descripcion: puckById.descripcion ?? "",
        dinamica: puckById.dinamica ?? "",
        permite_movimiento: puckById.permite_movimiento,
        activo: puckById.activo,
      });
    }
  }, [puck, puckById, setPuck]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    let success;
    if (puck?.id) {
      success = await handleUpdate(puck.id);
    } else {
      success = await handleSubmit(e);
    }
    
    if (success && onClose) onClose();
  };

  return (
  // Contenedor principal: p-5 en lugar de p-6 o p-8
<div className="w-full mx-auto bg-white p-5 ">
  
  {/* Header: margen inferior reducido */}
  <div className="mb-4">
    <h2 className="text-lg font-bold text-gray-800 leading-tight">
      {puck?.id ? "Editar Cuenta PUCK" : "Nueva Cuenta PUCK"}
    </h2>
    <p className="text-[11px] text-gray-500">
      Ingresa el código y nombre contable.
    </p>
  </div>

  <form onSubmit={handleSubmitForm} className="space-y-3">
    {/* Campo Número */}
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
        <Hash size={12} className="text-blue-500" />
        Número
      </label>
      <input
        type="text"
        name="numero"
        placeholder="Ej. 110505"
        // py-1.5 lo hace más delgado
        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        value={puckState.numero}
        onChange={handleChange}
        required
      />
    </div>

    {/* Campo Nombre */}
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
        <BookOpen size={12} className="text-blue-500" />
        Nombre
      </label>
      <input
        type="text"
        name="nombre"
        placeholder="Ej. Caja General"
        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        value={puckState.nombre}
        onChange={handleChange}
        required
      />
    </div>

    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
        Naturaleza
      </label>
      <select
        name="naturaleza"
        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500"
        value={puckState.naturaleza}
        onChange={handleChange}
      >
        <option value="">Sin definir</option>
        <option value="debito">Débito</option>
        <option value="credito">Crédito</option>
      </select>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          Descripción
        </label>
        <textarea
          name="descripcion"
          rows="3"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-none"
          value={puckState.descripcion}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          Dinámica
        </label>
        <textarea
          name="dinamica"
          rows="3"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-none"
          value={puckState.dinamica}
          onChange={handleChange}
        />
      </div>
    </div>

    <div className="flex flex-wrap gap-5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
      <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
        <input
          type="checkbox"
          name="permite_movimiento"
          checked={puckState.permite_movimiento}
          onChange={handleChange}
        />
        Permite movimiento
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
        <input
          type="checkbox"
          name="activo"
          checked={puckState.activo}
          onChange={handleChange}
        />
        Cuenta activa
      </label>
    </div>

    {/* Acciones: mt-2 para pegarlo más al contenido */}
    <div className="pt-2 flex items-center gap-2">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Cancelar
      </button>
      
      <button
        type="submit"
        disabled={loading}
        className="flex-[1.5] px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : puck?.id ? "Actualizar" : "Guardar"}
      </button>
    </div>
  </form>
</div>
  );
}

CreatPuck.propTypes = {
  puck: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onClose: PropTypes.func,
};
