import PropTypes from "prop-types";
import Select from "react-select";
import { useRegisterDescuento } from "../../hooks/nomina/useRegisterDescuento";
import { useGetEmpleados } from "../../hooks/nomina/useGetEmpleados";

export default function RegisterDescuento({ uuid = null, onClose }) {
  const { empleados } = useGetEmpleados();

  const { formData, handleChange, handleSubmit, fieldErrors, loading, isLoadingData } =
    useRegisterDescuento({ uuid, onSuccess: onClose });

  const isEdit = !!uuid;

  const handleSelectChange = (name) => (option) => {
    handleChange({ target: { name, value: option ? option.value : "" } });
  };

  const inputClass = (field) =>
    `block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  if (isEdit && isLoadingData) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-48" />
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Editar Descuento" : "Nuevo Descuento"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit
            ? "Modifica los datos del descuento."
            : "Complete los campos para registrar un nuevo descuento."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Empleado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empleado <span className="text-red-500">*</span>
          </label>
          <Select
            options={empleados}
            value={empleados.find((e) => e.value === Number(formData.user_id)) ?? null}
            onChange={handleSelectChange("user_id")}
            placeholder="Seleccione un empleado..."
            noOptionsMessage={() => "Sin resultados"}
            isDisabled={isEdit}
          />
          {fieldErrors.user_id && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.user_id[0]}</p>
          )}
        </div>

        {/* Concepto */}
        <div>
          <label htmlFor="concepto_descuento" className="block text-sm font-medium text-gray-700 mb-1">
            Concepto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="concepto_descuento"
            name="concepto_descuento"
            value={formData.concepto_descuento}
            onChange={handleChange}
            maxLength={45}
            placeholder="Ej: Préstamo personal"
            className={inputClass("concepto_descuento")}
          />
          {fieldErrors.concepto_descuento && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.concepto_descuento[0]}</p>
          )}
        </div>

        {/* Monto y cuotas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
              Monto total <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="monto"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              min="0"
              placeholder="Ej: 500000"
              className={inputClass("monto")}
            />
            {fieldErrors.monto && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.monto[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="numero_cuotas" className="block text-sm font-medium text-gray-700 mb-1">
              Número de cuotas <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="numero_cuotas"
              name="numero_cuotas"
              value={formData.numero_cuotas}
              onChange={handleChange}
              min="1"
              placeholder="Ej: 6"
              className={inputClass("numero_cuotas")}
            />
            {fieldErrors.numero_cuotas && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.numero_cuotas[0]}</p>
            )}
          </div>
        </div>

        {/* Frecuencia e inicio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="frecuencia_pago" className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia de pago <span className="text-red-500">*</span>
            </label>
            <select
              id="frecuencia_pago"
              name="frecuencia_pago"
              value={formData.frecuencia_pago}
              onChange={handleChange}
              className={inputClass("frecuencia_pago")}
            >
              <option value="">Seleccione</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
            {fieldErrors.frecuencia_pago && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.frecuencia_pago[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="inicio" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="inicio"
              name="inicio"
              value={formData.inicio}
              onChange={handleChange}
              className={inputClass("inicio")}
            />
            {fieldErrors.inicio && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.inicio[0]}</p>
            )}
          </div>
        </div>

        {/* Vista previa valor cuota */}
        {formData.monto && formData.numero_cuotas && Number(formData.numero_cuotas) > 0 && (
          <div className="rounded-md bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-700">
            Valor por cuota:{" "}
            <span className="font-semibold">
              ${(Number(formData.monto) / Number(formData.numero_cuotas)).toLocaleString("es-CO", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        {/* Estado (solo en edición) */}
        {isEdit && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={!!formData.status}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Activo
            </label>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Guardando...
              </>
            ) : isEdit ? (
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

RegisterDescuento.propTypes = {
  uuid: PropTypes.string,
  onClose: PropTypes.func,
};
