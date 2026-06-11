import { useEffect } from "react";
import PropTypes from "prop-types";
import { useGetByIdImpuesto } from "../../hooks/contabilidad/useGetByIdImpuesto";
import { useRegisterImpuesto } from "../../hooks/contabilidad/useRegisterImpuesto";

export default function CreateImpuestos({ forma = null, onClose }) {
  const { setImpuesto, impuesto, loading, error, handleChange, handleSubmit, handleUpdate } = useRegisterImpuesto();
  const { impuesto: impuestoById } = useGetByIdImpuesto(forma?.id);

  useEffect(() => {
    if (impuestoById) {
      setImpuesto({
        nombre: impuestoById.nombre,
        porcentaje: impuestoById.porcentaje,
        operacion: impuestoById.operacion || "suma",
      });
    }
  }, [impuestoById, setImpuesto]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (impuestoById?.id) {
      await handleUpdate(impuestoById.id);
    } else {
      await handleSubmit(e);
    }
    if (onClose) onClose();
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-800">
          {impuestoById?.id ? "Editar Impuesto" : "Nuevo Impuesto"}
        </h2>
        <p className="text-xs text-gray-500">Administración de tasas fiscales</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
        {/* Campo Nombre */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            Nombre del Impuesto
          </label>
          <input
            type="text"
            name="nombre"
            placeholder="Ej. IVA"
            className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              error?.nombre ? "border-red-400" : "border-gray-200 focus:border-blue-500"
            }`}
            value={impuesto.nombre}
            onChange={handleChange}
            required
          />
          {error?.nombre && (
            <p className="mt-1 text-[10px] text-red-500 font-medium">{error.nombre[0]}</p>
          )}
        </div>

        {/* Campo Porcentaje */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            Porcentaje (%)
          </label>
          <div className="relative">
            <input
              type="number"
              name="porcentaje"
              placeholder="0.000000"
              step="0.000001"
              className={`w-full pl-3 pr-8 py-2 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                error?.porcentaje ? "border-red-400" : "border-gray-200 focus:border-blue-500"
              }`}
              value={impuesto.porcentaje}
              onChange={handleChange}
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
          {error?.porcentaje && (
            <p className="mt-1 text-[10px] text-red-500 font-medium">{error.porcentaje[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            Operación en la factura
          </label>
          <select
            name="operacion"
            value={impuesto.operacion}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              error?.operacion ? "border-red-400" : "border-gray-200 focus:border-blue-500"
            }`}
          >
            <option value="suma">Suma al total</option>
            <option value="resta">Resta del total</option>
          </select>
          {error?.operacion && (
            <p className="mt-1 text-[10px] text-red-500 font-medium">{error.operacion[0]}</p>
          )}
        </div>

        {/* Acciones */}
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando
              </span>
            ) : (
              impuestoById?.id ? "Actualizar" : "Crear Impuesto"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

CreateImpuestos.propTypes = {
  forma: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onClose: PropTypes.func,
};
