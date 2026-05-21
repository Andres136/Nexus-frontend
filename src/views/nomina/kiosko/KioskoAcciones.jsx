import { useState } from "react";
import PropTypes from "prop-types";
import { workSessionService } from "../../../services/nominaService";

const hhmm = (date) =>
  date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

const minsToHM = (mins) => {
  if (!mins) return "0 h 0 min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} h ${m} min`;
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

export default function KioskoAcciones({ empleado, kioskoInfo, jornadaId, onDone, onCancelar }) {
  const { session } = empleado;
  const [guardando, setGuardando] = useState(false);
  const [exitoMsg, setExitoMsg]   = useState("");

  const entrada  = parseTime(session?.hora_entrada);
  const enPausa  = !!session?.hora_salida_brake && !session?.hora_ingreso_brake;

  const ahora = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
  };

  const ejecutar = async (payload, mensaje) => {
    setGuardando(true);
    try {
      await workSessionService.updateSession(session.uuid, payload);
      const hora = hhmm(new Date());
      setExitoMsg(mensaje);
      setTimeout(() => onDone(empleado.nombre, hora), 2500);
    } catch {
      setExitoMsg("Error al registrar. Intenta de nuevo.");
      setTimeout(onCancelar, 2500);
    } finally {
      setGuardando(false);
    }
  };

  const marcarSalida  = () => ejecutar({ hora_salida: ahora() },                  `Salida registrada. ¡Hasta pronto, ${empleado.nombre}!`);
  const iniciarPausa  = () => ejecutar({ hora_salida_brake: ahora() },            `Pausa iniciada. Descansa, ${empleado.nombre}.`);
  const terminarPausa = () => ejecutar({ hora_ingreso_brake: ahora() },         `Pausa terminada. Bienvenido de vuelta, ${empleado.nombre}.`);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-between py-8 px-4">

      {/* Header */}
      <div className="text-center">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">
          {kioskoInfo?.name ?? "Kiosko"}
        </p>
        <h1 className="text-white text-2xl font-bold">Tablet · Salida y Pausas</h1>
        <p className="text-gray-400 text-sm mt-1">Una sola interfaz para retiro o descanso</p>
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
          {/* Estado actual */}
          <div className="mt-2 bg-amber-900/30 border border-amber-500/30 rounded-xl px-4 py-2">
            <p className="text-amber-400 text-xs font-medium">Estado actual</p>
            <p className="text-amber-200 text-sm font-bold mt-0.5">
              {enPausa
                ? "En pausa"
                : entrada
                ? `En jornada desde ${hhmm(entrada)}`
                : "Sesión activa"}
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito o botones */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        {exitoMsg ? (
          <div className="bg-green-900/40 border border-green-500/30 rounded-xl px-5 py-4 text-center">
            <p className="text-green-300 text-sm font-medium">{exitoMsg}</p>
          </div>
        ) : (
          <>
            <Boton onClick={marcarSalida} disabled={guardando} color="rojo">
              {guardando ? "Registrando..." : "Marcar salida"}
            </Boton>

            {!enPausa && (
              <Boton onClick={iniciarPausa} disabled={guardando} color="naranja">
                Iniciar pausa
              </Boton>
            )}

            {enPausa && (
              <Boton onClick={terminarPausa} disabled={guardando} color="verde">
                Terminar pausa
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
          <p className="text-gray-400 text-xs mt-0.5">
            Pausa acumulada: {session.minutos_pausa} min
          </p>
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
  jornadaId:  PropTypes.number.isRequired,
  onDone:     PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
};
