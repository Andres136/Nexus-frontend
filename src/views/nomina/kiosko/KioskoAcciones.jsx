import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { workSessionService } from "../../../services/nominaService";
import { hablar } from "../../../helpers/voz";

const hhmm = (date) =>
  date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

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
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

function minutosDesde(fechaInicio, fechaFin = new Date()) {
  const inicio = parseTime(fechaInicio);
  if (!inicio) return 0;
  return Math.max(0, Math.round((fechaFin - inicio) / 60000));
}

// Mensajes de voz por acción
const VOZ = {
  salida:         (nombre) => `Registro exitoso. Hasta pronto, ${nombre}.`,
  pausaSalida:    (nombre) => `Registro exitoso. Inicio de pausa registrado. Descansa, ${nombre}.`,
  pausaEntrada:   (nombre) => `Registro exitoso. Fin de pausa. Bienvenido de vuelta, ${nombre}.`,
  pausaEntradaTarde: (nombre, minutos) => `Registro exitoso. ${nombre}, has ingresado tarde de la pausa. Tiempo excedido: ${minutos} minutos.`,
  almuerzoSalida: (nombre) => `Registro exitoso. Salida a almuerzo registrada. Buen provecho, ${nombre}.`,
  almuerzoEntrada:(nombre) => `Registro exitoso. Regreso de almuerzo registrado. Bienvenido, ${nombre}.`,
  almuerzoEntradaTarde: (nombre, minutos) => `Registro exitoso. ${nombre}, has ingresado tarde del almuerzo. Tiempo excedido: ${minutos} minutos.`,
};

function obtenerJornada(session, jornadaActiva) {
  return session?.jornada_laboral ?? session?.jornadaLaboral ?? jornadaActiva ?? {};
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

export default function KioskoAcciones({ empleado, kioskoInfo, jornadaActiva, onDone, onCancelar }) {
  const { session } = empleado;
  const [guardando, setGuardando] = useState(false);
  const [exitoMsg, setExitoMsg]   = useState("");
  const [esperaMsg, setEsperaMsg] = useState("Detectando marcación según tu horario...");
  const jornada = useMemo(() => obtenerJornada(session, jornadaActiva), [session, jornadaActiva]);
  const pausaPermitida = jornada?.duracion_pausa_minutos ?? 15;
  const almuerzoPermitido = jornada?.duracion_almuerzo_minutos ?? 60;
  const accionDetectada = useMemo(() => detectarAccion(session, jornada), [session, jornada]);

  const entrada       = parseTime(session?.hora_entrada);
  const enPausa       = !!session?.hora_salida_brake  && !session?.hora_ingreso_brake;
  const enAlmuerzo    = !!session?.hora_salida_almuerzo && !session?.hora_ingreso_almuerzo;

  const ejecutar = useCallback(async (payload, textoVoz, mensajePantalla) => {
    setGuardando(true);
    setEsperaMsg("Registrando marcación...");
    try {
      await workSessionService.updateSession(session.uuid, payload);
      decir(jornada, textoVoz);
      setExitoMsg(mensajePantalla);
      setTimeout(() => onDone(empleado.nombre, hhmm(new Date())), 3000);
    } catch {
      decir(jornada, "Error al registrar. Por favor intenta de nuevo.");
      setExitoMsg("Error al registrar. Intenta de nuevo.");
      setTimeout(onCancelar, 2500);
    } finally {
      setGuardando(false);
    }
  }, [empleado.nombre, jornada, onCancelar, onDone, session.uuid]);

  useEffect(() => {
    if (guardando || exitoMsg) return;

    const acciones = {
      salida: () => ejecutar(
        { hora_salida: tiempoHHMMSS() },
        VOZ.salida(empleado.nombre),
        `¡Hasta pronto, ${empleado.nombre}! Salida registrada.`
      ),
      pausaSalida: () => ejecutar(
        { hora_salida_brake: tiempoHHMMSS() },
        VOZ.pausaSalida(empleado.nombre),
        `Pausa iniciada. Descansa un momento, ${empleado.nombre}.`
      ),
      pausaEntrada: () => ejecutar(
        { hora_ingreso_brake: tiempoHHMMSS() },
        minutosDesde(session?.hora_salida_brake) > pausaPermitida
          ? VOZ.pausaEntradaTarde(empleado.nombre, minutosDesde(session?.hora_salida_brake) - pausaPermitida)
          : VOZ.pausaEntrada(empleado.nombre),
        minutosDesde(session?.hora_salida_brake) > pausaPermitida
          ? `Ingreso tardío de pausa. Exceso: ${minutosDesde(session?.hora_salida_brake) - pausaPermitida} min.`
          : `¡Bienvenido de vuelta, ${empleado.nombre}!`
      ),
      almuerzoSalida: () => ejecutar(
        { hora_salida_almuerzo: tiempoHHMMSS() },
        VOZ.almuerzoSalida(empleado.nombre),
        `Salida a almuerzo registrada. ¡Buen provecho, ${empleado.nombre}!`
      ),
      almuerzoEntrada: () => ejecutar(
        { hora_ingreso_almuerzo: tiempoHHMMSS() },
        minutosDesde(session?.hora_salida_almuerzo) > almuerzoPermitido
          ? VOZ.almuerzoEntradaTarde(empleado.nombre, minutosDesde(session?.hora_salida_almuerzo) - almuerzoPermitido)
          : VOZ.almuerzoEntrada(empleado.nombre),
        minutosDesde(session?.hora_salida_almuerzo) > almuerzoPermitido
          ? `Ingreso tardío de almuerzo. Exceso: ${minutosDesde(session?.hora_salida_almuerzo) - almuerzoPermitido} min.`
          : `¡Bienvenido, ${empleado.nombre}! Regreso de almuerzo registrado.`
      ),
    };

    if (accionDetectada && acciones[accionDetectada]) {
      acciones[accionDetectada]();
      return;
    }

    setEsperaMsg("No hay una marcación programada para este momento.");
    decir(jornada, `${empleado.nombre}, no hay una marcación programada para este momento.`);
    const timer = setTimeout(onCancelar, 3000);
    return () => clearTimeout(timer);
  }, [
    accionDetectada,
    almuerzoPermitido,
    empleado.nombre,
    exitoMsg,
    guardando,
    ejecutar,
    jornada,
    onCancelar,
    pausaPermitida,
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
        <p className="text-gray-400 text-sm mt-1">El sistema registra según el horario configurado</p>
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
               : entrada  ? `En jornada desde ${hhmm(entrada)}`
               : "Sesión activa"}
            </p>
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
          <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl px-5 py-5 text-center">
            <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
              {guardando ? "Registrando" : "Validando horario"}
            </p>
            <p className="text-indigo-100 text-sm font-medium">{esperaMsg}</p>
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
  onDone:     PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
};
