import { useCallback, useEffect, useMemo, useState } from "react";
import { horaExtraService, workSessionService } from "../../services/nominaService";
import { hablar } from "../../helpers/voz";

export const hhmm = (date) =>
  date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" });

export function horaServidor(valor) {
  if (!valor) return null;
  const value = String(valor);
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  if (hasTimezone) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Bogota",
      });
    }
  }
  const match = value.match(/(?:T|\s)(\d{2}):(\d{2})/);
  if (!match) return null;
  const hour   = Number(match[1]);
  const minute = match[2];
  const hour12 = hour % 12 || 12;
  const suffix = hour >= 12 ? "p. m." : "a. m.";
  return `${String(hour12).padStart(2, "0")}:${minute} ${suffix}`;
}

export const minsToHM = (mins) => {
  if (!mins) return "0 h 0 min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} h ${m} min`;
};

const tiempoHHMMSS = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
};

function mensajeErrorApi(error, fallback = "Error al registrar. Intenta de nuevo.") {
  return error?.response?.data?.message || error?.message || fallback;
}

function parseTime(str) {
  if (!str) return null;
  const value = String(str);
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  if (hasTimezone) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const match = value.match(/(?:T|\s)(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  const d = new Date();
  d.setHours(Number(match[1]), Number(match[2]), Number(match[3] ?? 0), 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

function minutosDia(fecha = new Date()) {
  return fecha.getHours() * 60 + fecha.getMinutes();
}

function minutosHora(hora) {
  if (!hora) return null;
  const [hh = "0", mm = "0"] = String(hora).split(":");
  return Number(hh) * 60 + Number(mm);
}

function minutosTardeContraHora(horaProgramada, fecha = new Date()) {
  const limite = minutosHora(horaProgramada);
  if (limite === null) return 0;
  return Math.max(0, minutosDia(fecha) - limite);
}

function detectarAccion(session, jornada, ahora = new Date()) {
  const actual        = minutosDia(ahora);
  const salida        = minutosHora(jornada?.hora_salida);
  const salidaAlm     = minutosHora(jornada?.hora_salida_almuerzo);
  const ingresoAlm    = minutosHora(jornada?.hora_ingreso_almuerzo);
  const salidaPausa   = minutosHora(jornada?.hora_salida_pausa);
  const ingresoPausa  = minutosHora(jornada?.hora_ingreso_pausa);
  const pausaFin      = salidaPausa !== null
    ? (ingresoPausa ?? salidaPausa + (jornada?.duracion_pausa_minutos ?? 15))
    : null;

  if (session?.hora_salida_brake    && !session?.hora_ingreso_brake)   return "pausaEntrada";
  if (session?.hora_salida_almuerzo && !session?.hora_ingreso_almuerzo) return "almuerzoEntrada";
  if (!session?.hora_salida && salida !== null && actual >= salida)     return "salida";
  if (!session?.hora_salida_almuerzo && salidaAlm !== null && ingresoAlm !== null && actual >= salidaAlm && actual < ingresoAlm) return "almuerzoSalida";
  if (!session?.hora_salida_brake   && salidaPausa !== null && pausaFin !== null && actual >= salidaPausa && actual < pausaFin)  return "pausaSalida";
  return null;
}

function entradaTieneTardanza(session, jornada) {
  if ((session?.minutos_tardanza ?? 0) > 0) return true;
  return false;
}

function entradaOperativa(session, jornada) {
  const entrada = parseTime(session?.hora_entrada);
  if (!entrada || !jornada?.hora_entrada) return entrada;
  const [hh = "0", mm = "0"] = String(jornada.hora_entrada).split(":");
  const programada = new Date(entrada);
  programada.setHours(Number(hh), Number(mm), 0, 0);
  return entrada < programada ? programada : entrada;
}

function obtenerJornada(session, jornadaActiva) {
  return jornadaActiva ?? session?.jornada_laboral ?? session?.jornadaLaboral ?? {};
}

function decir(jornada, texto) {
  if (jornada?.comando_voz_activo === false) return;
  hablar(texto);
}

const VOZ = {
  salida:              (nombre, horas)   => horas > 0
    ? `Registro exitoso, ${nombre}. Salida laboral registrada con ${horas} hora(s) extra autorizada(s). Hasta pronto.`
    : `Registro exitoso, ${nombre}. Salida laboral registrada. Hasta pronto.`,
  pausaSalida:         (nombre, minutos) => `Salida a break exitosa, ${nombre}. Tu próximo registro será en ${minutos} minutos.`,
  pausaEntrada:        (nombre)          => `Registro exitoso, ${nombre}. Regreso de pausa registrado. Bienvenido de vuelta.`,
  almuerzoSalida:      (nombre)          => `Buen provecho, ${nombre}. Salida a almuerzo registrada correctamente.`,
  almuerzoEntrada:     (nombre)          => `Registro exitoso, ${nombre}. Regreso de almuerzo registrado. Bienvenido de vuelta.`,
  almuerzoEntradaTarde:(nombre, minutos) => `Registro exitoso, ${nombre}. Regreso de almuerzo registrado con tardanza de ${minutos} minutos.`,
};

export function useKioskoAcciones({ empleado, jornadaActiva, onRefrescarJornada, onDone, onCancelar }) {
  const { session } = empleado;

  const [guardando, setGuardando]               = useState(false);
  const [exitoMsg, setExitoMsg]                 = useState("");
  const [esperaMsg, setEsperaMsg]               = useState("Detectando marcación según tu horario...");
  const [tipoMensaje, setTipoMensaje]           = useState("info");
  const [jornadaSincronizada, setJornadaSincronizada] = useState(false);
  const [jornadaOperativa, setJornadaOperativa] = useState(null);
  const [horasExtraAprobadas, setHorasExtraAprobadas] = useState(0);

  const jornada        = useMemo(() => obtenerJornada(session, jornadaOperativa ?? jornadaActiva), [session, jornadaActiva, jornadaOperativa]);
  const accionDetectada = useMemo(() => detectarAccion(session, jornada), [session, jornada]);

  const entrada      = entradaOperativa(session, jornada);
  const llegadaTarde = entradaTieneTardanza(session, jornada);
  const enPausa      = !!session?.hora_salida_brake    && !session?.hora_ingreso_brake;
  const enAlmuerzo   = !!session?.hora_salida_almuerzo && !session?.hora_ingreso_almuerzo;

  useEffect(() => {
    let mounted = true;
    setJornadaSincronizada(false);
    setEsperaMsg("Actualizando horario operativo del día...");
    Promise.all([
      Promise.resolve(onRefrescarJornada?.()),
      horaExtraService.getHorasExtrasAprobadasHoy(empleado.userId),
    ])
      .then(([jornadaActualizada, horasExtraResponse]) => {
        if (mounted && jornadaActualizada) setJornadaOperativa(jornadaActualizada);
        if (mounted) {
          const data = horasExtraResponse.data?.data;
          const total = data?.total_horas
            ?? (data?.data ?? []).reduce((sum, item) => sum + Number(item.horas ?? 0), 0);
          setHorasExtraAprobadas(Number(total || 0));
        }
      })
      .catch(() => {
        if (mounted) setJornadaOperativa(jornadaActiva ?? null);
      })
      .finally(() => {
        if (mounted) setJornadaSincronizada(true);
      });
    return () => { mounted = false; };
  }, [empleado.userId, jornadaActiva, onRefrescarJornada]);

  const ejecutar = useCallback(async (payload, textoVoz, mensajePantalla) => {
    setGuardando(true);
    setTipoMensaje("info");
    setEsperaMsg("Registrando marcación...");
    try {
      const response = await workSessionService.updateSession(session.uuid, payload);
      const avisoKiosko = response.data?.data?.aviso_kiosko;
      decir(jornada, avisoKiosko || textoVoz);
      setTipoMensaje("exito");
      setExitoMsg(avisoKiosko || mensajePantalla);
      setTimeout(() => onDone(empleado.nombre, hhmm(new Date()), empleado.userId), 3000);
    } catch (error) {
      const mensaje = mensajeErrorApi(error);
      setTipoMensaje("error");
      setEsperaMsg(mensaje);
      decir(jornada, mensaje);
      setTimeout(onCancelar, 4000);
    } finally {
      setGuardando(false);
    }
  }, [empleado.nombre, empleado.userId, jornada, onCancelar, onDone, session.uuid]);

  useEffect(() => {
    if (!jornadaSincronizada) return;
    if (guardando || exitoMsg) return;

    const tardanza = minutosTardeContraHora(jornada?.hora_ingreso_almuerzo);
    const minutosPausa = jornada?.duracion_pausa_minutos ?? 15;
    const acciones = {
      salida: () => ejecutar(
        { hora_salida: tiempoHHMMSS() },
        VOZ.salida(empleado.nombre, horasExtraAprobadas),
        horasExtraAprobadas > 0
          ? `Registro exitoso. Salida laboral registrada con ${horasExtraAprobadas} hora(s) extra autorizada(s), ${empleado.nombre}.`
          : `Registro exitoso. Salida laboral registrada, ${empleado.nombre}.`
      ),
      pausaSalida: () => ejecutar(
        { hora_salida_brake: tiempoHHMMSS() },
        VOZ.pausaSalida(empleado.nombre, minutosPausa),
        `Salida a break exitosa, ${empleado.nombre}. Tu próximo registro será en ${minutosPausa} minutos.`
      ),
      pausaEntrada: () => ejecutar(
        { hora_ingreso_brake: tiempoHHMMSS() },
        VOZ.pausaEntrada(empleado.nombre),
        `Registro exitoso. Regreso de pausa registrado, ${empleado.nombre}.`
      ),
      almuerzoSalida: () => ejecutar(
        { hora_salida_almuerzo: tiempoHHMMSS() },
        VOZ.almuerzoSalida(empleado.nombre),
        `Buen provecho, ${empleado.nombre}. Salida a almuerzo registrada.`
      ),
      almuerzoEntrada: () => ejecutar(
        { hora_ingreso_almuerzo: tiempoHHMMSS() },
        tardanza > 0
          ? VOZ.almuerzoEntradaTarde(empleado.nombre, tardanza)
          : VOZ.almuerzoEntrada(empleado.nombre),
        tardanza > 0
          ? `Registro exitoso. Regreso de almuerzo con tardanza de ${tardanza} min, ${empleado.nombre}.`
          : `Registro exitoso. Regreso de almuerzo registrado, ${empleado.nombre}.`
      ),
    };

    if (accionDetectada && acciones[accionDetectada]) {
      acciones[accionDetectada]();
      return;
    }

    const salidaMins = minutosHora(jornada?.hora_salida);
    if (!session?.hora_salida && salidaMins !== null && minutosDia() < salidaMins) {
      const minutosParaSalida = salidaMins - minutosDia();
      if (minutosParaSalida <= 60) {
        setTipoMensaje("alerta");
        setEsperaMsg(horasExtraAprobadas > 0
          ? `Tienes ${horasExtraAprobadas} hora(s) extra autorizada(s). Aún no es hora de salida.`
          : llegadaTarde ? "Llegada tarde registrada. Aún no es hora de salida." : "Aún no es hora de salida."
        );
        decir(jornada, horasExtraAprobadas > 0
          ? `${empleado.nombre}, tienes ${horasExtraAprobadas} hora(s) extra autorizada(s). Aún no es hora de salida.`
          : llegadaTarde
            ? `${empleado.nombre}, llegada tarde registrada. Aún no es hora de salida.`
            : `${empleado.nombre}, aún no es hora de salida.`
        );
      } else {
        setTipoMensaje(llegadaTarde ? "tarde" : "info");
        setEsperaMsg(horasExtraAprobadas > 0
          ? `Tienes ${horasExtraAprobadas} hora(s) extra autorizada(s) para hoy.`
          : llegadaTarde ? "Llegada tarde registrada." : "Marcación registrada. Jornada en curso."
        );
        if (horasExtraAprobadas > 0) {
          decir(jornada, `${empleado.nombre}, tienes ${horasExtraAprobadas} hora(s) extra autorizada(s) para hoy.`);
        } else if (llegadaTarde) {
          decir(jornada, `${empleado.nombre}, llegada tarde registrada.`);
        }
      }
    } else {
      setTipoMensaje("info");
      setEsperaMsg("No hay una marcación programada para este momento.");
    }

    const timer = setTimeout(onCancelar, 3000);
    return () => clearTimeout(timer);
  }, [
    accionDetectada,
    empleado.nombre,
    exitoMsg,
    guardando,
    horasExtraAprobadas,
    ejecutar,
    jornada,
    jornadaSincronizada,
    llegadaTarde,
    onCancelar,
    session?.hora_salida,
    session?.hora_salida_almuerzo,
    session?.hora_salida_brake,
  ]);

  return {
    guardando,
    exitoMsg,
    esperaMsg,
    tipoMensaje,
    jornada,
    entrada,
    llegadaTarde,
    enPausa,
    enAlmuerzo,
  };
}
