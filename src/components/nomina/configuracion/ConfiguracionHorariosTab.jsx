import PropTypes from "prop-types";
import Select from "react-select";
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Coffee,
  RotateCcw,
  Save,
  TimerReset,
  UserRound,
  X,
} from "lucide-react";
import { DIAS_SEMANA } from "../../../hooks/nomina/useConfiguracionHorarios";

function pad(value) {
  return String(value).padStart(2, "0");
}

function separarHora(value, fallback = "07:00") {
  const base = value || fallback;
  const [hora = "0", minuto = "0"] = String(base).split(":");

  return {
    hora: Number(hora),
    minuto: Number(minuto),
  };
}

function ajustarTiempo(value, parte, delta, fallback) {
  const actual = separarHora(value, fallback);

  if (parte === "hora") {
    actual.hora = (actual.hora + delta + 24) % 24;
  } else {
    actual.minuto = (actual.minuto + delta + 60) % 60;
  }

  return `${pad(actual.hora)}:${pad(actual.minuto)}`;
}

function CampoHoraStepper({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  hint,
  optional = false,
  fallback = "07:00",
}) {
  const activo = !!value;
  const { hora, minuto } = separarHora(value, fallback);
  const mostrarHora = activo ? pad(hora) : "--";
  const mostrarMinuto = activo ? pad(minuto) : "--";
  const cambiar = (parte, delta) =>
    onChange(name, ajustarTiempo(value, parte, delta, fallback));

  return (
    <div className="block">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </span>
        {optional && value && (
          <button
            type="button"
            onClick={() => onChange(name, "")}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-500"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>

      <div className="mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.8} />

          <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">
              <span className="font-mono text-lg font-bold tabular-nums text-gray-900">
                {mostrarHora}
              </span>
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => cambiar("hora", 1)}
                  className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => cambiar("hora", -1)}
                  className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <span className="font-mono text-lg font-bold text-gray-300">:</span>

            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">
              <span className="font-mono text-lg font-bold tabular-nums text-gray-900">
                {mostrarMinuto}
              </span>
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => cambiar("minuto", 1)}
                  className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => cambiar("minuto", -1)}
                  className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

CampoHoraStepper.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  icon: PropTypes.elementType.isRequired,
  hint: PropTypes.string,
  optional: PropTypes.bool,
  fallback: PropTypes.string,
};

function Switch({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-indigo-200"
    >
      <span>
        <span className="block text-sm font-semibold text-gray-800">{label}</span>
        <span className="mt-0.5 block text-xs text-gray-500">
          {description}
        </span>
      </span>
      <span
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

Switch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default function ConfiguracionHorariosTab({
  lista,
  jornada,
  setJornadaUuid,
  form,
  setForm,
  instruccionForm,
  horarioUsuarioForm,
  empleados,
  horariosUsuario,
  isLoading,
  loadingEmpleados,
  loadingHorariosUsuario,
  mutation,
  instruccionMutation,
  horarioUsuarioMutation,
  handleTimeChange,
  handleNumber,
  handleInstruccion,
  handleInstruccionTime,
  handleHorarioUsuario,
  toggleDiaUsuario,
  aplicarDefault,
  guardar,
  guardarHorarioPorFecha,
  guardarHorarioUsuario,
}) {
  const diasGuardados = new Set(horariosUsuario.map((item) => Number(item.dia_semana)));
  const empleadoSeleccionado =
    empleados.find((empleado) => String(empleado.value) === String(horarioUsuarioForm.user_id)) ?? null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Jornada a configurar
        </p>

        {isLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-gray-50" />
        ) : lista.length ? (
          <div className="space-y-2">
            {lista.map((item) => (
              <button
                key={item.uuid}
                type="button"
                onClick={() => setJornadaUuid(item.uuid)}
                className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                  item.uuid === jornada?.uuid
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="block text-sm font-semibold text-gray-900">
                  {item.nombre}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  {item.horas_semanales} h/semana · {item.status ? "Activa" : "Inactiva"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No hay jornadas laborales creadas.
          </p>
        )}
      </aside>

      <form
        onSubmit={guardar}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {jornada?.nombre ?? "Sin jornada seleccionada"}
            </h2>
            <p className="text-sm text-gray-500">
              Puedes guardar la jornada base o aplicarla solo a una fecha operativa.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              name="fecha"
              value={instruccionForm.fecha}
              onChange={handleInstruccion}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />

            <button
              type="button"
              onClick={aplicarDefault}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              7 AM · 1 PM · 5 PM
            </button>

            <button
              type="button"
              onClick={guardarHorarioPorFecha}
              disabled={!jornada || instruccionMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {instruccionMutation.isPending
                ? "Guardando..."
                : "Guardar para fecha"}
            </button>

            <button
              type="submit"
              disabled={!jornada || mutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {mutation.isPending ? "Guardando..." : "Guardar jornada base"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-800">
                  Jornada laboral
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <CampoHoraStepper
                  label="Entrada laboral"
                  name="hora_entrada"
                  value={form.hora_entrada}
                  onChange={handleTimeChange}
                  icon={AlarmClock}
                  fallback="07:00"
                />
                <CampoHoraStepper
                  label="Tardía después de"
                  name="hora_entrada_limite"
                  value={instruccionForm.hora_entrada_limite}
                  onChange={handleInstruccionTime}
                  icon={AlarmClock}
                  fallback="08:00"
                />
                <CampoHoraStepper
                  label="Salida a almuerzo"
                  name="hora_salida_almuerzo"
                  value={form.hora_salida_almuerzo}
                  onChange={handleTimeChange}
                  icon={Coffee}
                  fallback="13:00"
                />
                <CampoHoraStepper
                  label="Regreso de almuerzo"
                  name="hora_ingreso_almuerzo"
                  value={form.hora_ingreso_almuerzo}
                  onChange={handleTimeChange}
                  icon={Coffee}
                  fallback="14:00"
                />
                <CampoHoraStepper
                  label="Salida laboral"
                  name="hora_salida"
                  value={form.hora_salida}
                  onChange={handleTimeChange}
                  icon={CheckCircle2}
                  fallback="17:00"
                />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <TimerReset className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-800">
                  Pausas operativas
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CampoHoraStepper
                  label="Salida a pausa"
                  name="hora_salida_pausa"
                  value={form.hora_salida_pausa}
                  onChange={handleTimeChange}
                  icon={TimerReset}
                  hint="Opcional si la pausa no tiene hora fija."
                  optional
                  fallback="10:00"
                />
                <CampoHoraStepper
                  label="Regreso de pausa"
                  name="hora_ingreso_pausa"
                  value={form.hora_ingreso_pausa}
                  onChange={handleTimeChange}
                  icon={TimerReset}
                  hint="Opcional; el sistema valida duración."
                  optional
                  fallback="10:15"
                />

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Duración pausa
                  </span>
                  <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
                    <TimerReset className="h-4 w-4 text-gray-400" strokeWidth={1.8} />
                    <input
                      type="number"
                      min="1"
                      max="180"
                      name="duracion_pausa_minutos"
                      value={form.duracion_pausa_minutos}
                      onChange={handleNumber}
                      className="w-full border-none bg-transparent text-sm text-gray-800 outline-none"
                    />
                    <span className="text-xs text-gray-400">min</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Por defecto son 15 minutos.
                  </p>
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Duración almuerzo
                  </span>
                  <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
                    <Coffee className="h-4 w-4 text-gray-400" strokeWidth={1.8} />
                    <input
                      type="number"
                      min="1"
                      max="240"
                      name="duracion_almuerzo_minutos"
                      value={form.duracion_almuerzo_minutos}
                      onChange={handleNumber}
                      className="w-full border-none bg-transparent text-sm text-gray-800 outline-none"
                    />
                    <span className="text-xs text-gray-400">min</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Por defecto es una hora.
                  </p>
                </label>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <Switch
              checked={!!form.status}
              onChange={() =>
                setForm((prev) => ({
                  ...prev,
                  status: !prev.status,
                }))
              }
              label="Jornada activa"
              description="Solo las jornadas activas se toman como opción principal del kiosko."
            />

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-800">
                  Horario por usuario
                </h3>
              </div>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Empleado
                </span>
                <Select
                  className="mt-1 text-sm"
                  classNamePrefix="react-select"
                  options={empleados}
                  value={empleadoSeleccionado}
                  onChange={(option) =>
                    handleHorarioUsuario({
                      target: { name: "user_id", value: option?.value ?? "" },
                    })
                  }
                  isClearable
                  isSearchable
                  isLoading={loadingEmpleados}
                  placeholder={loadingEmpleados ? "Cargando empleados..." : "Seleccionar empleado"}
                  noOptionsMessage={() => "Sin empleados"}
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: "40px",
                      borderRadius: "0.5rem",
                      borderColor: state.isFocused ? "#34d399" : "#e5e7eb",
                      boxShadow: state.isFocused ? "0 0 0 2px #d1fae5" : "none",
                      "&:hover": { borderColor: "#34d399" },
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </label>

              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Días
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {DIAS_SEMANA.map((dia) => {
                    const checked = horarioUsuarioForm.dias.includes(dia.value);
                    const guardado = diasGuardados.has(dia.value);

                    return (
                      <button
                        key={dia.value}
                        type="button"
                        onClick={() => toggleDiaUsuario(dia.value)}
                        className={`h-9 rounded-lg border text-xs font-bold transition-colors ${
                          checked
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                        title={guardado ? "Ya tiene horario guardado" : "Sin horario guardado"}
                      >
                        {dia.label}
                        {guardado && <span className="ml-1 text-[10px]">•</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={guardarHorarioUsuario}
                disabled={
                  !horarioUsuarioForm.user_id ||
                  !horarioUsuarioForm.dias.length ||
                  loadingHorariosUsuario ||
                  horarioUsuarioMutation.isPending
                }
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {horarioUsuarioMutation.isPending
                  ? "Guardando..."
                  : "Guardar horario semanal"}
              </button>
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
}

ConfiguracionHorariosTab.propTypes = {
  lista: PropTypes.array.isRequired,
  jornada: PropTypes.object,
  setJornadaUuid: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  instruccionForm: PropTypes.object.isRequired,
  horarioUsuarioForm: PropTypes.object.isRequired,
  empleados: PropTypes.array.isRequired,
  horariosUsuario: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  loadingEmpleados: PropTypes.bool,
  loadingHorariosUsuario: PropTypes.bool,
  mutation: PropTypes.shape({ isPending: PropTypes.bool }).isRequired,
  instruccionMutation: PropTypes.shape({ isPending: PropTypes.bool }).isRequired,
  horarioUsuarioMutation: PropTypes.shape({ isPending: PropTypes.bool }).isRequired,
  handleTimeChange: PropTypes.func.isRequired,
  handleNumber: PropTypes.func.isRequired,
  handleInstruccion: PropTypes.func.isRequired,
  handleInstruccionTime: PropTypes.func.isRequired,
  handleHorarioUsuario: PropTypes.func.isRequired,
  toggleDiaUsuario: PropTypes.func.isRequired,
  aplicarDefault: PropTypes.func.isRequired,
  guardar: PropTypes.func.isRequired,
  guardarHorarioPorFecha: PropTypes.func.isRequired,
  guardarHorarioUsuario: PropTypes.func.isRequired,
};
