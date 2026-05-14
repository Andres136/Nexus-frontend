import PropTypes from "prop-types";
import Select from "react-select";
import { useGetTipoContrato } from "../../hooks/nomina/useGetTipoContrato";
import { useEmpresas } from "../../hooks/useEmpresas";
import { useGetSeguridadSocial } from "../../hooks/nomina/useGetSeguridadSocial";
import { useGetRegisterContratacion } from "../../hooks/nomina/useGetRegisterContratacion";
import { useGetEmpleados } from "../../hooks/nomina/useGetEmpleados";

export default function RegisterContrato({ uuid = null, onClose }) {
  const { empleados: users } = useGetEmpleados();

  const { formData, handleChange, handleSubmit, fieldErrors, loading, isLoadingData } =
    useGetRegisterContratacion({ uuid, onSuccess: onClose });

  const { tipoContratos } = useGetTipoContrato();
  const { empresas } = useEmpresas();
  const { seguridadSociales } = useGetSeguridadSocial();

  const tipoContratoLista = tipoContratos?.data ?? [];
  const seguridadSocialLista = seguridadSociales?.data?.data ?? [];
  const empresasLista = Array.isArray(empresas) ? empresas : [];

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
        {[...Array(7)].map((_, i) => (
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
          {isEdit ? "Editar Contratación" : "Nueva Contratación"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit
            ? "Modifica los datos de la contratación."
            : "Complete los campos para registrar una nueva contratación."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Empleado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empleado <span className="text-red-500">*</span>
          </label>
          <Select
            options={users}
            value={users.find((u) => u.value === Number(formData.users_id)) ?? null}
            onChange={handleSelectChange("users_id")}
            placeholder="Seleccione un empleado..."
            noOptionsMessage={() => "Sin resultados"}
          />
          {fieldErrors.users_id && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.users_id[0]}</p>
          )}
        </div>

        {/* Empresa */}
        <div>
          <label htmlFor="empresa_id" className="block text-sm font-medium text-gray-700 mb-1">
            Empresa <span className="text-red-500">*</span>
          </label>
          <select
            id="empresa_id"
            name="empresa_id"
            value={formData.empresa_id}
            onChange={handleChange}
            className={inputClass("empresa_id")}
          >
            <option value="">Seleccione una empresa</option>
            {empresasLista.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
          {fieldErrors.empresa_id && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.empresa_id[0]}</p>
          )}
        </div>

        {/* Tipo de contrato */}
        <div>
          <label htmlFor="id_contrato" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de contrato <span className="text-red-500">*</span>
          </label>
          <select
            id="id_contrato"
            name="id_contrato"
            value={formData.id_contrato}
            onChange={handleChange}
            className={inputClass("id_contrato")}
          >
            <option value="">Seleccione un tipo</option>
            {tipoContratoLista.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
          {fieldErrors.id_contrato && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.id_contrato[0]}</p>
          )}
        </div>

        {/* Salario y auxilio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="base_salario" className="block text-sm font-medium text-gray-700 mb-1">
              Salario base <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="base_salario"
              name="base_salario"
              value={formData.base_salario}
              onChange={handleChange}
              min="0"
              placeholder="Ej: 1300000"
              className={inputClass("base_salario")}
            />
            {fieldErrors.base_salario && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.base_salario[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="auxilio_transporte" className="block text-sm font-medium text-gray-700 mb-1">
              Auxilio de transporte
            </label>
            <input
              type="number"
              id="auxilio_transporte"
              name="auxilio_transporte"
              value={formData.auxilio_transporte}
              onChange={handleChange}
              min="0"
              placeholder="Ej: 162000"
              className={inputClass("auxilio_transporte")}
            />
            {fieldErrors.auxilio_transporte && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.auxilio_transporte[0]}</p>
            )}
          </div>
        </div>

        {/* Frecuencia de pago y componente no salarial */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pago_frecuencia" className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia de pago <span className="text-red-500">*</span>
            </label>
            <select
              id="pago_frecuencia"
              name="pago_frecuencia"
              value={formData.pago_frecuencia}
              onChange={handleChange}
              className={inputClass("pago_frecuencia")}
            >
              <option value="">Seleccione</option>
              <option value="15">Quincenal</option>
              <option value="30">Mensual</option>
            </select>
            {fieldErrors.pago_frecuencia && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.pago_frecuencia[0]}</p>
            )}
          </div>
          <div className="flex items-center gap-2 pt-6">
            <label htmlFor="no_salarial" className="block text-sm font-medium text-gray-700">
           No salarial
            </label>
            <input
              type="number"
              id="no_salarial"
              name="no_salarial"
              value={formData.no_salarial}
              onChange={handleChange}
              min="0"
              placeholder="0 para no, 1 para sí"
              className={inputClass("no_salarial")}
            />
         
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="inicio_contratacion" className="block text-sm font-medium text-gray-700 mb-1">
              Inicio contratación <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="inicio_contratacion"
              name="inicio_contratacion"
              value={formData.inicio_contratacion}
              onChange={handleChange}
              className={inputClass("inicio_contratacion")}
            />
            {fieldErrors.inicio_contratacion && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.inicio_contratacion[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="fin_contrato" className="block text-sm font-medium text-gray-700 mb-1">
              Fin de contrato
            </label>
            <input
              type="date"
              id="fin_contrato"
              name="fin_contrato"
              value={formData.fin_contrato}
              onChange={handleChange}
              className={inputClass("fin_contrato")}
            />
            {fieldErrors.fin_contrato && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.fin_contrato[0]}</p>
            )}
          </div>
        </div>

        {/* Seguridad Social */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Seguridad Social</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "eps_id", label: "EPS" },
              { name: "arl_id", label: "ARL" },
              { name: "fondo_pensiones_id", label: "Fondo de pensiones" },
              { name: "caja_penciones_id", label: "Caja de compensación" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                  {label} <span className="text-red-500">*</span>
                </label>
                <select
                  id={name}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={inputClass(name)}
                >
                  <option value="">Seleccione {label}</option>
                  {seguridadSocialLista.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
                {fieldErrors[name] && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors[name][0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

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
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
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

RegisterContrato.propTypes = {
  uuid: PropTypes.string,
  onClose: PropTypes.func,
};
