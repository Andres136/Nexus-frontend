import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import * as faceapi from "face-api.js";
import { KeyRound, MessageCircle } from "lucide-react";
import { workSessionService } from "../../../services/nominaService";
import { hablar } from "../../../helpers/voz";

const hhmm = (date) =>
  date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

// ── Teclado PIN ───────────────────────────────────────────────────────────────
function PinModal({ cedulaMap, empleadosMap, jornadaId, jornadaActiva, kioskoInfo, onReconocido, onEntradaCompleta, onClose }) {
  const [pin, setPin]       = useState("");
  const [estado, setEstado] = useState("idle"); // idle | buscando | error | exito
  const [msg, setMsg]       = useState("");

  const TECLAS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  const presionar = (t) => {
    if (estado !== "idle") return;
    if (t === "⌫") { setPin((p) => p.slice(0, -1)); return; }
    if (t === "") return;
    setPin((p) => (p.length < 12 ? p + t : p));
  };

  const buscar = async () => {
    if (!pin.trim()) return;
    const userId = cedulaMap.get(pin.trim());
    if (!userId) {
      setEstado("error");
      setMsg("Cédula no encontrada. Verifica el número.");
      decir(jornadaActiva, "Cédula no encontrada. Por favor intenta de nuevo.");
      setTimeout(() => { setEstado("idle"); setMsg(""); setPin(""); }, 2500);
      return;
    }

    setEstado("buscando");
    try {
      const res      = await workSessionService.getSessionHoy(userId);
      const sessions = res.data?.data?.data ?? res.data?.data ?? [];
      const session  = sessions[0] ?? null;

      if (session && !session.hora_salida) {
        onReconocido(userId, session);
        return;
      }

      if (session && session.hora_salida) {
        const info = empleadosMap.get(userId) ?? { nombre: "Empleado" };
        setEstado("error");
        setMsg(`${info.nombre}, tu jornada de hoy ya finalizó.`);
        decir(jornadaActiva, `${info.nombre}, tu jornada de hoy ya fue completada. Hasta mañana.`);
        setTimeout(onClose, 3500);
        return;
      }

      const info  = empleadosMap.get(userId) ?? { nombre: "Empleado", photoUrl: null };
      const ahora = new Date();
      const yy    = ahora.getFullYear();
      const mm    = String(ahora.getMonth() + 1).padStart(2, "0");
      const dd    = String(ahora.getDate()).padStart(2, "0");

      await workSessionService.createSession({
        user_id:            userId,
        kiosko_id:          kioskoInfo.id,
        registro_diario:    `${yy}-${mm}-${dd}`,
        hora_entrada:       tiempoHHMMSS(ahora),
        horario_laboral_id: jornadaId,
      });

      const hora = hhmm(ahora);
      const tarde = minutosTardeEntrada(ahora, jornadaActiva?.hora_entrada) > 0;
      decir(jornadaActiva, tarde
        ? `Registro exitoso. ${info.nombre}, has ingresado tarde.`
        : `Bienvenido, ${info.nombre}. Registro exitoso.`
      );
      setEstado("exito");
      setMsg(tarde
        ? `${info.nombre}, entrada registrada a las ${hora}. Ingreso tardío.`
        : `¡Bienvenido, ${info.nombre}! Entrada registrada a las ${hora}.`
      );
      onEntradaCompleta(info.nombre, hora);
      setTimeout(onClose, 3000);
    } catch {
      setEstado("error");
      setMsg("Error al registrar. Intenta de nuevo.");
      decir(jornadaActiva, "Error al registrar. Por favor intenta de nuevo.");
      setTimeout(() => { setEstado("idle"); setMsg(""); setPin(""); }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-xs p-6 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">PIN Alterno</p>
          <p className="text-white text-lg font-bold">Ingresa tu cédula</p>
        </div>

        <div className={`rounded-2xl px-4 py-3 text-center border ${
          estado === "error" ? "bg-red-900/40 border-red-500/40"    :
          estado === "exito" ? "bg-green-900/40 border-green-500/40" :
          "bg-gray-800 border-gray-700"
        }`}>
          {msg ? (
            <p className={`text-sm font-medium ${estado === "error" ? "text-red-300" : "text-green-300"}`}>{msg}</p>
          ) : (
            <p className="text-white text-2xl font-mono tracking-widest min-h-[2rem]">
              {pin || <span className="text-gray-600">_ _ _ _ _ _</span>}
            </p>
          )}
        </div>

        {estado === "idle" && (
          <div className="grid grid-cols-3 gap-2.5">
            {TECLAS.map((t, i) => (
              <button key={i} onClick={() => presionar(t)}
                className={`h-14 rounded-2xl text-lg font-bold transition-all ${
                  t === "⌫" ? "bg-gray-700 text-red-400 hover:bg-gray-600" :
                  t === ""  ? "invisible" :
                  "bg-gray-800 text-white hover:bg-indigo-600 active:scale-95"
                }`}>
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-gray-800 text-gray-400 text-sm font-medium hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          {estado === "idle" && (
            <button onClick={buscar} disabled={!pin.trim()}
              className="flex-1 py-3 rounded-2xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40 transition-colors">
              Confirmar
            </button>
          )}
          {estado === "buscando" && (
            <div className="flex-1 py-3 rounded-2xl bg-indigo-700/40 text-indigo-300 text-sm text-center animate-pulse">
              Verificando...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

PinModal.propTypes = {
  cedulaMap:         PropTypes.instanceOf(Map).isRequired,
  empleadosMap:      PropTypes.instanceOf(Map).isRequired,
  jornadaId:         PropTypes.number.isRequired,
  jornadaActiva:     PropTypes.object,
  kioskoInfo:        PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }).isRequired,
  onReconocido:      PropTypes.func.isRequired,
  onEntradaCompleta: PropTypes.func.isRequired,
  onClose:           PropTypes.func.isRequired,
};

const tiempoHHMMSS = (date) => {
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mi}:${ss}`;
};

function minutosTardeEntrada(fecha, horaEntrada = "07:00") {
  const [hh = "7", mm = "0"] = String(horaEntrada || "07:00").split(":");
  const limite = new Date(fecha);
  limite.setHours(Number(hh), Number(mm), 0, 0);
  return Math.max(0, Math.round((fecha - limite) / 60000));
}

function decir(jornada, texto) {
  if (jornada?.comando_voz_activo === false) return;
  hablar(texto);
}

export default function KioskoScanner({
  faceMatcher,
  empleadosMap,
  cedulaMap,
  kioskoInfo,
  jornadaId,
  jornadaActiva,
  ultimaMarca,
  onReconocido,
  onEntradaCompleta,
}) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const loopRef    = useRef(null);
  const autoPinRef = useRef(null);
  const cooldown   = useRef(false);
  const detecting  = useRef(false);
  const detOptions = useRef(new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }));

  const [camError, setCamError]         = useState("");
  const [candidato, setCandidato]       = useState(null);
  const [checkingSession, setChecking]  = useState(false);
  const [guardando, setGuardando]       = useState(false);
  const [exitoMsg, setExitoMsg]         = useState("");
  const [jornadaCerrada, setJornadaCerrada] = useState(false);
  const [showPin, setShowPin]           = useState(false);
  const [reconocimientoFallido, setReconocimientoFallido] = useState(false);

  const resetear = useCallback(() => {
    setCandidato(null);
    setChecking(false);
    setGuardando(false);
    setExitoMsg("");
    setJornadaCerrada(false);
    setReconocimientoFallido(false);
    setTimeout(() => { cooldown.current = false; }, 2000);
  }, []);

  // ── Cámara ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => setCamError(err.name + ": " + err.message));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(loopRef.current);
    };
  }, []);

  // ── Detección ───────────────────────────────────────────────────────────────
  const detectar = useCallback(async () => {
    if (!videoRef.current || !faceMatcher || cooldown.current || candidato || detecting.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    detecting.current = true;
    try {
      const det = await faceapi
        .detectSingleFace(video, detOptions.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!det) return;

      const match = faceMatcher.findBestMatch(det.descriptor);
      if (match.label === "unknown") return;

      cooldown.current = true;
      setReconocimientoFallido(false);
      const userId = Number(match.label);
      const info   = empleadosMap.get(userId) ?? { nombre: "Empleado", photoUrl: null };
      setCandidato({ userId, nombre: info.nombre, photoUrl: info.photoUrl });

      setChecking(true);
      try {
        const res      = await workSessionService.getSessionHoy(userId);
        const sessions = res.data?.data?.data ?? res.data?.data ?? [];
        const session  = sessions[0] ?? null;

        // Sesión abierta → pantalla de acciones (salida / pausa / almuerzo)
        if (session && !session.hora_salida) {
          onReconocido(userId, session);
          return;
        }

        // Jornada ya cerrada → una sola entrada/salida por día
        if (session && session.hora_salida) {
          setJornadaCerrada(true);
          decir(jornadaActiva, `${info.nombre}, tu jornada de hoy ya fue completada. Hasta mañana.`);
          setExitoMsg(`Tu jornada de hoy ya finalizó, ${info.nombre}.`);
          setTimeout(resetear, 4000);
          return;
        }

        // Sin sesión → registrar entrada
        setChecking(false);
        setGuardando(true);
        const ahora = new Date();
        const yy = ahora.getFullYear();
        const mm = String(ahora.getMonth() + 1).padStart(2, "0");
        const dd = String(ahora.getDate()).padStart(2, "0");

        await workSessionService.createSession({
          user_id:            userId,
          kiosko_id:          kioskoInfo.id,
          registro_diario:    `${yy}-${mm}-${dd}`,
          hora_entrada:       tiempoHHMMSS(ahora),
          horario_laboral_id: jornadaId,
        });

        const hora = hhmm(ahora);
        const tarde = minutosTardeEntrada(ahora, jornadaActiva?.hora_entrada) > 0;
        decir(jornadaActiva, tarde
          ? `Registro exitoso. ${info.nombre}, has ingresado tarde.`
          : `Bienvenido, ${info.nombre}. Registro exitoso.`
        );
        setExitoMsg(tarde
          ? `${info.nombre}, entrada marcada a las ${hora}. Ingreso tardío.`
          : `¡Bienvenido, ${info.nombre}! Entrada marcada a las ${hora}.`
        );
        onEntradaCompleta(info.nombre, hora);
        setTimeout(resetear, 3500);

      } catch {
        decir(jornadaActiva, "Error al registrar. Por favor intenta de nuevo.");
        setExitoMsg("Error al registrar la entrada. Intenta de nuevo.");
        setTimeout(resetear, 3000);
      } finally {
        setChecking(false);
        setGuardando(false);
      }
    } catch {
      // silencioso
    } finally {
      detecting.current = false;
    }
  }, [faceMatcher, empleadosMap, candidato, onReconocido, kioskoInfo, jornadaId, jornadaActiva, onEntradaCompleta, resetear]);

  useEffect(() => {
    loopRef.current = setInterval(detectar, 300);
    return () => clearInterval(loopRef.current);
  }, [detectar]);

  useEffect(() => {
    clearTimeout(autoPinRef.current);

    if (candidato || exitoMsg || showPin || reconocimientoFallido) return;

    autoPinRef.current = setTimeout(() => {
      decir(jornadaActiva, "No fue posible validar el reconocimiento facial. Puedes usar el PIN alterno con tu número de cédula.");
      setReconocimientoFallido(true);
    }, 8000);

    return () => clearTimeout(autoPinRef.current);
  }, [candidato, exitoMsg, showPin, reconocimientoFallido, jornadaActiva]);

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-between py-8 px-4">

      {showPin && (
        <PinModal
          cedulaMap={cedulaMap}
          empleadosMap={empleadosMap}
          jornadaId={jornadaId}
          jornadaActiva={jornadaActiva}
          kioskoInfo={kioskoInfo}
          onReconocido={(userId, session) => { setShowPin(false); onReconocido(userId, session); }}
          onEntradaCompleta={(nombre, hora) => { setShowPin(false); setReconocimientoFallido(false); onEntradaCompleta(nombre, hora); }}
          onClose={() => setShowPin(false)}
        />
      )}

      {/* Header */}
      <div className="text-center">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">
          {kioskoInfo?.name ?? "Kiosko"}
        </p>
        <h1 className="text-white text-2xl font-bold">
          {candidato ? candidato.nombre : "Tablet · Entrada"}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {candidato
            ? checkingSession ? "Verificando sesión..." : "Reconocimiento completado"
            : reconocimientoFallido || camError ? "Reconocimiento no validado · Usa PIN alterno"
            : "Reconocimiento facial · Acércate a la cámara"}
        </p>
      </div>

      {/* Cámara */}
      <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-2 border-indigo-600/40 shadow-2xl shadow-indigo-900/30 my-4">
        {camError ? (
          <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-2 px-3">
            <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.07A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <p className="text-red-400 text-xs text-center">{camError}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

            {candidato?.photoUrl && !exitoMsg && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <img src={candidato.photoUrl} alt={candidato.nombre}
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400 shadow-lg" />
              </div>
            )}

            {!candidato && !exitoMsg && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-36 h-36 rounded-full border-2 border-indigo-400/50 animate-pulse" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Mensaje */}
      {exitoMsg && (
        <div className={`rounded-xl px-5 py-4 text-center max-w-xs w-full border ${
          jornadaCerrada
            ? "bg-amber-900/40 border-amber-500/30"
            : "bg-green-900/40 border-green-500/30"
        }`}>
          {!jornadaCerrada && (
            <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Registro exitoso
            </p>
          )}
          <p className={`text-sm font-medium ${jornadaCerrada ? "text-amber-300" : "text-green-200"}`}>
            {exitoMsg}
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        {candidato && guardando && !exitoMsg && (
          <div className="w-full py-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-center text-sm font-medium animate-pulse">
            Registrando entrada...
          </div>
        )}

        {!candidato && !exitoMsg && (
          <>
            {!reconocimientoFallido && !camError ? (
              <div className="w-full py-4 rounded-2xl bg-green-600/90 border border-green-500/60 text-white text-center text-sm font-bold select-none shadow-lg shadow-green-900/40">
                Acércate a la cámara
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPin(true)}
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-indigo-700/70 border border-indigo-500/40 text-indigo-200 text-sm font-medium hover:bg-indigo-600/80 transition-colors">
                  <KeyRound className="h-4 w-4" strokeWidth={2} />
                  PIN alterno
                </button>
                <a
                  href="https://wa.me/573108157335"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium hover:bg-green-900/50 hover:text-green-300 hover:border-green-700/50 transition-colors">
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  Ayuda
                </a>
              </div>
            )}
          </>
        )}

        {candidato && (
          <button onClick={resetear}
            className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
        )}
      </div>

      {/* Última marca */}
      {ultimaMarca && (
        <div className="w-full max-w-xs bg-gray-900/80 rounded-xl px-4 py-2.5 text-center border border-gray-800">
          <p className="text-gray-500 text-[10px] uppercase tracking-wider">Última marca</p>
          <p className="text-gray-300 text-xs mt-0.5 font-medium">
            {ultimaMarca.hora} · {ultimaMarca.nombre}
          </p>
        </div>
      )}
    </div>
  );
}

KioskoScanner.propTypes = {
  faceMatcher:       PropTypes.object,
  empleadosMap:      PropTypes.instanceOf(Map).isRequired,
  cedulaMap:         PropTypes.instanceOf(Map).isRequired,
  kioskoInfo:        PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }).isRequired,
  jornadaId:         PropTypes.number.isRequired,
  jornadaActiva:     PropTypes.object,
  ultimaMarca:       PropTypes.shape({ nombre: PropTypes.string, hora: PropTypes.string }),
  onReconocido:      PropTypes.func.isRequired,
  onEntradaCompleta: PropTypes.func.isRequired,
};
