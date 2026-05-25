import PropTypes from "prop-types";
import Select from "react-select";
import { Loader2 } from "lucide-react";
import { useGetTipoContrato } from "../../hooks/nomina/useGetTipoContrato";
import { useEmpresas } from "../../hooks/useEmpresas";
import { useGetSeguridadSocial } from "../../hooks/nomina/useGetSeguridadSocial";
import { useGetRegisterContratacion } from "../../hooks/nomina/useGetRegisterContratacion";
import { useGetEmpleados } from "../../hooks/nomina/useGetEmpleados";

const selectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    minHeight: "34px",
    height: "34px",
    fontSize: "0.8125rem",
    borderColor: hasError ? "#f87171" : state.isFocused ? "#6366f1" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.25)" : "none",
    backgroundColor: hasError ? "#fef2f2" : "white",
    "&:hover": { borderColor: "#6366f1" },
  }),
  valueContainer: (base) => ({ ...base, padding: "0 10px" }),
  indicatorsContainer: (base) => ({ ...base, height: "34px" }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.8125rem",
    backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#eef2ff" : "white",
    color: state.isSelected ? "white" : "#374151",
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
});

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100">
      {children}
    </p>
  );
}
SectionTitle.propTypes = { children: PropTypes.node };

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

  const handleSelectChange = (name) => (option) =>
    handleChange({ target: { name, value: option ? option.value : "" } });

  const inputClass = (field) =>
    `block w-full h-[34px] px-2.5 rounded-md border text-[0.8125rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
    }`;

  const label = (text, required) => (
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {text}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  const err = (field) =>
    fieldErrors[field] && (
      <p className="mt-0.5 text-[10px] text-red-500">{fieldErrors[field][0]}</p>
    );

  if (isEdit && isLoadingData) {
    return (
      <div className="space-y-3 animate-pulse p-1">
        <div className="h-4 bg-gray-200 rounded w-40" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">
          {isEdit ? "Editar Contratación" : "Nueva Contratación"}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {isEdit ? "Modifica los datos del contrato." : "Completa los campos para registrar el contrato."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* — General — */}
        <div className="space-y-3">
          <SectionTitle>General</SectionTitle>

          {/* Empleado */}
          <div>
            {label("Empleado", true)}
            <Select
              options={users}
              value={users.find((u) => u.value === Number(formData.users_id)) ?? null}
              onChange={handleSelectChange("users_id")}
              placeholder="Buscar empleado..."
              noOptionsMessage={() => "Sin resultados"}
              styles={selectStyles(!!fieldErrors.users_id)}
            />
            {err("users_id")}
          </div>

          {/* Tipo documento + Número documento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              {label("Tipo de documento", true)}
              <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} className={inputClass("tipo_documento")}>
                <option value="CC">CC — Cédula de ciudadanía</option>
                <option value="CE">CE — Cédula de extranjería</option>
                <option value="TI">TI — Tarjeta de identidad</option>
                <option value="PA">PA — Pasaporte</option>
                <option value="NIT">NIT</option>
              </select>
              {err("tipo_documento")}
            </div>
            <div>
              {label("Número de documento", true)}
              <input type="text" name="numero_documento" value={formData.numero_documento} onChange={handleChange} placeholder="Escriba el número de documento" className={inputClass("numero_documento")} />
              {err("numero_documento")}
            </div>
          </div>

          {/* Cargo */}
          <div>
            {label("Cargo", true)}
            <input type="text" name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Escriba el cargo" className={inputClass("cargo")} />
            {err("cargo")}
          </div>

          {/* Correo */}
          <div>
            {label("Correo")}
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="Escriba el correo" className={inputClass("correo")} />
            {err("correo")}
          </div>

          {/* Empresa + Tipo contrato */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              {label("Empresa", true)}
              <select name="empresa_id" value={formData.empresa_id} onChange={handleChange} className={inputClass("empresa_id")}>
                <option value="">Seleccionar...</option>
                {empresasLista.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              {err("empresa_id")}
            </div>
            <div>
              {label("Tipo de contrato", true)}
              <select name="id_contrato" value={formData.id_contrato} onChange={handleChange} className={inputClass("id_contrato")}>
                <option value="">Seleccionar...</option>
                {tipoContratoLista.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
              {err("id_contrato")}
            </div>
          </div>
        </div>

        {/* — Condiciones económicas — */}
        <div className="space-y-3">
          <SectionTitle>Condiciones económicas</SectionTitle>

          {/* Salario + Auxilio + Comp. no salarial */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              {label("Salario base", true)}
              <input type="number" name="base_salario" value={formData.base_salario} onChange={handleChange} min="0" placeholder="1300000" className={inputClass("base_salario")} />
              {err("base_salario")}
            </div>
            <div>
              {label("Auxilio transporte")}
              <input type="number" name="auxilio_transporte" value={formData.auxilio_transporte} onChange={handleChange} min="0" placeholder="162000" className={inputClass("auxilio_transporte")} />
              {err("auxilio_transporte")}
            </div>
            <div>
              {label("Comp. no salarial")}
              <input type="number" name="no_salarial" value={formData.no_salarial} onChange={handleChange} min="0" placeholder="0" className={inputClass("no_salarial")} />
              {err("no_salarial")}
            </div>
          </div>

          {/* Frecuencia + Fechas */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              {label("Frecuencia de pago", true)}
              <select name="pago_frecuencia" value={formData.pago_frecuencia} onChange={handleChange} className={inputClass("pago_frecuencia")}>
                <option value="">Seleccionar...</option>
                <option value="15">Quincenal</option>
                <option value="30">Mensual</option>
              </select>
              {err("pago_frecuencia")}
            </div>
            <div>
              {label("Inicio contrato", true)}
              <input type="date" name="inicio_contratacion" value={formData.inicio_contratacion} onChange={handleChange} className={inputClass("inicio_contratacion")} />
              {err("inicio_contratacion")}
            </div>
            <div>
              {label("Fin contrato")}
              <input type="date" name="fin_contrato" value={formData.fin_contrato} onChange={handleChange} className={inputClass("fin_contrato")} />
              {err("fin_contrato")}
            </div>
          </div>
        </div>

        {/* — Seguridad social — */}
        <div className="space-y-3">
          <SectionTitle>Seguridad Social</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "eps_id", label: "EPS" },
              { name: "arl_id", label: "ARL" },
              { name: "fondo_pensiones_id", label: "Fondo de pensiones" },
              { name: "caja_penciones_id", label: "Caja de compensación" },
            ].map(({ name, label: lbl }) => (
              <div key={name}>
                {label(lbl, true)}
                <select name={name} value={formData[name]} onChange={handleChange} className={inputClass(name)}>
                  <option value="">Seleccionar {lbl}...</option>
                  {seguridadSocialLista.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
                {err(name)}
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />{isEdit ? "Actualizando..." : "Guardando..."}</>
            ) : isEdit ? "Actualizar" : "Guardar"}
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
