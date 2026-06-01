import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { workSessionService } from "../../../services/nominaService";
import { hablar } from "../../../helpers/voz";

const hhmm = (date) =>
  date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

function horaServidor(valor) {
  if (!valor) return null;
  const match = String(valor).match(/(?:T|\s)(\d{2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = match[2];
  const hour12 = hour % 12 || 12;
  const suffix = hour >= 12 ? "p. m." : "a. m.";
  return `${String(hour12).padStart(2, "0")}:${minute} ${suffix}`;
}

function mensajeErrorApi(error, fallback = "Error al registrar. Intenta de nuevo.") {
  return error?.response?.data?.message || error?.message || fallback;
}

const minsToHM = (mins) => {
  if (!mins) return "0 h 0 min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} h ${m} min`;
};

const tiempoHHMMSS = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
};

function parseTime(str) {
  if (!str) return null;
  const match = String(str).match(/(?:T|\s)(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    const d = new Date(str);
    return isNaN(d) ? null : d;
  }

  const d = new Date();
  d.setHours(Number(match[1]), Number(match[2]), Number(match[3] ?? 0), 0);
  return isNaN(d) ? null : d;
}

// Mensajes de voz por acción
const VOZ = {
  salida:         (nombre) => `Registro exitoso, ${nombre}. Salida laboral registrada. Hasta pronto.`,
  pausaSalida:    (nombre) => `Registro exitoso, ${nombre}. Salida a pausa registrada. Que tengas una buena pausa.`,
  pausaEntrada:   (nombre) => `Registro exitoso, ${nombre}. Regreso de pausa registrado. Bienvenido de vuelta.`,
  almuerzoSalida: (nombre) => `Buen provecho, ${nombre}. Salida a almuerzo registrada correctamente.`,
  almuerzoEntrada:(nombre) => `Registro exitoso, ${nombre}. Regreso de almuerzo registrado. Bienvenido de vuelta.`,
  almuerzoEntradaTarde: (nombre, minutos) => `Registro exitoso, ${nombre}. Regreso de almuerzo registrado con tardanza de ${minutos} minutos.`,
};

function obtenerJornada(session, jornadaActiva) {
  return jornadaActiva ?? session?.jornada_laboral ?? session?.jornadaLaboral ?? {};
}

function decir(jornada, texto) {
  if (jornada?.comando_voz_activo === false) return;
  hablar(texto);
}

function minutosDia(fecha = new Date()) {
  return fecha.getHours() * 60 + fecha.getMinutes();
}

function minutosHora(hora) {
  if (!hora) return null;
  const [hh = "0", mm = "0"] = String(hora).split(":");
  return Number(hh) * 60 + Number(mm);
}

function detectarAccion(session, jornada, ahora = new Date()) {
  const actual = minutosDia(ahora);
  const salida = minutosHora(jornada?.hora_salida);
  const salidaAlmuerzo = minutosHora(jornada?.hora_salida_almuerzo);
  const ingresoAlmuerzo = minutosHora(jornada?.hora_ingreso_almuerzo);
  const salidaPausa = minutosHora(jornada?.hora_salida_pausa);
  const ingresoPausa = minutosHora(jornada?.hora_ingreso_pausa);
  const pausaFin = salidaPausa !== null
    ? (ingresoPausa ?? salidaPausa + (jornada?.duracion_pausa_minutos ?? 15))
    : null;

  if (session?.hora_salida_brake && !session?.hora_ingreso_brake) return "pausaEntrada";
  if (session?.hora_salida_almuerzo && !session?.hora_ingreso_almuerzo) return "almuerzoEntrada";

  if (!session?.hora_salida && salida !== null && actual >= salida) return "salida";
  if (!session?.hora_salida_almuerzo && salidaAlmuerzo !== null && ingresoAlmuerzo !== null && actual >= salidaAlmuerzo && actual < ingresoAlmuerzo) {
    return "almuerzoSalida";
  }
  if (!session?.hora_salida_brake && salidaPausa !== null && pausaFin !== null && actual >= salidaPausa && actual < pausaFin) {
    return "pausaSalida";
  }

  return null;
}

function minutosTardeContraHora(horaProgramada, fecha = new Date()) {
  const limite = minutosHora(horaProgramada);
  if (limite === null) return 0;
  return Math.max(0, minutosDia(fecha) - limite);
}

function entradaTieneTardanza(session, jornada) {
  if ((session?.minutos_tardanza ?? 0) > 0) return true;
  const entrada = parseTime(session?.hora_entrada);
  const limite = jornada?.hora_entrada_limite ?? jornada?.hora_entrada;
  if (!entrada || !limite) return false;

  const [hh = "0", mm = "0"] = String(limite).split(":");
  const programada = new Date(entrada);
  programada.setHours(Number(hh), Number(mm), 0, 0);

  return entrada > programada;
}

function entradaOperativa(session, jornada) {
  const entrada = parseTime(session?.hora_entrada);
  if (!entrada || !jornada?.hora_entrada) return entrada;

  const [hh = "0", mm = "0"] = String(jornada.hora_entrada).split(":");
  const programada = new Date(entrada);
  programada.setHours(Number(hh), Number(mm), 0, 0);

  return entrada < programada ? programada : entrada;
}

export default function KioskoAcciones({ empleado, kioskoInfo, jornadaActiva, onRefrescarJornada, onDone, onCancelar }) {
  const { session } = empleado;
  const [guardando, setGuardando] = useState(false);
  const [exitoMsg, setExitoMsg]   = useState("");
  const [esperaMsg, setEsperaMsg] = useState("Detectando marcación según tu horario...");
  const [tipoMensaje, setTipoMensaje] = useState("info");
  const [jornadaSincronizada, setJornadaSincronizada] = useState(false);
  const [jornadaOperativa, setJornadaOperativa] = useState(null);
  const jornada = useMemo(() => obtenerJornada(session, jornadaOperativa ?? jornadaActiva), [session, jornadaActiva, jornadaOperativa]);
  const accionDetectada = useMemo(() => detectarAccion(session, jornada), [session, jornada]);

  const entrada       = entradaOperativa(session, jornada);
  const llegadaTarde  = entradaTieneTardanza(session, jornada);
  const enPausa       = !!session?.hora_salida_brake  && !session?.hora_ingreso_brake;
  const enAlmuerzo    = !!session?.hora_salida_almuerzo && !session?.hora_ingreso_almuerzo;

  useEffect(() => {
    let mounted = true;
    setJornadaSincronizada(false);
    setEsperaMsg("Actualizando horario operativo del día...");
    Promise.resolve(onRefrescarJornada?.())
      .then((jornadaActualizada) => {
        if (mounted && jornadaActualizada) {
          setJornadaOperativa(jornadaActualizada);
        }
      })
      .catch(() => {
        if (mounted) {
          setJornadaOperativa(jornadaActiva ?? null);
        }
      })
      .finally(() => {
        if (mounted) setJornadaSincronizada(true);
      });

    return () => {
      mounted = false;
    };
  }, [jornadaActiva, onRefrescarJornada]);

  const ejecutar = useCallback(async (payload, textoVoz, mensajePantalla) => {
    setGuardando(true);
    setTipoMensaje("info");
    setEsperaMsg("Registrando marcación...");
    try {
      await workSessionService.updateSession(session.uuid, payload);
      decir(jornada, textoVoz);
      setTipoMensaje("exito");
      setExitoMsg(mensajePantalla);
      setTimeout(() => onDone(empleado.nombre, hhmm(new Date())), 3000);
    } catch (error) {
      const mensaje = mensajeErrorApi(error);
      setTipoMensaje("error");
      setEsperaMsg(mensaje);
      decir(jornada, mensaje);
      setTimeout(onCancelar, 4000);
    } finally {
      setGuardando(false);
    }
  }, [empleado.nombre, jornada, onCancelar, onDone, session.uuid]);

  useEffect(() => {
    if (!jornadaSincronizada) return;
    if (guardando || exitoMsg) return;

    const acciones = {
      salida: () => ejecutar(
        { hora_salida: tiempoHHMMSS() },
        VOZ.salida(empleado.nombre),
        `Registro exitoso. Salida laboral registrada, ${empleado.nombre}.`
      ),
      pausaSalida: () => ejecutar(
        { hora_salida_brake: tiempoHHMMSS() },
        VOZ.pausaSalida(empleado.nombre),
        `Registro exitoso. Salida a pausa registrada, ${empleado.nombre}.`
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
        minutosTardeContraHora(jornada?.hora_ingreso_almuerzo) > 0
          ? VOZ.almuerzoEntradaTarde(empleado.nombre, minutosTardeContraHora(jornada?.hora_ingreso_almuerzo))
          : VOZ.almuerzoEntrada(empleado.nombre),
        minutosTardeContraHora(jornada?.hora_ingreso_almuerzo) > 0
          ? `Registro exitoso. Regreso de almuerzo con tardanza de ${minutosTardeContraHora(jornada?.hora_ingreso_almuerzo)} min, ${empleado.nombre}.`
          : `Registro exitoso. Regreso de almuerzo registrado, ${empleado.nombre}.`
      ),
    };

    if (accionDetectada && acciones[accionDetectada]) {
      acciones[accionDetectada]();
      return;
    }

    const salida = minutosHora(jornada?.hora_salida);
    if (!session?.hora_salida && salida !== null && minutosDia() < salida) {
      const minutosParaSalida = salida - minutosDia();
      if (minutosParaSalida <= 60) {
        setTipoMensaje("alerta");
        setEsperaMsg(llegadaTarde ? "Llegada tarde registrada. Aún no es hora de salida." : "Aún no es hora de salida.");
        decir(jornada, llegadaTarde
          ? `${empleado.nombre}, llegada tarde registrada. Aún no es hora de salida.`
          : `${empleado.nombre}, aún no es hora de salida.`
        );
      } else {
        setTipoMensaje(llegadaTarde ? "tarde" : "info");
        setEsperaMsg(llegadaTarde ? "Llegada tarde registrada." : "Marcación registrada. Jornada en curso.");
        if (llegadaTarde) {
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
    ejecutar,
    jornada,
    jornadaSincronizada,
    llegadaTarde,
    onCancelar,
    session?.hora_salida,
    session?.hora_salida_almuerzo,
    session?.hora_salida_brake,
  ]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-between py-8 px-4">

      {/* Header */}
      <div className="text-center">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">
          {kioskoInfo?.name ?? "Kiosko"}
        </p>
        <h1 className="text-white text-2xl font-bold">Tablet · Marcación automática</h1>
        <p className="text-gray-400 text-sm mt-1">
          {jornada?.instruccion_operativa_diaria ? "El sistema registra según la instrucción operativa del día" : "El sistema registra según el horario configurado"}
        </p>
      </div>

      {/* Empleado */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-lg">
          {empleado.photoUrl ? (
            <img src={empleado.photoUrl} alt={empleado.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-indigo-900/40 flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-300">
                {empleado.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg">{empleado.nombre}</p>
          <div className="mt-2 bg-indigo-900/30 border border-indigo-500/30 rounded-xl px-4 py-2">
            <p className="text-indigo-400 text-xs font-medium">Estado</p>
            <p className="text-indigo-200 text-sm font-bold mt-0.5">
              {enPausa    ? "En pausa"
               : enAlmuerzo ? "En almuerzo"
               : entrada  ? `En jornada desde ${horaServidor(session?.hora_entrada) ?? hhmm(entrada)}`
               : "Sesión activa"}
            </p>
            {llegadaTarde && (
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                Llegada tarde
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Registro automático o mensaje */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        {exitoMsg ? (
          <div className="bg-green-900/40 border border-green-500/30 rounded-xl px-5 py-5 text-center">
            <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Registro exitoso
            </p>
            <p className="text-green-200 text-sm font-medium">{exitoMsg}</p>
          </div>
        ) : (
          <div className={`${
            tipoMensaje === "error"
              ? "bg-red-900/30 border-red-500/30"
              : tipoMensaje === "alerta" || tipoMensaje === "tarde"
              ? "bg-amber-900/30 border-amber-500/30"
              : "bg-indigo-900/30 border-indigo-500/30"
          } border rounded-xl px-5 py-5 text-center`}>
            <p className={`${
              tipoMensaje === "error"
                ? "text-red-300"
                : tipoMensaje === "alerta" || tipoMensaje === "tarde"
                ? "text-amber-300"
                : "text-indigo-300"
            } text-xs font-semibold uppercase tracking-widest mb-1`}>
              {guardando
                ? "Registrando"
                : tipoMensaje === "error"
                ? "Marcación no permitida"
                : tipoMensaje === "alerta"
                ? "Salida no permitida"
                : llegadaTarde
                ? "Llegada tarde"
                : "Validando horario"}
            </p>
            <p className={`${
              tipoMensaje === "error"
                ? "text-red-100"
                : tipoMensaje === "alerta" || tipoMensaje === "tarde"
                ? "text-amber-100"
                : "text-indigo-100"
            } text-sm font-medium`}>{esperaMsg}</p>
          </div>
        )}
      </div>

      {/* Resumen del día */}
      <div className="w-full max-w-xs bg-gray-900/80 rounded-xl px-4 py-3 border border-gray-800">
        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Resumen del día</p>
        <p className="text-white text-sm font-bold">
          Trabajado: {minsToHM(session?.minutos_trabajados)}
        </p>
        {session?.minutos_pausa > 0 && (
          <p className="text-gray-400 text-xs mt-0.5">Pausa: {session.minutos_pausa} min</p>
        )}
      </div>
    </div>
  );
}

KioskoAcciones.propTypes = {
  empleado:   PropTypes.shape({
    userId:   PropTypes.number,
    nombre:   PropTypes.string,
    photoUrl: PropTypes.string,
    session:  PropTypes.object,
  }).isRequired,
  kioskoInfo: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }).isRequired,
  jornadaActiva: PropTypes.object,
  onRefrescarJornada: PropTypes.func,
  onDone:     PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
};
