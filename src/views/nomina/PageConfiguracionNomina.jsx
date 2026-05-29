import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Upload,
  X,
} from "lucide-react";
import { useGetJornadaLaboral } from "../../hooks/nomina/useGetJornadaLaboral";
import { configuracionNominaService, horarioOperacionService, jornadaLaboralService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

const HORARIO_DEFAULT = {
  hora_entrada: "07:00",
  hora_salida_almuerzo: "12:00",
  hora_ingreso_almuerzo: "13:00",
  hora_salida_pausa: "",
  hora_ingreso_pausa: "",
  hora_salida: "16:48",
  duracion_pausa_minutos: 15,
  duracion_almuerzo_minutos: 60,
  comando_voz_activo: true,
  status: true,
};

const CONFIG_DEFAULT = {
  nombre: "Configuración general",
  porcentaje_salud_empleado: 4,
  porcentaje_pension_empleado: 4,
  porcentaje_salud_empleador: 8.50,
  porcentaje_pension_empleador: 12.00,
  porcentaje_arl: 2.436,
  porcentaje_sena: 2.00,
  porcentaje_icbf: 3.00,
  porcentaje_caja_compensacion: 4.00,
  status: true,
};

const hoyLocal = () => {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const INSTRUCCION_DEFAULT = {
  fecha: hoyLocal(),
  jornada_laboral_id: "",
  hora_entrada: "07:00",
  hora_entrada_limite: "08:00",
  hora_salida_pausa: "",
  hora_ingreso_pausa: "",
  hora_salida_almuerzo: "",
  hora_ingreso_almuerzo: "",
  hora_salida: "17:00",
  duracion_pausa_minutos: 15,
  duracion_almuerzo_minutos: 60,
  motivo: "",
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
    horas_semanales: jornada?.horas_semanales ?? 44,
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
  const [instruccionForm, setInstruccionForm] = useState(INSTRUCCION_DEFAULT);
  const [firmaFile, setFirmaFile] = useState(null);
  const { jornadas, isLoading } = useGetJornadaLaboral({ per_page: 50 });
  const { data: configuracionData, isLoading: loadingConfig } = useQuery({
    queryKey: ["configuracionNomina"],
    queryFn: async () => {
      const response = await configuracionNominaService.getConfiguracion();
      return response.data.data;
    },
  });
  const { data: instruccionData, isLoading: loadingInstruccion } = useQuery({
    queryKey: ["horarioOperacionHoy", instruccionForm.fecha],
    queryFn: async () => {
      const response = await horarioOperacionService.getHoy({ fecha: instruccionForm.fecha || hoyLocal() });
      return response.data.data;
    },
    enabled: !!instruccionForm.fecha,
  });
  const lista = useMemo(() => jornadas?.data?.data ?? [], [jornadas]);
  const [jornadaUuid, setJornadaUuid] = useState("");
  const jornada = lista.find((item) => item.uuid === jornadaUuid) ?? lista[0];
  const [form, setForm] = useState(prepararForm(jornada));
  const [configForm, setConfigForm] = useState(CONFIG_DEFAULT);

  useEffect(() => {
    if (!jornadaUuid && lista[0]?.uuid) {
      setJornadaUuid(lista[0].uuid);
      return;
    }
    setForm(prepararForm(jornada));
  }, [jornada, jornadaUuid, lista]);

  useEffect(() => {
    if (!configuracionData) return;
    setConfigForm({
      nombre: configuracionData.nombre ?? CONFIG_DEFAULT.nombre,
      porcentaje_salud_empleado:    configuracionData.porcentaje_salud_empleado    ?? 4,
      porcentaje_pension_empleado:  configuracionData.porcentaje_pension_empleado  ?? 4,
      porcentaje_salud_empleador:   configuracionData.porcentaje_salud_empleador   ?? 8.50,
      porcentaje_pension_empleador: configuracionData.porcentaje_pension_empleador ?? 12.00,
      porcentaje_arl:               configuracionData.porcentaje_arl               ?? 2.436,
      porcentaje_sena:              configuracionData.porcentaje_sena              ?? 2.00,
      porcentaje_icbf:              configuracionData.porcentaje_icbf              ?? 3.00,
      porcentaje_caja_compensacion: configuracionData.porcentaje_caja_compensacion ?? 4.00,
      status: configuracionData.status ?? true,
    });
  }, [configuracionData]);

  useEffect(() => {
    setInstruccionForm((prev) => ({
      ...INSTRUCCION_DEFAULT,
      ...prev,
      ...(instruccionData ?? {}),
      fecha: instruccionData?.fecha ? String(instruccionData.fecha).slice(0, 10) : prev.fecha,
      jornada_laboral_id: instruccionData?.jornada_laboral_id ?? prev.jornada_laboral_id,
      hora_entrada: normalizarHora(instruccionData?.hora_entrada) || prev.hora_entrada,
      hora_entrada_limite: normalizarHora(instruccionData?.hora_entrada_limite) || prev.hora_entrada_limite,
      hora_salida_pausa: normalizarHora(instruccionData?.hora_salida_pausa) || prev.hora_salida_pausa,
      hora_ingreso_pausa: normalizarHora(instruccionData?.hora_ingreso_pausa) || prev.hora_ingreso_pausa,
      hora_salida_almuerzo: normalizarHora(instruccionData?.hora_salida_almuerzo) || prev.hora_salida_almuerzo,
      hora_ingreso_almuerzo: normalizarHora(instruccionData?.hora_ingreso_almuerzo) || prev.hora_ingreso_almuerzo,
      hora_salida: normalizarHora(instruccionData?.hora_salida) || prev.hora_salida,
    }));
  }, [instruccionData]);

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

  const configMutation = useMutation({
    mutationFn: (payload) => configuracionNominaService.updateConfiguracion(payload),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Configuración de nómina actualizada");
      queryClient.invalidateQueries({ queryKey: ["configuracionNomina"] });
      queryClient.invalidateQueries({ queryKey: ["nominas"] });
      queryClient.invalidateQueries({ queryKey: ["nominaSummary"] });
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No fue posible guardar los porcentajes");
    },
  });

  const instruccionMutation = useMutation({
    mutationFn: (payload) => horarioOperacionService.guardarHoy(payload),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Instrucción operativa guardada");
      queryClient.invalidateQueries({ queryKey: ["horarioOperacionHoy"] });
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No fue posible guardar la instrucción del día");
    },
  });

  const firmaMutation = useMutation({
    mutationFn: (file) => configuracionNominaService.subirFirma(file),
    onSuccess: (response) => {
      setFirmaFile(null);
      showToast("success", response.data?.message || "Firma guardada correctamente");
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No fue posible guardar la firma");
    },
  });

  const handleTimeChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumber = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleConfig = (event) => {
    const { name, value } = event.target;
    setConfigForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstruccion = (event) => {
    const { name, value } = event.target;
    setInstruccionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstruccionTime = (name, value) => {
    setInstruccionForm((prev) => ({ ...prev, [name]: value }));
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

  const guardarHorarioPorFecha = () => {
    if (!jornada) return;
    instruccionMutation.mutate({
      fecha: instruccionForm.fecha || hoyLocal(),
      jornada_laboral_id: jornada.id,
      hora_entrada: form.hora_entrada || null,
      hora_entrada_limite: instruccionForm.hora_entrada_limite || form.hora_entrada || null,
      hora_salida_pausa: form.hora_salida_pausa || null,
      hora_ingreso_pausa: form.hora_ingreso_pausa || null,
      hora_salida_almuerzo: form.hora_salida_almuerzo || null,
      hora_ingreso_almuerzo: form.hora_ingreso_almuerzo || null,
      hora_salida: form.hora_salida || null,
      duracion_pausa_minutos: form.duracion_pausa_minutos ? Number(form.duracion_pausa_minutos) : null,
      duracion_almuerzo_minutos: form.duracion_almuerzo_minutos ? Number(form.duracion_almuerzo_minutos) : null,
      motivo: instruccionForm.motivo || `Horario operativo para ${jornada.nombre}`,
      status: true,
    });
  };

  const guardarConfig = (event) => {
    event.preventDefault();
    configMutation.mutate({
      ...configForm,
      porcentaje_salud_empleado:    Number(configForm.porcentaje_salud_empleado),
      porcentaje_pension_empleado:  Number(configForm.porcentaje_pension_empleado),
      porcentaje_salud_empleador:   Number(configForm.porcentaje_salud_empleador),
      porcentaje_pension_empleador: Number(configForm.porcentaje_pension_empleador),
      porcentaje_arl:               Number(configForm.porcentaje_arl),
      porcentaje_sena:              Number(configForm.porcentaje_sena),
      porcentaje_icbf:              Number(configForm.porcentaje_icbf),
      porcentaje_caja_compensacion: Number(configForm.porcentaje_caja_compensacion),
      status: true,
    });
  };

  const guardarInstruccion = (event) => {
    event.preventDefault();
    instruccionMutation.mutate({
      ...instruccionForm,
      jornada_laboral_id: instruccionForm.jornada_laboral_id ? Number(instruccionForm.jornada_laboral_id) : null,
      duracion_pausa_minutos: instruccionForm.duracion_pausa_minutos ? Number(instruccionForm.duracion_pausa_minutos) : null,
      duracion_almuerzo_minutos: instruccionForm.duracion_almuerzo_minutos ? Number(instruccionForm.duracion_almuerzo_minutos) : null,
      hora_entrada: instruccionForm.hora_entrada || null,
      hora_entrada_limite: instruccionForm.hora_entrada_limite || null,
      hora_salida_pausa: instruccionForm.hora_salida_pausa || null,
      hora_ingreso_pausa: instruccionForm.hora_ingreso_pausa || null,
      hora_salida_almuerzo: instruccionForm.hora_salida_almuerzo || null,
      hora_ingreso_almuerzo: instruccionForm.hora_ingreso_almuerzo || null,
      hora_salida: instruccionForm.hora_salida || null,
      status: true,
    });
  };

  const guardarFirma = (event) => {
    event.preventDefault();
    if (!firmaFile) {
      showToast("error", "Selecciona una imagen de firma.");
      return;
    }
    firmaMutation.mutate(firmaFile);
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

      <form onSubmit={guardarFirma} className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cambiar firma de Talento Humano</h2>
            <p className="text-sm text-gray-500">Actualiza la firma autorizada que se aplica en documentos PDF.</p>
          </div>
          <button
            type="submit"
            disabled={!firmaFile || firmaMutation.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {firmaMutation.isPending ? "Guardando..." : "Guardar firma"}
          </button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Seleccionar archivo</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(event) => setFirmaFile(event.target.files?.[0] ?? null)}
              className="mt-1 block h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </label>
          {firmaFile && (
            <p className="text-xs font-medium text-gray-500">
              {firmaFile.name}
            </p>
          )}
        </div>
      </form>

      <form onSubmit={guardarConfig} className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Porcentajes de liquidación</h2>
            <p className="text-sm text-gray-500">Estos valores se usan para calcular salud y pensión en preliquidación y liquidación.</p>
          </div>
          <button
            type="submit"
            disabled={loadingConfig || configMutation.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {configMutation.isPending ? "Guardando..." : "Guardar porcentajes"}
          </button>
        </div>
        <div className="p-5 space-y-5">
          {/* Empleado */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Deducciones al empleado</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { name: "porcentaje_salud_empleado",   label: "Salud empleado",   puc: "237005" },
                { name: "porcentaje_pension_empleado", label: "Pensión empleado", puc: "237010" },
              ].map(({ name, label, puc }) => (
                <label key={name} className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    {label} <span className="text-gray-300 font-normal">· {puc}</span>
                  </span>
                  <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
                    <input type="number" min="0" max="100" step="0.01" name={name}
                      value={configForm[name]} onChange={handleConfig}
                      className="w-full border-none bg-transparent text-sm text-gray-800 outline-none" />
                    <span className="text-xs font-semibold text-gray-400">%</span>
                  </div>
                </label>
              ))}
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Resumen empleado</p>
                <p className="mt-1 text-sm font-bold text-indigo-900">
                  Salud {Number(configForm.porcentaje_salud_empleado || 0).toFixed(2)}% · Pensión {Number(configForm.porcentaje_pension_empleado || 0).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Empleador */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Aportes empleador (costo empresa)</p>
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              {[
                { name: "porcentaje_salud_empleador",   label: "Salud empleador",  puc: "250505", step: "0.01" },
                { name: "porcentaje_pension_empleador", label: "Pensión empleador", puc: "250510", step: "0.01" },
                { name: "porcentaje_arl",               label: "ARL",              puc: "250515", step: "0.001" },
                { name: "porcentaje_sena",              label: "SENA",             puc: "250520", step: "0.01" },
                { name: "porcentaje_icbf",              label: "ICBF",             puc: "250525", step: "0.01" },
                { name: "porcentaje_caja_compensacion", label: "Caja compensación",puc: "250530", step: "0.01" },
              ].map(({ name, label, puc, step }) => (
                <label key={name} className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    {label} <span className="text-gray-300 font-normal">· {puc}</span>
                  </span>
                  <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3">
                    <input type="number" min="0" max="100" step={step} name={name}
                      value={configForm[name]} onChange={handleConfig}
                      className="w-full border-none bg-transparent text-sm text-gray-800 outline-none" />
                    <span className="text-xs font-semibold text-amber-400">%</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Total costo empleador sobre base prestacional</p>
              <p className="mt-1 text-sm font-bold text-amber-900">
                {(
                  Number(configForm.porcentaje_salud_empleador || 0) +
                  Number(configForm.porcentaje_pension_empleador || 0) +
                  Number(configForm.porcentaje_arl || 0) +
                  Number(configForm.porcentaje_sena || 0) +
                  Number(configForm.porcentaje_icbf || 0) +
                  Number(configForm.porcentaje_caja_compensacion || 0)
                ).toFixed(3)}%
              </p>
            </div>
          </div>
        </div>
      </form>

      <form onSubmit={guardarInstruccion} className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Instrucción operativa del día</h2>
            <p className="text-sm text-gray-500">El kiosko usa estos horarios solo para la fecha indicada, por encima de la jornada base.</p>
          </div>
          <button
            type="submit"
            disabled={loadingInstruccion || instruccionMutation.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {instruccionMutation.isPending ? "Guardando..." : "Guardar instrucción"}
          </button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Fecha</span>
            <input
              type="date"
              name="fecha"
              value={instruccionForm.fecha}
              onChange={handleInstruccion}
              className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Jornada base</span>
            <select
              name="jornada_laboral_id"
              value={instruccionForm.jornada_laboral_id}
              onChange={handleInstruccion}
              className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Usar jornada activa del kiosko</option>
              {lista.map((item) => (
                <option key={item.uuid} value={item.id}>
                  {item.nombre} · {item.horas_semanales} h
                </option>
              ))}
            </select>
          </label>

          <CampoHoraStepper label="Entrada desde" name="hora_entrada" value={instruccionForm.hora_entrada} onChange={handleInstruccionTime} icon={AlarmClock} fallback="07:00" />
          <CampoHoraStepper label="Tardía después de" name="hora_entrada_limite" value={instruccionForm.hora_entrada_limite} onChange={handleInstruccionTime} icon={AlarmClock} fallback="08:00" />
          <CampoHoraStepper label="Salida mínima" name="hora_salida" value={instruccionForm.hora_salida} onChange={handleInstruccionTime} icon={CheckCircle2} fallback="17:00" />
          <CampoHoraStepper label="Salida a pausa" name="hora_salida_pausa" value={instruccionForm.hora_salida_pausa} onChange={handleInstruccionTime} icon={TimerReset} optional fallback="11:00" />
          <CampoHoraStepper label="Regreso de pausa" name="hora_ingreso_pausa" value={instruccionForm.hora_ingreso_pausa} onChange={handleInstruccionTime} icon={TimerReset} optional fallback="11:15" />
          <CampoHoraStepper label="Salida a almuerzo" name="hora_salida_almuerzo" value={instruccionForm.hora_salida_almuerzo} onChange={handleInstruccionTime} icon={Coffee} optional fallback="15:00" />
          <CampoHoraStepper label="Regreso de almuerzo" name="hora_ingreso_almuerzo" value={instruccionForm.hora_ingreso_almuerzo} onChange={handleInstruccionTime} icon={Coffee} optional fallback="16:00" />

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Duración pausa</span>
            <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
              <input
                type="number"
                min="1"
                max="180"
                name="duracion_pausa_minutos"
                value={instruccionForm.duracion_pausa_minutos}
                onChange={handleInstruccion}
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
                value={instruccionForm.duracion_almuerzo_minutos}
                onChange={handleInstruccion}
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
              value={instruccionForm.motivo ?? ""}
              onChange={handleInstruccion}
              placeholder="Ej: Bodega sale a pausa a las 11:00 por instrucción del líder"
              className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>
      </form>

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
              <p className="text-sm text-gray-500">Puedes guardar la jornada base o aplicarla solo a una fecha operativa.</p>
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
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" />
                7 AM · 1 PM · 5 PM
              </button>
              <button
                type="button"
                onClick={guardarHorarioPorFecha}
                disabled={!jornada || instruccionMutation.isPending}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {instruccionMutation.isPending ? "Guardando..." : "Guardar para fecha"}
              </button>
              <button
                type="submit"
                disabled={!jornada || mutation.isPending}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {mutation.isPending ? "Guardando..." : "Guardar jornada base"}
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
                  <CampoHoraStepper label="Tardía después de" name="hora_entrada_limite" value={instruccionForm.hora_entrada_limite} onChange={handleInstruccionTime} icon={AlarmClock} fallback="08:00" />
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
