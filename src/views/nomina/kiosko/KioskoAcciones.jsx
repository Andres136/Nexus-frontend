import { useState } from "react";
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

function Boton({ onClick, disabled, color, children }) {
  const colors = {
    rojo:    "bg-red-600 hover:bg-red-700 shadow-red-900/40",
    naranja: "bg-amber-500 hover:bg-amber-600 shadow-amber-900/40",
    verde:   "bg-green-600 hover:bg-green-700 shadow-green-900/40",
    azul:    "bg-blue-600 hover:bg-blue-700 shadow-blue-900/40",
    gris:    "bg-gray-700 hover:bg-gray-600 text-gray-300",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl text-white text-base font-bold disabled:opacity-50 transition-colors shadow-lg ${colors[color] ?? colors.gris}`}
    >
      {children}
    </button>
  );
}

Boton.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  color: PropTypes.string,
  children: PropTypes.node,
};

// Mensajes de voz por acción
const VOZ = {
  salida:         (nombre) => `Registro exitoso. Hasta pronto, ${nombre}.`,
  pausaSalida:    (nombre) => `Registro exitoso. Inicio de pausa registrado. Descansa, ${nombre}.`,
  pausaEntrada:   (nombre) => `Registro exitoso. Fin de pausa. Bienvenido de vuelta, ${nombre}.`,
  almuerzoSalida: (nombre) => `Registro exitoso. Salida a almuerzo registrada. Buen provecho, ${nombre}.`,
  almuerzoEntrada:(nombre) => `Registro exitoso. Regreso de almuerzo registrado. Bienvenido, ${nombre}.`,
};

export default function KioskoAcciones({ empleado, kioskoInfo, onDone, onCancelar }) {
  const { session } = empleado;
  const [guardando, setGuardando] = useState(false);
  const [exitoMsg, setExitoMsg]   = useState("");

  const entrada       = parseTime(session?.hora_entrada);
  const enPausa       = !!session?.hora_salida_brake  && !session?.hora_ingreso_brake;
  const enAlmuerzo    = !!session?.hora_salida_almuerzo && !session?.hora_ingreso_almuerzo;

  const ejecutar = async (payload, textoVoz, mensajePantalla) => {
    setGuardando(true);
    try {
      await workSessionService.updateSession(session.uuid, payload);
      hablar(textoVoz);
      setExitoMsg(mensajePantalla);
      setTimeout(() => onDone(empleado.nombre, hhmm(new Date())), 3000);
    } catch {
      hablar("Error al registrar. Por favor intenta de nuevo.");
      setExitoMsg("Error al registrar. Intenta de nuevo.");
      setTimeout(onCancelar, 2500);
    } finally {
      setGuardando(false);
    }
  };

  const marcarSalida      = () => ejecutar(
    { hora_salida: tiempoHHMMSS() },
    VOZ.salida(empleado.nombre),
    `¡Hasta pronto, ${empleado.nombre}! Salida registrada.`
  );
  const iniciarPausa      = () => ejecutar(
    { hora_salida_brake: tiempoHHMMSS() },
    VOZ.pausaSalida(empleado.nombre),
    `Pausa iniciada. Descansa un momento, ${empleado.nombre}.`
  );
  const terminarPausa     = () => ejecutar(
    { hora_ingreso_brake: tiempoHHMMSS() },
    VOZ.pausaEntrada(empleado.nombre),
    `¡Bienvenido de vuelta, ${empleado.nombre}!`
  );
  const iniciarAlmuerzo   = () => ejecutar(
    { hora_salida_almuerzo: tiempoHHMMSS() },
    VOZ.almuerzoSalida(empleado.nombre),
    `Salida a almuerzo registrada. ¡Buen provecho, ${empleado.nombre}!`
  );
  const terminarAlmuerzo  = () => ejecutar(
    { hora_ingreso_almuerzo: tiempoHHMMSS() },
    VOZ.almuerzoEntrada(empleado.nombre),
    `¡Bienvenido, ${empleado.nombre}! Regreso de almuerzo registrado.`
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-between py-8 px-4">

      {/* Header */}
      <div className="text-center">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">
          {kioskoInfo?.name ?? "Kiosko"}
        </p>
        <h1 className="text-white text-2xl font-bold">Tablet · Acciones</h1>
        <p className="text-gray-400 text-sm mt-1">Selecciona tu marcación</p>
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

      {/* Acciones o mensaje */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        {exitoMsg ? (
          <div className="bg-green-900/40 border border-green-500/30 rounded-xl px-5 py-5 text-center">
            <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Registro exitoso
            </p>
            <p className="text-green-200 text-sm font-medium">{exitoMsg}</p>
          </div>
        ) : (
          <>
            {/* Salida principal */}
            {!enPausa && !enAlmuerzo && (
              <Boton onClick={marcarSalida} disabled={guardando} color="rojo">
                {guardando ? "Registrando..." : "Marcar salida"}
              </Boton>
            )}

            {/* Pausa */}
            {!enPausa && !enAlmuerzo && (
              <Boton onClick={iniciarPausa} disabled={guardando} color="naranja">
                Salida a pausa
              </Boton>
            )}
            {enPausa && (
              <Boton onClick={terminarPausa} disabled={guardando} color="verde">
                Regreso de pausa
              </Boton>
            )}

            {/* Almuerzo */}
            {!enPausa && !enAlmuerzo && (
              <Boton onClick={iniciarAlmuerzo} disabled={guardando} color="azul">
                Salida a almuerzo
              </Boton>
            )}
            {enAlmuerzo && (
              <Boton onClick={terminarAlmuerzo} disabled={guardando} color="verde">
                Regreso de almuerzo
              </Boton>
            )}

            <Boton onClick={onCancelar} disabled={guardando} color="gris">
              Cancelar
            </Boton>
          </>
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
  onDone:     PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
};
