import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import {
  AlarmClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Coffee,
  RotateCcw,
  Save,
  ShieldCheck,
  TimerReset,
  X,
} from "lucide-react";
import { useGetJornadaLaboral } from "../../hooks/nomina/useGetJornadaLaboral";
import { jornadaLaboralService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

const HORARIO_DEFAULT = {
  hora_entrada: "07:00",
  hora_salida_almuerzo: "13:00",
  hora_ingreso_almuerzo: "14:00",
  hora_salida_pausa: "",
  hora_ingreso_pausa: "",
  hora_salida: "17:00",
  duracion_pausa_minutos: 15,
  duracion_almuerzo_minutos: 60,
  comando_voz_activo: true,
  status: true,
};

function normalizarHora(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

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

function prepararForm(jornada) {
  return {
    nombre: jornada?.nombre ?? "",
    horas_semanales: jornada?.horas_semanales ?? 48,
    status: jornada?.status ?? true,
    hora_entrada: normalizarHora(jornada?.hora_entrada) || HORARIO_DEFAULT.hora_entrada,
    hora_salida_almuerzo: normalizarHora(jornada?.hora_salida_almuerzo) || HORARIO_DEFAULT.hora_salida_almuerzo,
    hora_ingreso_almuerzo: normalizarHora(jornada?.hora_ingreso_almuerzo) || HORARIO_DEFAULT.hora_ingreso_almuerzo,
    hora_salida_pausa: normalizarHora(jornada?.hora_salida_pausa),
    hora_ingreso_pausa: normalizarHora(jornada?.hora_ingreso_pausa),
    hora_salida: normalizarHora(jornada?.hora_salida) || HORARIO_DEFAULT.hora_salida,
    duracion_pausa_minutos: jornada?.duracion_pausa_minutos ?? HORARIO_DEFAULT.duracion_pausa_minutos,
    duracion_almuerzo_minutos: jornada?.duracion_almuerzo_minutos ?? HORARIO_DEFAULT.duracion_almuerzo_minutos,
    comando_voz_activo: true,
  };
}

function CampoHoraStepper({ label, name, value, onChange, icon: Icon, hint, optional = false, fallback = "07:00" }) {
  const activo = !!value;
  const { hora, minuto } = separarHora(value, fallback);
  const mostrarHora = activo ? pad(hora) : "--";
  const mostrarMinuto = activo ? pad(minuto) : "--";
  const cambiar = (parte, delta) => onChange(name, ajustarTiempo(value, parte, delta, fallback));

  return (
    <div className="block">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
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
      <div className="mt-1 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400">
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={1.8} />

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 flex-1">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 px-2 py-1.5">
              <span className="font-mono text-lg font-bold text-gray-900 tabular-nums">{mostrarHora}</span>
              <div className="flex flex-col">
                <button type="button" onClick={() => cambiar("hora", 1)} className="h-4 w-5 flex items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => cambiar("hora", -1)} className="h-4 w-5 flex items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <span className="font-mono text-lg font-bold text-gray-300">:</span>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 px-2 py-1.5">
              <span className="font-mono text-lg font-bold text-gray-900 tabular-nums">{mostrarMinuto}</span>
              <div className="flex flex-col">
                <button type="button" onClick={() => cambiar("minuto", 1)} className="h-4 w-5 flex items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => cambiar("minuto", -1)} className="h-4 w-5 flex items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600">
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
  value: PropTypes.string,
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
      className="w-full flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-indigo-200 transition-colors"
    >
      <span>
        <span className="block text-sm font-semibold text-gray-800">{label}</span>
        <span className="block text-xs text-gray-500 mt-0.5">{description}</span>
      </span>
      <span className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-gray-300"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
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

export default function PageConfiguracionNomina() {
  const queryClient = useQueryClient();
  const { jornadas, isLoading } = useGetJornadaLaboral({ per_page: 50 });
  const lista = useMemo(() => jornadas?.data?.data ?? [], [jornadas]);
  const [jornadaUuid, setJornadaUuid] = useState("");
  const jornada = lista.find((item) => item.uuid === jornadaUuid) ?? lista[0];
  const [form, setForm] = useState(prepararForm(jornada));

  useEffect(() => {
    if (!jornadaUuid && lista[0]?.uuid) {
      setJornadaUuid(lista[0].uuid);
      return;
    }
    setForm(prepararForm(jornada));
  }, [jornada, jornadaUuid, lista]);

  const mutation = useMutation({
    mutationFn: (payload) => jornadaLaboralService.updateJornada(jornada.uuid, payload),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Horario operativo actualizado");
      queryClient.invalidateQueries({ queryKey: ["jornadaLaboral"] });
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No fue posible guardar la configuración");
    },
  });

  const handleTimeChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumber = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const aplicarDefault = () => {
    setForm((prev) => ({ ...prev, ...HORARIO_DEFAULT }));
  };

  const guardar = (event) => {
    event.preventDefault();
    if (!jornada) return;
    mutation.mutate({
      ...form,
      comando_voz_activo: true,
      hora_salida_pausa: form.hora_salida_pausa || null,
      hora_ingreso_pausa: form.hora_ingreso_pausa || null,
    });
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">Configuración</p>
          <h1 className="text-2xl font-bold text-gray-900">Horarios operativos de nómina</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define las horas que usará el kiosko para marcar entradas, almuerzos, pausas y salidas.
          </p>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600" strokeWidth={1.8} />
          <div>
            <p className="text-xs font-semibold text-indigo-900">Control por rol asignado</p>
            <p className="text-[11px] text-indigo-700">Esta vista queda lista para restringir cambios a Talento Humano o Administrador.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
        <aside className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-fit">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Jornada a configurar</p>
          {isLoading ? (
            <div className="h-24 rounded-lg bg-gray-50 animate-pulse" />
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
                  <span className="block text-sm font-semibold text-gray-900">{item.nombre}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {item.horas_semanales} h/semana · {item.status ? "Activa" : "Inactiva"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay jornadas laborales creadas.</p>
          )}
        </aside>

        <form onSubmit={guardar} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{jornada?.nombre ?? "Sin jornada seleccionada"}</h2>
              <p className="text-sm text-gray-500">Los cambios aplican a las nuevas marcaciones del kiosko.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={aplicarDefault}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                7 AM · 1 PM · 5 PM
              </button>
              <button
                type="submit"
                disabled={!jornada || mutation.isPending}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {mutation.isPending ? "Guardando..." : "Guardar horario"}
              </button>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-5">
            <div className="space-y-5">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Clock3 className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-gray-800">Jornada laboral</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <CampoHoraStepper label="Entrada laboral" name="hora_entrada" value={form.hora_entrada} onChange={handleTimeChange} icon={AlarmClock} fallback="07:00" />
                  <CampoHoraStepper label="Salida a almuerzo" name="hora_salida_almuerzo" value={form.hora_salida_almuerzo} onChange={handleTimeChange} icon={Coffee} fallback="13:00" />
                  <CampoHoraStepper label="Regreso de almuerzo" name="hora_ingreso_almuerzo" value={form.hora_ingreso_almuerzo} onChange={handleTimeChange} icon={Coffee} fallback="14:00" />
                  <CampoHoraStepper label="Salida laboral" name="hora_salida" value={form.hora_salida} onChange={handleTimeChange} icon={CheckCircle2} fallback="17:00" />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <TimerReset className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-gray-800">Pausas operativas</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CampoHoraStepper label="Salida a pausa" name="hora_salida_pausa" value={form.hora_salida_pausa} onChange={handleTimeChange} icon={TimerReset} hint="Opcional si la pausa no tiene hora fija." optional fallback="10:00" />
                  <CampoHoraStepper label="Regreso de pausa" name="hora_ingreso_pausa" value={form.hora_ingreso_pausa} onChange={handleTimeChange} icon={TimerReset} hint="Opcional; el sistema valida duración." optional fallback="10:15" />
                  <label className="block">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Duración pausa</span>
                    <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 h-11">
                      <TimerReset className="h-4 w-4 text-gray-400" strokeWidth={1.8} />
                      <input
                        type="number"
                        min="1"
                        max="180"
                        name="duracion_pausa_minutos"
                        value={form.duracion_pausa_minutos}
                        onChange={handleNumber}
                        className="w-full border-none outline-none text-sm text-gray-800 bg-transparent"
                      />
                      <span className="text-xs text-gray-400">min</span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">Por defecto son 15 minutos.</p>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Duración almuerzo</span>
                    <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 h-11">
                      <Coffee className="h-4 w-4 text-gray-400" strokeWidth={1.8} />
                      <input
                        type="number"
                        min="1"
                        max="240"
                        name="duracion_almuerzo_minutos"
                        value={form.duracion_almuerzo_minutos}
                        onChange={handleNumber}
                        className="w-full border-none outline-none text-sm text-gray-800 bg-transparent"
                      />
                      <span className="text-xs text-gray-400">min</span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">Por defecto es una hora.</p>
                  </label>
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <Switch
                checked={!!form.status}
                onChange={() => setForm((prev) => ({ ...prev, status: !prev.status }))}
                label="Jornada activa"
                description="Solo las jornadas activas se toman como opción principal del kiosko."
              />
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
