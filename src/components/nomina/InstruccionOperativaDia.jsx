import PropTypes from "prop-types";
import Select from "react-select";
import { AlarmClock, CheckCircle2, Coffee, Save, TimerReset } from "lucide-react";

export default function InstruccionOperativaDia({
  CampoHoraStepper,
  form,
  jornadas,
  kioscos,
  empleados,
  loadingEmpleados,
  loading,
  saving,
  onSubmit,
  onFieldChange,
  onTimeChange,
  onUsersChange,
  onKioscosChange,
}) {
  const usuariosSeleccionados = empleados.filter((item) => (form.users ?? []).some((id) => String(id) === String(item.value)));
  const kioscoOpciones = kioscos.map((item) => ({
    value: item.id,
    label: `${item.name} · ${item.sede?.nombre ?? "Sin sede"} · ${item.bodega?.nombre ?? "Sin bodega"}`,
  }));
  const kioscosSeleccionados = kioscoOpciones.filter((item) => (form.kiosko_device_ids ?? []).some((id) => String(id) === String(item.value)));

  return (
    <form onSubmit={onSubmit} className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Instrucción operativa del día</h2>
          <p className="text-sm text-gray-500">Los kioskos seleccionados usan estos horarios solo para la fecha indicada, por encima de la jornada base.</p>
        </div>
        <button
          type="submit"
          disabled={loading || saving}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar instrucción"}
        </button>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Fecha</span>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={onFieldChange}
            className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="block xl:col-span-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Kioskos</span>
          <Select
            isMulti
            isClearable
            options={kioscoOpciones}
            value={kioscosSeleccionados}
            onChange={onKioscosChange}
            placeholder="Vacio: aplica a todos los kioskos (global)"
            className="mt-1 text-sm"
            classNamePrefix="nomina-select"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Jornada base</span>
          <select
            name="jornada_laboral_id"
            value={form.jornada_laboral_id}
            onChange={onFieldChange}
            className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Usar jornada activa del kiosko</option>
            {jornadas.map((item) => (
              <option key={item.uuid} value={item.id}>
                {item.nombre} · {item.horas_semanales} h
              </option>
            ))}
          </select>
        </label>

        <label className="block xl:col-span-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Empleados específicos</span>
          <Select
            isMulti
            isClearable
            isLoading={loadingEmpleados}
            options={empleados}
            value={usuariosSeleccionados}
            onChange={onUsersChange}
            placeholder="Opcional: si seleccionas empleados, solo aplica para ellos"
            className="mt-1 text-sm"
            classNamePrefix="nomina-select"
          />
        </label>

        <CampoHoraStepper label="Entrada desde" name="hora_entrada" value={form.hora_entrada} onChange={onTimeChange} icon={AlarmClock} fallback="07:00" />
        <CampoHoraStepper label="Tardía después de" name="hora_entrada_limite" value={form.hora_entrada_limite} onChange={onTimeChange} icon={AlarmClock} fallback="08:00" />
        <CampoHoraStepper label="Salida mínima" name="hora_salida" value={form.hora_salida} onChange={onTimeChange} icon={CheckCircle2} fallback="17:00" />
        <CampoHoraStepper label="Salida a pausa" name="hora_salida_pausa" value={form.hora_salida_pausa} onChange={onTimeChange} icon={TimerReset} optional fallback="11:00" />
        <CampoHoraStepper label="Regreso de pausa" name="hora_ingreso_pausa" value={form.hora_ingreso_pausa} onChange={onTimeChange} icon={TimerReset} optional fallback="11:15" />
        <CampoHoraStepper label="Salida a almuerzo" name="hora_salida_almuerzo" value={form.hora_salida_almuerzo} onChange={onTimeChange} icon={Coffee} optional fallback="15:00" />
        <CampoHoraStepper label="Regreso de almuerzo" name="hora_ingreso_almuerzo" value={form.hora_ingreso_almuerzo} onChange={onTimeChange} icon={Coffee} optional fallback="16:00" />

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Duración pausa</span>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
            <input
              type="number"
              min="1"
              max="180"
              name="duracion_pausa_minutos"
              value={form.duracion_pausa_minutos}
              onChange={onFieldChange}
              className="w-full border-none bg-transparent text-sm text-gray-800 outline-none"
            />
            <span className="text-xs text-gray-400">min</span>
          </div>
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Duración almuerzo</span>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
            <input
              type="number"
              min="1"
              max="240"
              name="duracion_almuerzo_minutos"
              value={form.duracion_almuerzo_minutos}
              onChange={onFieldChange}
              className="w-full border-none bg-transparent text-sm text-gray-800 outline-none"
            />
            <span className="text-xs text-gray-400">min</span>
          </div>
        </label>

        <label className="block md:col-span-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Motivo</span>
          <input
            type="text"
            name="motivo"
            value={form.motivo ?? ""}
            onChange={onFieldChange}
            placeholder="Ej: Bodega sale a pausa a las 11:00 por instrucción del líder"
            className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>
    </form>
  );
}

InstruccionOperativaDia.propTypes = {
  CampoHoraStepper: PropTypes.elementType.isRequired,
  form: PropTypes.shape({
    fecha: PropTypes.string,
    kiosko_device_ids: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    jornada_laboral_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hora_entrada: PropTypes.string,
    hora_entrada_limite: PropTypes.string,
    hora_salida: PropTypes.string,
    hora_salida_pausa: PropTypes.string,
    hora_ingreso_pausa: PropTypes.string,
    hora_salida_almuerzo: PropTypes.string,
    hora_ingreso_almuerzo: PropTypes.string,
    duracion_pausa_minutos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    duracion_almuerzo_minutos: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    users: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    motivo: PropTypes.string,
  }).isRequired,
  jornadas: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    uuid: PropTypes.string,
    nombre: PropTypes.string,
    horas_semanales: PropTypes.number,
  })).isRequired,
  kioscos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    uuid: PropTypes.string,
    name: PropTypes.string,
    sede: PropTypes.shape({ nombre: PropTypes.string }),
    bodega: PropTypes.shape({ nombre: PropTypes.string }),
  })).isRequired,
  empleados: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  })).isRequired,
  loadingEmpleados: PropTypes.bool,
  loading: PropTypes.bool,
  saving: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onTimeChange: PropTypes.func.isRequired,
  onUsersChange: PropTypes.func.isRequired,
  onKioscosChange: PropTypes.func.isRequired,
};
