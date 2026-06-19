import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { useGetEmpleados } from "../../hooks/nomina/useGetEmpleados";

const CONFIG = {
  permiso: {
    title: "Nueva solicitud de permiso",
    initial: {
      user_id: "",
      fecha: "",
      tipo: "ausencia_parcial",
      hora_inicio: "",
      hora_fin: "",
      motivo: "",
    },
  },
  vacaciones: {
    title: "Nueva solicitud de vacaciones",
    initial: {
      user_id: "",
      fecha_inicio: "",
      fecha_fin: "",
      dias_habiles: "",
      tipo: "ordinarias",
      motivo: "",
    },
  },
  licencia: {
    title: "Nueva licencia",
    initial: {
      user_id: "",
      tipo: "maternidad",
      inicio: "",
      fin: "",
      dias_calendario: "",
      soporte: null,
    },
  },
  horaExtra: {
    title: "Nueva solicitud de hora extra",
    initial: {
      user_id: "",
      fecha: "",
      horas: "",
      tipo: "diurna",
      motivo: "",
    },
  },
};

function daysBetween(inicio, fin) {
  if (!inicio || !fin) return "";
  const start = new Date(`${inicio}T00:00:00`);
  const end = new Date(`${fin}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return "";
  return Math.floor((end - start) / 86400000) + 1;
}

export default function ModalCrearSolicitud({ tipo, onClose, onSubmit, loading, defaultUserId = null }) {
  const config = CONFIG[tipo];
  const { empleados, isLoading } = useGetEmpleados();
  const [form, setForm] = useState(() => ({
    ...config.initial,
    ...(defaultUserId ? { user_id: defaultUserId } : {}),
  }));
  const [errors, setErrors] = useState({});

  const title = useMemo(() => config.title, [config.title]);

  useEffect(() => {
    if (tipo === "licencia") {
      const dias = daysBetween(form.inicio, form.fin);
      if (dias && dias !== form.dias_calendario) {
        setForm((prev) => ({ ...prev, dias_calendario: dias }));
      }
    }
  }, [form.inicio, form.fin, form.dias_calendario, tipo]);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files?.[0] ?? null : value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});
    try {
      await onSubmit(form);
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {});
    }
  };

  const fieldClass = (name) =>
    `w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[name] ? "border-red-300" : "border-gray-300"
    }`;

  const FieldError = ({ name }) => errors[name] ? <p className="mt-1 text-xs text-red-500">{errors[name][0]}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!defaultUserId && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Empleado</label>
              <select name="user_id" value={form.user_id} onChange={handleChange} className={fieldClass("user_id")} disabled={isLoading}>
                <option value="">{isLoading ? "Cargando empleados..." : "Seleccione empleado"}</option>
                {empleados.map((empleado) => (
                  <option key={empleado.value} value={empleado.value}>{empleado.label}</option>
                ))}
              </select>
              <FieldError name="user_id" />
              <FieldError name="users" />
            </div>
          )}

          {tipo === "permiso" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                  <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className={fieldClass("fecha")} />
                  <FieldError name="fecha" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de permiso</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange} className={fieldClass("tipo")}>
                    <option value="ausencia_parcial">Ausencia parcial</option>
                    <option value="llegada_tarde">Llegada tarde</option>
                    <option value="salida_temprana">Salida temprana</option>
                  </select>
                  <FieldError name="tipo" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                  <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} className={fieldClass("hora_inicio")} />
                  <FieldError name="hora_inicio" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                  <input type="time" name="hora_fin" value={form.hora_fin} onChange={handleChange} className={fieldClass("hora_fin")} />
                  <FieldError name="hora_fin" />
                </div>
              </div>
            </>
          )}

          {tipo === "vacaciones" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange} className={fieldClass("tipo")}>
                    <option value="ordinarias">Disfrutadas</option>
                    <option value="compensadas">Compensadas en dinero</option>
                  </select>
                  <FieldError name="tipo" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Días hábiles</label>
                  <input type="number" min="1" max="30" name="dias_habiles" value={form.dias_habiles} onChange={handleChange} className={fieldClass("dias_habiles")} />
                  <FieldError name="dias_habiles" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Inicio</label>
                  <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} className={fieldClass("fecha_inicio")} />
                  <FieldError name="fecha_inicio" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fin</label>
                  <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} className={fieldClass("fecha_fin")} />
                  <FieldError name="fecha_fin" />
                </div>
              </div>
            </>
          )}

          {tipo === "licencia" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange} className={fieldClass("tipo")}>
                    <option value="maternidad">Maternidad</option>
                    <option value="paternidad">Paternidad</option>
                  </select>
                  <FieldError name="tipo" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Días calendario</label>
                  <input type="number" min="1" max="126" name="dias_calendario" value={form.dias_calendario} onChange={handleChange} className={fieldClass("dias_calendario")} />
                  <FieldError name="dias_calendario" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Inicio</label>
                  <input type="date" name="inicio" value={form.inicio} onChange={handleChange} className={fieldClass("inicio")} />
                  <FieldError name="inicio" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fin</label>
                  <input type="date" name="fin" value={form.fin} onChange={handleChange} className={fieldClass("fin")} />
                  <FieldError name="fin" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Soporte</label>
                <input type="file" name="soporte" accept=".pdf,image/*" onChange={handleChange} className="w-full text-sm text-gray-600 file:mr-3 file:h-9 file:px-3 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium" />
                <FieldError name="soporte" />
              </div>
            </>
          )}

          {tipo === "horaExtra" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                  <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className={fieldClass("fecha")} />
                  <FieldError name="fecha" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Horas</label>
                  <input type="number" min="0.5" max="24" step="0.5" name="horas" value={form.horas} onChange={handleChange} className={fieldClass("horas")} />
                  <FieldError name="horas" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange} className={fieldClass("tipo")}>
                    <option value="diurna">Diurna</option>
                    <option value="nocturna">Nocturna</option>
                    <option value="festiva">Festiva</option>
                    <option value="nocturna_festiva">Nocturna festiva</option>
                  </select>
                  <FieldError name="tipo" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Motivo</label>
            <textarea name="motivo" rows={3} value={form.motivo ?? ""} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Detalle breve de la solicitud..." />
            <FieldError name="motivo" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Crear solicitud
          </button>
        </div>
      </form>
    </div>
  );
}
