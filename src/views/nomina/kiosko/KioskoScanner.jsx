import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import * as faceapi from "face-api.js";
import { workSessionService } from "../../../services/nominaService";

const hhmm = (date) =>
  date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

// ─── Estados internos del scanner ─────────────────────────────────────────────
// idle → detectando → reconocido → (entrada confirmada | redirige a acciones)

export default function KioskoScanner({
  faceMatcher,
  empleadosMap,
  kioskoInfo,
  jornadaId,
  ultimaMarca,
  onReconocido,
  onEntradaCompleta,
}) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const loopRef   = useRef(null);
  const cooldown  = useRef(false);

  const [camError, setCamError]       = useState("");
  const [candidato, setCandidato]     = useState(null); // { userId, nombre, photoUrl }
  const [checkingSession, setChecking] = useState(false);
  const [sessionHoy, setSessionHoy]   = useState(null);
  const [guardando, setGuardando]     = useState(false);
  const [exitoMsg, setExitoMsg]       = useState("");

  // ── Cámara ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => setCamError(err.name + ": " + err.message));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(loopRef.current);
    };
  }, []);

  // ── Detección de rostros ────────────────────────────────────────────────────
  const detectar = useCallback(async () => {
    if (!videoRef.current || !faceMatcher || cooldown.current || candidato) {
      if (!faceMatcher) console.warn("[Kiosko] faceMatcher es null — no hay fotos faciales cargadas");
      return;
    }
    const video = videoRef.current;
    if (video.readyState < 2) return;

    try {
      const det = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!det) { console.log("[Kiosko] No se detectó rostro"); return; }

      const match = faceMatcher.findBestMatch(det.descriptor);
      console.log("[Kiosko] Match:", match.label, "distancia:", match.distance.toFixed(3));
      if (match.label === "unknown") return;

      cooldown.current = true;
      const userId = Number(match.label);
      const info   = empleadosMap.get(userId) ?? { nombre: "Empleado", photoUrl: null };
      setCandidato({ userId, nombre: info.nombre, photoUrl: info.photoUrl });

      // Consultar sesión de hoy
      setChecking(true);
      try {
        const res = await workSessionService.getSessionHoy(userId);
        const sessions = res.data?.data?.data ?? res.data?.data ?? [];
        const session  = sessions[0] ?? null;
        setSessionHoy(session);

        // Si ya tiene sesión abierta → ir a pantalla de acciones
        if (session && !session.hola_salida) {
          onReconocido(userId, session);
          return;
        }
        // Si ya cerró sesión hoy → mostrar mensaje
        if (session && session.hola_salida) {
          setExitoMsg(`${info.nombre}, tu jornada ya fue cerrada hoy.`);
          setTimeout(resetear, 4000);
        }
      } finally {
        setChecking(false);
      }
    } catch {
      // silencioso
    }
  }, [faceMatcher, empleadosMap, candidato, onReconocido]);

  useEffect(() => {
    loopRef.current = setInterval(detectar, 600);
    return () => clearInterval(loopRef.current);
  }, [detectar]);

  // ── Marcar entrada ──────────────────────────────────────────────────────────
  const marcarEntrada = async () => {
    if (!candidato) return;
    setGuardando(true);
    try {
      const ahora = new Date();
      await workSessionService.createSession({
        user_id:           candidato.userId,
        kiosko_id:         kioskoInfo.id,
        registro_diario:   ahora.toISOString().split("T")[0],
        hora_entrada:      ahora.toTimeString().slice(0, 8),
        horario_laboral_id: jornadaId,
      });
      const hora = hhmm(ahora);
      setExitoMsg(`¡Bienvenido, ${candidato.nombre}! Entrada marcada a las ${hora}.`);
      onEntradaCompleta(candidato.nombre, hora);
      setTimeout(resetear, 3000);
    } catch {
      setExitoMsg("Error al registrar la entrada. Intenta de nuevo.");
      setTimeout(resetear, 3000);
    } finally {
      setGuardando(false);
    }
  };

  const resetear = () => {
    setCandidato(null);
    setSessionHoy(null);
    setExitoMsg("");
    setTimeout(() => { cooldown.current = false; }, 2000);
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-between py-8 px-4">

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
            ? checkingSession
              ? "Verificando sesión..."
              : "Reconocimiento completado"
            : "Reconocimiento facial · Acércate a la cámara"}
        </p>
      </div>

      {/* Área de cámara */}
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
            <video
              ref={videoRef}
              autoPlay muted playsInline
              className="w-full h-full object-cover"
            />
            {/* Overlay cuando se reconoce */}
            {candidato?.photoUrl && !exitoMsg && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <img
                  src={candidato.photoUrl}
                  alt={candidato.nombre}
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400 shadow-lg"
                />
              </div>
            )}
            {/* Marco de escaneo */}
            {!candidato && !exitoMsg && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-36 h-36 rounded-full border-2 border-indigo-400/50 animate-pulse" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Mensaje de éxito */}
      {exitoMsg && (
        <div className="bg-green-900/40 border border-green-500/30 rounded-xl px-5 py-3 text-center max-w-xs">
          <p className="text-green-300 text-sm font-medium">{exitoMsg}</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        {candidato && !sessionHoy && !checkingSession && !exitoMsg && (
          <button
            onClick={marcarEntrada}
            disabled={guardando}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold disabled:opacity-60 transition-colors shadow-lg shadow-blue-900/40"
          >
            {guardando ? "Registrando..." : "Marcar entrada"}
          </button>
        )}

        {!candidato && !exitoMsg && (
          <>
            <div className="w-full py-4 rounded-2xl bg-blue-600/20 border border-blue-500/20 text-blue-300 text-center text-sm font-medium select-none">
              Acércate a la cámara
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-400 text-sm font-medium hover:bg-gray-700 transition-colors">
                PIN alterno
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-400 text-sm font-medium hover:bg-gray-700 transition-colors">
                Ayuda
              </button>
            </div>
          </>
        )}

        {candidato && (
          <button
            onClick={resetear}
            className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 transition-colors"
          >
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
  faceMatcher:      PropTypes.object,
  empleadosMap:     PropTypes.instanceOf(Map).isRequired,
  kioskoInfo:       PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }).isRequired,
  jornadaId:        PropTypes.number.isRequired,
  ultimaMarca:      PropTypes.shape({ nombre: PropTypes.string, hora: PropTypes.string }),
  onReconocido:     PropTypes.func.isRequired,
  onEntradaCompleta: PropTypes.func.isRequired,
};
