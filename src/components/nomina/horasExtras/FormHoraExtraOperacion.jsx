import { useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { Loader2, Plus, X } from "lucide-react";

const initialForm = {
  users: [],
  sede_id: "",
  kiosko_device_id: "",
  fecha: "",
  horas: "",
  tipo: "diurna",
  motivo: "",
};

export default function FormHoraExtraOperacion({
  open,
  onClose,
  onSubmit,
  loading,
  empleados,
  sedes,
  kioscos,
  loadingCatalogos,
  sedeId,
  onSedeChange,
  mode = "modal",
}) {
  const [form, setForm] = useState(() => ({ ...initialForm, sede_id: sedeId || "" }));
  const [errors, setErrors] = useState({});

  if (!open) return null;

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleUser = (userId) => {
    setForm((prev) => ({ ...prev, users: userId.map((item) => String(item.value)) }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});

    try {
      await onSubmit(form);
      setForm({ ...initialForm, sede_id: sedeId || "" });
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {});
    }
  };

  const fieldClass = (name) =>
    `w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[name] ? "border-red-300" : "border-gray-300"
    }`;

  const FieldError = ({ name }) => errors[name] ? <p className="mt-1 text-xs text-red-500">{errors[name][0]}</p> : null;

  FieldError.propTypes = {
    name: PropTypes.string.isRequired,
  };

  const empleadosSeleccionados = empleados.filter((empleado) => form.users.includes(String(empleado.value)));
  const isPage = mode === "page";

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 42,
      borderColor: errors.users ? "#fca5a5" : state.isFocused ? "#6366f1" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(99, 102, 241, 0.2)" : "none",
      "&:hover": { borderColor: state.isFocused ? "#6366f1" : "#d1d5db" },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#eef2ff",
      borderRadius: 6,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#3730a3",
      fontSize: 12,
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#4f46e5",
      ":hover": { backgroundColor: "#c7d2fe", color: "#312e81" },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const formClass = isPage
    ? "bg-white rounded-xl border border-gray-200 shadow-sm w-full"
    : "relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto";

  const wrapperClass = isPage
    ? "w-full"
    : "fixed inset-0 z-50 flex items-center justify-center";

  return (
    <div className={wrapperClass}>
      {!isPage && <div className="absolute inset-0 bg-black/40" onClick={onClose} />}
      <form onSubmit={submit} className={formClass}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Nueva solicitud de hora extra</h3>
          {!isPage && (
            <button type="button" onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sede</label>
              <select
                name="sede_id"
                value={form.sede_id}
                onChange={(event) => {
                  update("sede_id", event.target.value);
                  update("kiosko_device_id", "");
                  onSedeChange?.(event.target.value);
                }}
                className={fieldClass("sede_id")}
              >
                <option value="">Todas las sedes</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.nombre ?? sede.name}</option>
                ))}
              </select>
              <FieldError name="sede_id" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kiosko</label>
              <select
                name="kiosko_device_id"
                value={form.kiosko_device_id}
                onChange={(event) => update("kiosko_device_id", event.target.value)}
                className={fieldClass("kiosko_device_id")}
                disabled={loadingCatalogos}
              >
                <option value="">{loadingCatalogos ? "Cargando kioskos..." : "Sin kiosko específico"}</option>
                {kioscos.map((kiosko) => (
                  <option key={kiosko.id} value={kiosko.id}>{kiosko.name ?? kiosko.code}</option>
                ))}
              </select>
              <FieldError name="kiosko_device_id" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Empleados</label>
            <Select
              isMulti
              options={empleados}
              value={empleadosSeleccionados}
              onChange={(options) => toggleUser(options ?? [])}
              isLoading={loadingCatalogos}
              isDisabled={loadingCatalogos}
              placeholder={loadingCatalogos ? "Cargando empleados..." : "Buscar y seleccionar empleados..."}
              noOptionsMessage={() => "No hay empleados disponibles"}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
            <p className="mt-1 text-xs text-gray-400">{form.users.length} empleado(s) seleccionado(s)</p>
            <FieldError name="users" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
              <input type="date" name="fecha" value={form.fecha} onChange={(event) => update("fecha", event.target.value)} className={fieldClass("fecha")} />
              <FieldError name="fecha" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Horas</label>
              <input type="number" min="0.5" max="24" step="0.5" name="horas" value={form.horas} onChange={(event) => update("horas", event.target.value)} className={fieldClass("horas")} />
              <FieldError name="horas" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
              <select name="tipo" value={form.tipo} onChange={(event) => update("tipo", event.target.value)} className={fieldClass("tipo")}>
                <option value="diurna">Diurna</option>
                <option value="nocturna">Nocturna</option>
                <option value="festiva">Festiva</option>
                <option value="nocturna_festiva">Nocturna festiva</option>
              </select>
              <FieldError name="tipo" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Motivo</label>
            <textarea
              name="motivo"
              rows={3}
              value={form.motivo}
              onChange={(event) => update("motivo", event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Detalle breve de la solicitud..."
            />
            <FieldError name="motivo" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
          {!isPage && (
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancelar
            </button>
          )}
          <button type="submit" disabled={loading || form.users.length === 0} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Crear solicitud
          </button>
        </div>
      </form>
    </div>
  );
}

FormHoraExtraOperacion.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  empleados: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    label: PropTypes.string,
  })).isRequired,
  sedes: PropTypes.array.isRequired,
  kioscos: PropTypes.array.isRequired,
  loadingCatalogos: PropTypes.bool,
  sedeId: PropTypes.string,
  onSedeChange: PropTypes.func,
  mode: PropTypes.oneOf(["modal", "page"]),
};
