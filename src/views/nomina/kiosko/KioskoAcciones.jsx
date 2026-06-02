import PropTypes from "prop-types";
import { useKioskoAcciones, hhmm, horaServidor, minsToHM } from "../../../hooks/nomina/useKioskoAcciones";

export default function KioskoAcciones({ empleado, kioskoInfo, jornadaActiva, onRefrescarJornada, onDone, onCancelar }) {
  const { session } = empleado;
  const {
    guardando,
    exitoMsg,
    esperaMsg,
    tipoMensaje,
    jornada,
    entrada,
    llegadaTarde,
    enPausa,
    enAlmuerzo,
  } = useKioskoAcciones({ empleado, jornadaActiva, onRefrescarJornada, onDone, onCancelar });

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-between py-8 px-4">

      {/* Header */}
      <div className="text-center">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">
          {kioskoInfo?.name ?? "Kiosko"}
        </p>
        <h1 className="text-white text-2xl font-bold">Tablet · Marcación automática</h1>
        <p className="text-gray-400 text-sm mt-1">
          {jornada?.instruccion_operativa_diaria
            ? "El sistema registra según la instrucción operativa del día"
            : "El sistema registra según el horario configurado"}
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
  empleado: PropTypes.shape({
    userId:   PropTypes.number,
    nombre:   PropTypes.string,
    photoUrl: PropTypes.string,
    session:  PropTypes.object,
  }).isRequired,
  kioskoInfo:         PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }).isRequired,
  jornadaActiva:      PropTypes.object,
  onRefrescarJornada: PropTypes.func,
  onDone:             PropTypes.func.isRequired,
  onCancelar:         PropTypes.func.isRequired,
};
