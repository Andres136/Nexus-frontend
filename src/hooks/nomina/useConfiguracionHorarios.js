import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  horarioOperacionService,
  horarioUsuarioSemanalService,
  jornadaLaboralService,
} from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";
import { useGetJornadaLaboral } from "./useGetJornadaLaboral";
import { useGetEmpleados } from "./useGetEmpleados";

export const HORARIO_DEFAULT = {
  hora_entrada: "07:00",
  hora_salida_almuerzo: "12:00",
  hora_ingreso_almuerzo: "13:00",
  hora_salida_pausa: "",
  hora_ingreso_pausa: "",
  hora_salida: "16:48",
  duracion_pausa_minutos: 10,
  duracion_almuerzo_minutos: 60,
  comando_voz_activo: true,
  status: true,
};

export function hoyLocal() {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const INSTRUCCION_DEFAULT = {
  fecha: hoyLocal(),
  kiosko_device_id: "",
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
  motivo: "",
  status: true,
};

export const DIAS_SEMANA = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 7, label: "Dom" },
];

export function normalizarHora(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

export function pad(value) {
  return String(value).padStart(2, "0");
}

export function separarHora(value, fallback = "07:00") {
  const base = value || fallback;
  const [hora = "0", minuto = "0"] = String(base).split(":");

  return {
    hora: Number(hora),
    minuto: Number(minuto),
  };
}

export function ajustarTiempo(value, parte, delta, fallback) {
  const actual = separarHora(value, fallback);

  if (parte === "hora") {
    actual.hora = (actual.hora + delta + 24) % 24;
  } else {
    actual.minuto = (actual.minuto + delta + 60) % 60;
  }

  return `${pad(actual.hora)}:${pad(actual.minuto)}`;
}

export function sumarMinutosHora(value, minutos) {
  if (!value || !minutos) return "";

  const { hora, minuto } = separarHora(value);
  const total = (hora * 60 + minuto + Number(minutos)) % (24 * 60);
  const normalizado = total < 0 ? total + 24 * 60 : total;

  return `${pad(Math.floor(normalizado / 60))}:${pad(normalizado % 60)}`;
}

export function aplicarRegresosPorDuracion(data) {
  const next = { ...data };

  if (next.hora_salida_pausa && next.duracion_pausa_minutos) {
    next.hora_ingreso_pausa = sumarMinutosHora(
      next.hora_salida_pausa,
      next.duracion_pausa_minutos
    );
  } else if (!next.hora_salida_pausa) {
    next.hora_ingreso_pausa = "";
  }

  if (next.hora_salida_almuerzo && next.duracion_almuerzo_minutos) {
    next.hora_ingreso_almuerzo = sumarMinutosHora(
      next.hora_salida_almuerzo,
      next.duracion_almuerzo_minutos
    );
  } else if (!next.hora_salida_almuerzo) {
    next.hora_ingreso_almuerzo = "";
  }

  return next;
}

export function prepararForm(jornada) {
  return {
    nombre: jornada?.nombre ?? "",
    horas_semanales: jornada?.horas_semanales ?? 44,
    status: jornada?.status ?? true,
    hora_entrada:
      normalizarHora(jornada?.hora_entrada) || HORARIO_DEFAULT.hora_entrada,
    hora_salida_almuerzo:
      normalizarHora(jornada?.hora_salida_almuerzo) ||
      HORARIO_DEFAULT.hora_salida_almuerzo,
    hora_ingreso_almuerzo:
      normalizarHora(jornada?.hora_ingreso_almuerzo) ||
      HORARIO_DEFAULT.hora_ingreso_almuerzo,
    hora_salida_pausa: normalizarHora(jornada?.hora_salida_pausa),
    hora_ingreso_pausa: normalizarHora(jornada?.hora_ingreso_pausa),
    hora_salida:
      normalizarHora(jornada?.hora_salida) || HORARIO_DEFAULT.hora_salida,
    duracion_pausa_minutos:
      jornada?.duracion_pausa_minutos ??
      HORARIO_DEFAULT.duracion_pausa_minutos,
    duracion_almuerzo_minutos:
      jornada?.duracion_almuerzo_minutos ??
      HORARIO_DEFAULT.duracion_almuerzo_minutos,
    comando_voz_activo: true,
  };
}

export function useConfiguracionHorarios() {
  const queryClient = useQueryClient();

  const [instruccionForm, setInstruccionForm] =
    useState(INSTRUCCION_DEFAULT);
  const [horarioUsuarioForm, setHorarioUsuarioForm] = useState({
    user_id: "",
    dias: [1, 2, 3, 4, 5],
  });

  const { jornadas, isLoading } = useGetJornadaLaboral({ per_page: 50 });
  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados({
    con_contrato: true,
  });

  const lista = useMemo(() => jornadas?.data?.data ?? [], [jornadas]);

  const [jornadaUuid, setJornadaUuid] = useState("");

  const jornada = lista.find((item) => item.uuid === jornadaUuid) ?? lista[0];

  const [form, setForm] = useState(prepararForm(jornada));

  const { data: instruccionData } = useQuery({
    queryKey: [
      "horarioOperacionHoy",
      instruccionForm.fecha,
      instruccionForm.kiosko_device_id,
    ],
    queryFn: async () => {
      const response = await horarioOperacionService.getHoy({
        fecha: instruccionForm.fecha || hoyLocal(),
        kiosko_device_id: instruccionForm.kiosko_device_id || undefined,
      });

      return response.data.data;
    },
    enabled: !!instruccionForm.fecha,
  });

  const { data: horariosUsuario = [], isFetching: loadingHorariosUsuario } = useQuery({
    queryKey: ["horariosUsuarioSemanales", horarioUsuarioForm.user_id],
    queryFn: async () => {
      const response = await horarioUsuarioSemanalService.getPorUsuario(horarioUsuarioForm.user_id);
      return response.data?.data ?? [];
    },
    enabled: !!horarioUsuarioForm.user_id,
  });

  useEffect(() => {
    if (!jornadaUuid && lista[0]?.uuid) {
      setJornadaUuid(lista[0].uuid);
      return;
    }

    setForm(prepararForm(jornada));
  }, [jornada, jornadaUuid, lista]);

  useEffect(() => {
    setInstruccionForm((prev) => ({
      ...INSTRUCCION_DEFAULT,
      ...prev,
      ...(instruccionData ?? {}),
      fecha: instruccionData?.fecha
        ? String(instruccionData.fecha).slice(0, 10)
        : prev.fecha,
      kiosko_device_id:
        instruccionData?.kiosko_device_id ?? prev.kiosko_device_id,
      jornada_laboral_id:
        instruccionData?.jornada_laboral_id ?? prev.jornada_laboral_id,
      hora_entrada:
        normalizarHora(instruccionData?.hora_entrada) || prev.hora_entrada,
      hora_entrada_limite:
        normalizarHora(instruccionData?.hora_entrada_limite) ||
        prev.hora_entrada_limite,
      hora_salida_pausa:
        normalizarHora(instruccionData?.hora_salida_pausa) ||
        prev.hora_salida_pausa,
      hora_ingreso_pausa:
        normalizarHora(instruccionData?.hora_ingreso_pausa) ||
        prev.hora_ingreso_pausa,
      hora_salida_almuerzo:
        normalizarHora(instruccionData?.hora_salida_almuerzo) ||
        prev.hora_salida_almuerzo,
      hora_ingreso_almuerzo:
        normalizarHora(instruccionData?.hora_ingreso_almuerzo) ||
        prev.hora_ingreso_almuerzo,
      hora_salida:
        normalizarHora(instruccionData?.hora_salida) || prev.hora_salida,
    }));
  }, [instruccionData]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      jornadaLaboralService.updateJornada(jornada.uuid, payload),
    onSuccess: (response) => {
      showToast(
        "success",
        response.data?.message || "Horario operativo actualizado"
      );

      queryClient.invalidateQueries({ queryKey: ["jornadaLaboral"] });
    },
    onError: (error) => {
      showToast(
        "error",
        error.response?.data?.message ||
          "No fue posible guardar la configuración"
      );
    },
  });

  const instruccionMutation = useMutation({
    mutationFn: (payload) => horarioOperacionService.guardarHoy(payload),
    onSuccess: (response) => {
      showToast(
        "success",
        response.data?.message || "Instrucción operativa guardada"
      );

      queryClient.invalidateQueries({ queryKey: ["horarioOperacionHoy"] });
    },
    onError: (error) => {
      showToast(
        "error",
        error.response?.data?.message ||
          "No fue posible guardar la instrucción del día"
      );
    },
  });

  const horarioUsuarioMutation = useMutation({
    mutationFn: (payload) => horarioUsuarioSemanalService.guardarSemana(payload),
    onSuccess: (response) => {
      showToast(
        "success",
        response.data?.message || "Horario semanal del usuario guardado"
      );

      queryClient.invalidateQueries({ queryKey: ["horariosUsuarioSemanales"] });
    },
    onError: (error) => {
      showToast(
        "error",
        error.response?.data?.message ||
          "No fue posible guardar el horario del usuario"
      );
    },
  });

  const handleTimeChange = (name, value) => {
    setForm((prev) =>
      aplicarRegresosPorDuracion({
        ...prev,
        [name]: value,
      })
    );
  };

  const handleNumber = (event) => {
    const { name, value } = event.target;

    setForm((prev) =>
      aplicarRegresosPorDuracion({
        ...prev,
        [name]: Number(value),
      })
    );
  };

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

  const handleHorarioUsuario = (event) => {
    const { name, value } = event.target;
    setHorarioUsuarioForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDiaUsuario = (dia) => {
    setHorarioUsuarioForm((prev) => {
      const dias = prev.dias.includes(dia)
        ? prev.dias.filter((item) => item !== dia)
        : [...prev.dias, dia].sort((a, b) => a - b);

      return { ...prev, dias };
    });
  };

  const aplicarDefault = () => {
    setForm((prev) => ({
      ...prev,
      ...HORARIO_DEFAULT,
    }));
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
      kiosko_device_id: instruccionForm.kiosko_device_id
        ? Number(instruccionForm.kiosko_device_id)
        : null,
      jornada_laboral_id: jornada.id,
      hora_entrada: form.hora_entrada || null,
      hora_entrada_limite:
        instruccionForm.hora_entrada_limite || form.hora_entrada || null,
      hora_salida_pausa: form.hora_salida_pausa || null,
      hora_ingreso_pausa: form.hora_ingreso_pausa || null,
      hora_salida_almuerzo: form.hora_salida_almuerzo || null,
      hora_ingreso_almuerzo: form.hora_ingreso_almuerzo || null,
      hora_salida: form.hora_salida || null,
      duracion_pausa_minutos: form.duracion_pausa_minutos
        ? Number(form.duracion_pausa_minutos)
        : null,
      duracion_almuerzo_minutos: form.duracion_almuerzo_minutos
        ? Number(form.duracion_almuerzo_minutos)
        : null,
      motivo:
        instruccionForm.motivo || `Horario operativo para ${jornada.nombre}`,
      status: true,
    });
  };

  const guardarHorarioUsuario = () => {
    if (!horarioUsuarioForm.user_id || !jornada || !horarioUsuarioForm.dias.length) {
      showToast("error", "Selecciona un empleado y al menos un día.");
      return;
    }

    const existentesPorDia = new Map(
      horariosUsuario.map((item) => [Number(item.dia_semana), item])
    );

    horarioUsuarioMutation.mutate({
      user_id: Number(horarioUsuarioForm.user_id),
      horarios: horarioUsuarioForm.dias.map((dia) => {
        const existente = existentesPorDia.get(Number(dia));

        return {
          dia_semana: Number(dia),
          jornada_laboral_id: jornada.id,
          hora_entrada: form.hora_entrada || existente?.hora_entrada || null,
          hora_entrada_limite:
            instruccionForm.hora_entrada_limite ||
            existente?.hora_entrada_limite ||
            form.hora_entrada ||
            null,
          hora_salida_pausa: form.hora_salida_pausa || null,
          hora_ingreso_pausa: form.hora_ingreso_pausa || null,
          hora_salida_almuerzo: form.hora_salida_almuerzo || null,
          hora_ingreso_almuerzo: form.hora_ingreso_almuerzo || null,
          hora_salida: form.hora_salida || null,
          duracion_pausa_minutos: form.duracion_pausa_minutos
            ? Number(form.duracion_pausa_minutos)
            : null,
          duracion_almuerzo_minutos: form.duracion_almuerzo_minutos
            ? Number(form.duracion_almuerzo_minutos)
            : null,
          status: true,
        };
      }),
    });
  };

  return {
    lista,
    jornada,
    jornadaUuid,
    setJornadaUuid,
    form,
    setForm,
    instruccionForm,
    setInstruccionForm,
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
  };
}
