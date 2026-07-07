import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import InstruccionOperativaDia from "../../components/nomina/InstruccionOperativaDia";
import { useGetEmpleados } from "../../hooks/nomina/useGetEmpleados";
import { useGetJornadaLaboral } from "../../hooks/nomina/useGetJornadaLaboral";
import { useGetKioscos } from "../../hooks/nomina/useGetKioscos";
import { horarioOperacionService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

const hoyLocal = () => {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const INSTRUCCION_DEFAULT = {
  fecha: hoyLocal(),
  kiosko_device_ids: [],
  jornada_laboral_id: "",
  hora_entrada: "07:00",
  hora_entrada_limite: "08:00",
  hora_salida_pausa: "",
  hora_ingreso_pausa: "",
  hora_salida_almuerzo: "",
  hora_ingreso_almuerzo: "",
  hora_salida: "17:00",
  duracion_pausa_minutos: 10,
  duracion_almuerzo_minutos: 60,
  users: [],
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

function sumarMinutosHora(value, minutos) {
  if (!value || !minutos) return "";

  const { hora, minuto } = separarHora(value);
  const total = (hora * 60 + minuto + Number(minutos)) % (24 * 60);
  const normalizado = total < 0 ? total + (24 * 60) : total;

  return `${pad(Math.floor(normalizado / 60))}:${pad(normalizado % 60)}`;
}

function aplicarRegresosPorDuracion(data) {
  const next = { ...data };

  if (next.hora_salida_pausa && next.duracion_pausa_minutos) {
    next.hora_ingreso_pausa = sumarMinutosHora(next.hora_salida_pausa, next.duracion_pausa_minutos);
  } else if (!next.hora_salida_pausa) {
    next.hora_ingreso_pausa = "";
  }

  if (next.hora_salida_almuerzo && next.duracion_almuerzo_minutos) {
    next.hora_ingreso_almuerzo = sumarMinutosHora(next.hora_salida_almuerzo, next.duracion_almuerzo_minutos);
  } else if (!next.hora_salida_almuerzo) {
    next.hora_ingreso_almuerzo = "";
  }

  return next;
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
          <Icon className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.8} />

          <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">
              <span className="font-mono text-lg font-bold tabular-nums text-gray-900">{mostrarHora}</span>
              <div className="flex flex-col">
                <button type="button" onClick={() => cambiar("hora", 1)} className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => cambiar("hora", -1)} className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <span className="font-mono text-lg font-bold text-gray-300">:</span>

            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">
              <span className="font-mono text-lg font-bold tabular-nums text-gray-900">{mostrarMinuto}</span>
              <div className="flex flex-col">
                <button type="button" onClick={() => cambiar("minuto", 1)} className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => cambiar("minuto", -1)} className="flex h-4 w-5 items-center justify-center rounded text-gray-400 hover:bg-indigo-100 hover:text-indigo-600">
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

export default function PageInstruccionOperativa({ embedded = false }) {
  const queryClient = useQueryClient();
  const [instruccionForm, setInstruccionForm] = useState(INSTRUCCION_DEFAULT);

  const { jornadas, isLoading: loadingJornadas } = useGetJornadaLaboral({ per_page: 50 });
  const { kioscos, isLoading: loadingKioscos } = useGetKioscos({ all: true });

  const lista = useMemo(() => jornadas?.data?.data ?? [], [jornadas]);
  const kioscosLista = useMemo(() => kioscos?.data?.data ?? kioscos?.data ?? [], [kioscos]);
  const kioskoUnicoSeleccionado = useMemo(() => {
    if ((instruccionForm.kiosko_device_ids ?? []).length !== 1) return undefined;
    return kioscosLista.find((item) => String(item.id) === String(instruccionForm.kiosko_device_ids[0]));
  }, [instruccionForm.kiosko_device_ids, kioscosLista]);
  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados({
    con_contrato: true,
    sede_id: kioskoUnicoSeleccionado?.sede_id || kioskoUnicoSeleccionado?.sede?.id || undefined,
  });

  const kioskosParaCargar = instruccionForm.kiosko_device_ids ?? [];
  const { data: instruccionData, isLoading: loadingInstruccion } = useQuery({
    queryKey: ["horarioOperacionHoy", instruccionForm.fecha, kioskosParaCargar[0] ?? null],
    queryFn: async () => {
      const response = await horarioOperacionService.getHoy({
        fecha: instruccionForm.fecha || hoyLocal(),
        kiosko_device_id: kioskosParaCargar[0] || undefined,
      });

      return response.data.data;
    },
    enabled: !!instruccionForm.fecha && kioskosParaCargar.length <= 1,
  });

  useEffect(() => {
    setInstruccionForm((prev) => ({
      ...INSTRUCCION_DEFAULT,
      ...prev,
      users: prev.users ?? [],
      fecha: instruccionData?.fecha ? String(instruccionData.fecha).slice(0, 10) : prev.fecha,
      kiosko_device_ids: instruccionData?.kiosko_device_id ? [instruccionData.kiosko_device_id] : prev.kiosko_device_ids,
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

  const handleInstruccion = (event) => {
    const { name, value } = event.target;

    setInstruccionForm((prev) =>
      aplicarRegresosPorDuracion({
        ...prev,
        [name]: name.includes("duracion") ? Number(value) : value,
      })
    );
  };

  const handleInstruccionTime = (name, value) => {
    setInstruccionForm((prev) =>
      aplicarRegresosPorDuracion({
        ...prev,
        [name]: value,
      })
    );
  };

  const handleUsuarios = (options) => {
    setInstruccionForm((prev) => ({
      ...prev,
      users: (options ?? []).map((option) => option.value),
    }));
  };

  const handleKioscos = (options) => {
    setInstruccionForm((prev) => ({
      ...prev,
      kiosko_device_ids: (options ?? []).map((option) => option.value),
      users: [],
    }));
  };

  const guardarInstruccion = (event) => {
    event.preventDefault();

    instruccionMutation.mutate({
      ...instruccionForm,
      kiosko_device_ids: (instruccionForm.kiosko_device_ids ?? []).map(Number),
      jornada_laboral_id: instruccionForm.jornada_laboral_id ? Number(instruccionForm.jornada_laboral_id) : null,
      duracion_pausa_minutos: instruccionForm.duracion_pausa_minutos ? Number(instruccionForm.duracion_pausa_minutos) : null,
      duracion_almuerzo_minutos: instruccionForm.duracion_almuerzo_minutos ? Number(instruccionForm.duracion_almuerzo_minutos) : null,
      users: (instruccionForm.users ?? []).map(Number),
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

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6"}>
      <div className={embedded ? "" : "mx-auto max-w-5xl"}>
        <InstruccionOperativaDia
          CampoHoraStepper={CampoHoraStepper}
          form={instruccionForm}
          jornadas={lista}
          kioscos={kioscosLista}
          empleados={empleados}
          loadingEmpleados={loadingEmpleados}
          loading={loadingInstruccion || loadingKioscos || loadingJornadas}
          saving={instruccionMutation.isPending}
          onSubmit={guardarInstruccion}
          onFieldChange={handleInstruccion}
          onTimeChange={handleInstruccionTime}
          onUsersChange={handleUsuarios}
          onKioscosChange={handleKioscos}
        />
      </div>
    </div>
  );
}

PageInstruccionOperativa.propTypes = {
  embedded: PropTypes.bool,
};
