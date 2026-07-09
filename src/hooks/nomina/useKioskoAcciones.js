import { useCallback, useEffect, useMemo, useState } from "react";
import { horaExtraService, workSessionService } from "../../services/nominaService";
import { removeKioskoGuestSession, removeKioskoSession, shouldClearKioskoSession } from "../../helpers/nomina/kioskoSession";
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

function horaRegresoDesdeAhora(minutos) {
  if (minutos === null) return null;
  const regreso = new Date();
  regreso.setMinutes(regreso.getMinutes() + minutos);
  return regreso.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Bogota",
  });
}

function mensajeDescanso(nombre, tipo, minutos) {
  const horaRegreso = horaRegresoDesdeAhora(minutos);
  if (!horaRegreso) return null;

  return tipo === "pausa"
    ? `Salida a break exitosa, ${nombre}. Tu pausa es de ${minutos} minutos. Regresa a las ${horaRegreso}.`
    : `Buen provecho, ${nombre}. Tu almuerzo es de ${minutos} minutos. Regresa a las ${horaRegreso}.`;
}

function mensajeErrorApi(error, fallback = "Error al registrar. Intenta de nuevo.") {
  return error?.response?.data?.message || error?.message || fallback;
}

function uuidKioskoActual() {
  const match = window.location.pathname.match(/^\/kiosko\/([^/]+)/);
  const uuid = match?.[1];

  if (!uuid || uuid === "activar" || uuid === "acceso-temporal") return null;

  return uuid;
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

function minutosPausaConfigurada(jornada) {
  const minutos = Number(jornada?.duracion_pausa_minutos);
  return Number.isFinite(minutos) && minutos > 0 ? minutos : null;
}

function minutosAlmuerzoConfigurado(jornada) {
  const minutos = Number(jornada?.duracion_almuerzo_minutos);
  return Number.isFinite(minutos) && minutos > 0 ? minutos : null;
}

function minutosTardeAlmuerzo(session, jornada, fecha = new Date()) {
  const tardanzaHorario = minutosTardeContraHora(jornada?.hora_ingreso_almuerzo, fecha);
  const minutosAlmuerzo = minutosAlmuerzoConfigurado(jornada);
  const salidaAlmuerzo = parseTime(session?.hora_salida_almuerzo);

  if (!salidaAlmuerzo || minutosAlmuerzo === null) {
    return tardanzaHorario;
  }

  const regresoPermitido = new Date(salidaAlmuerzo);
  regresoPermitido.setMinutes(regresoPermitido.getMinutes() + minutosAlmuerzo);

  const tardanzaDuracion = Math.max(0, Math.floor((fecha.getTime() - regresoPermitido.getTime()) / 60000));
  return Math.max(tardanzaHorario, tardanzaDuracion);
}

function detectarAccion(session, jornada, ahora = new Date()) {
  const actual      = minutosDia(ahora);
  const salida      = minutosHora(jornada?.hora_salida);
  const salidaAlm   = minutosHora(jornada?.hora_salida_almuerzo);
  const salidaPausa = minutosHora(jornada?.hora_salida_pausa);

  if (session?.hora_salida_brake && !session?.hora_ingreso_brake) {
    return "pausaEntrada";
  }
  if (session?.hora_salida_almuerzo && !session?.hora_ingreso_almuerzo) {
    return "almuerzoEntrada";
  }
  // Cada condición solo exige no ser antes de la hora programada (sin límite
  // superior), para no depender de una instrucción operativa diaria que ajuste
  // la ventana cuando la operación se corre de horario. Se prioriza el hito
  // más avanzado ya alcanzado: si ya es hora de salida, se sale aunque no se
  // haya tomado pausa/almuerzo; si ya es hora de almuerzo pero no hubo pausa,
  // se toma almuerzo directamente en vez de forzar la pausa vencida.
  if (!session?.hora_salida && salida !== null && actual >= salida) return "salida";
  if (!session?.hora_salida_almuerzo && salidaAlm !== null && actual >= salidaAlm) return "almuerzoSalida";
  if (!session?.hora_salida_brake   && salidaPausa !== null && actual >= salidaPausa) return "pausaSalida";
  if (!session?.hora_salida && salida === null) return "salida";
  return null;
}

function entradaTieneTardanza(session) {
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
  const llegadaTarde = entradaTieneTardanza(session);
  const enPausa      = !!session?.hora_salida_brake    && !session?.hora_ingreso_brake;
  const enAlmuerzo   = !!session?.hora_salida_almuerzo && !session?.hora_ingreso_almuerzo;

  useEffect(() => {
    let mounted = true;
    setJornadaSincronizada(false);
    setEsperaMsg("Actualizando horario operativo del día...");
    Promise.all([
      Promise.resolve(onRefrescarJornada?.(empleado.userId)),
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
      let mensaje = mensajeErrorApi(error);

      if (error.response?.status === 403) {
        const uuid = uuidKioskoActual();

        if (uuid && shouldClearKioskoSession(mensaje)) {
          removeKioskoSession(uuid);
          removeKioskoGuestSession(uuid);
        }

        if (shouldClearKioskoSession(mensaje)) {
          mensaje = "La sesión de este kiosko cambió o fue reactivada. Abre el nuevo link de activación en este dispositivo.";
        }
      }

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

    const tardanza = minutosTardeAlmuerzo(session, jornada);
    const minutosPausa = minutosPausaConfigurada(jornada);
    const minutosAlmuerzo = minutosAlmuerzoConfigurado(jornada);
    const mensajePausa = mensajeDescanso(empleado.nombre, "pausa", minutosPausa);
    const mensajeAlmuerzo = mensajeDescanso(empleado.nombre, "almuerzo", minutosAlmuerzo);
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
        mensajePausa || `Salida a break exitosa, ${empleado.nombre}. Tu pausa queda registrada según el horario configurado.`,
        mensajePausa || `Salida a break exitosa, ${empleado.nombre}. Pausa registrada según el horario configurado.`
      ),
      pausaEntrada: () => ejecutar(
        { hora_ingreso_brake: tiempoHHMMSS() },
        VOZ.pausaEntrada(empleado.nombre),
        `Registro exitoso. Regreso de pausa registrado, ${empleado.nombre}.`
      ),
      almuerzoSalida: () => ejecutar(
        { hora_salida_almuerzo: tiempoHHMMSS() },
        mensajeAlmuerzo || VOZ.almuerzoSalida(empleado.nombre),
        mensajeAlmuerzo || `Buen provecho, ${empleado.nombre}. Salida a almuerzo registrada.`
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
    session,
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
