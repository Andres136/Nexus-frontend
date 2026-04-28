import { useRegisterSeguimientoHallazgo } from "../../hooks/calidad/useRegisterSeguimientoHallazgo";
import { useGetByIdSeguimientoHallazgo } from "../../hooks/calidad/useGetByIdSeguimientoHallazgo";

export function SeguimientoHallazgo({ hallazgoId }) {
  const { formData, handleChange, handleSubmit, loading, error } = useRegisterSeguimientoHallazgo(hallazgoId);
  const { data: seguimientoData, isLoading: seguimientoLoading } = useGetByIdSeguimientoHallazgo(hallazgoId);

  return (
    <div className="mt-4 border-t pt-4 max-w-2xl">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
        Seguimiento del Hallazgo
      </h4>

      {/* FORMULARIO COMPACTO */}
      <form onSubmit={handleSubmit} className="relative mb-6">
        <textarea
          name="observacion"
          value={formData.observacion}
          onChange={handleChange}
          placeholder="Escribir un nuevo seguimiento..."
          className="w-full p-3 pr-32 border rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[60px] resize-none"
        />
        <div className="absolute right-2 bottom-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Comentar"}
          </button>
        </div>
        {error?.observacion && (
          <p className="text-red-500 text-[10px] mt-1 ml-1">{error.observacion}</p>
        )}
      </form>

      {/* HISTORIAL ESTILO TIMELINE */}
      <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
        {seguimientoLoading ? (
          <p className="text-xs text-slate-400">Cargando...</p>
        ) : seguimientoData?.length > 0 ? (
          seguimientoData.map((seg) => (
            <div key={seg.id} className="relative">
              {/* Punto del timeline */}
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">
                    {seg.usuario?.name || "Usuario"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium italic">
                    {seg.fecha}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-snug">
                  {seg.observacion}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic">Sin registros.</p>
        )}
      </div>
    </div>
  );
}