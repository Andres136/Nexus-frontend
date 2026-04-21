import { useEffect } from "react";
import { useRegisterFormaspago } from "../../hooks/contabilidad/useRegisterFormaspago";
import { useGetByIdFormasPago } from "../../hooks/contabilidad/useGetByIdFormasPago";
import NexusLoader from "../NexusLoader";

export default function CreatFormasPago({ forma = null, onClose }) {
  const { formaPago, loading, error, handleSubmit, handleChange, handleUpdate } = useRegisterFormaspago();
  const { formaPago: formaData, isLoading } = useGetByIdFormasPago(forma?.id);

  useEffect(() => {
    if (formaData) {
      handleChange({
        target: {
          name: "nombre",
          value: formaData.nombre,
        },
      });
    }
  }, [formaData]);

  if (isLoading) return <NexusLoader text="Cargando..." />;

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (formaData?.id) {
      await handleUpdate(formaData.id);
    } else {
      await handleSubmit(e);
    }
    if (onClose) onClose(); // Cerrar modal tras éxito
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white p-4">
      {/* Encabezado discreto 
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800">
          {forma ? "Editar Forma de Pago" : "Nueva Forma de Pago"}
        </h2>
        <p className="text-xs text-gray-500">
          Complete la información detallada a continuación.
        </p>
      </div>*/}

      <form onSubmit={handleSubmitForm} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">
            Nombre de la forma
          </label>
          <input
            type="text"
            name="nombre"
            placeholder="Ej: Transferencia Bancaria"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            value={formaPago.nombre || ""}
            onChange={handleChange}
            required
          />
          {error && (
            <p className="text-xs text-red-500 mt-1 animate-pulse">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          {/* Botón de Cancelar (Opcional, para UI de modal) */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={`flex-[1.5] px-4 py-2 text-sm font-semibold text-white rounded-md transition-all shadow-sm
              ${loading 
                ? "bg-blue-300 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Guardando...
              </span>
            ) : forma ? (
              "Actualizar"
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}