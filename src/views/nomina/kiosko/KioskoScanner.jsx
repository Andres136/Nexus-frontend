import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import * as faceapi from "face-api.js";
import { KeyRound, MessageCircle } from "lucide-react";
import { workSessionService, permisoService } from "../../../services/nominaService";
import { removeKioskoGuestSession, removeKioskoSession, shouldClearKioskoSession } from "../../../helpers/nomina/kioskoSession";
import { hablar } from "../../../helpers/voz";

const FACE_LIVE_MIN_CONFIDENCE = 0.6;
const FACE_MAX_MATCH_DISTANCE = 0.46;
const FACE_AMBIGUOUS_DISTANCE_MARGIN = 0.06;
const FACE_REQUIRED_CONSECUTIVE_MATCHES = 3;
const FACE_CONSECUTIVE_WINDOW_MS = 1800;
const RECOGNITION_ACTIVE_MS = 60000;
const CAMERA_FRAME_TIMEOUT_MS = 5000;

const hhmm = (date) =>
  date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" });

function mensajeErrorApi(error, fallback = "Error al registrar. Intenta de nuevo.") {
  return error?.response?.data?.message || error?.message || fallback;
}

function uuidKioskoActual() {
  const match = window.location.pathname.match(/^\/kiosko\/([^/]+)/);
  const uuid = match?.[1];

  if (!uuid || uuid === "activar" || uuid === "acceso-temporal") return null;

  return uuid;
}

function mensajeKioskoError(error, fallback = "Error al registrar. Intenta de nuevo.") {
  if (error.response?.status === 403) {
    const uuid = uuidKioskoActual();
    const mensaje = mensajeErrorApi(error);

    if (uuid && shouldClearKioskoSession(mensaje)) {
      removeKioskoSession(uuid);
      removeKioskoGuestSession(uuid);
    }

    return shouldClearKioskoSession(mensaje)
      ? "La sesión de este kiosko cambió o fue reactivada. Abre el nuevo link de activación en este dispositivo."
      : mensaje;
  }

  return mensajeErrorApi(error, fallback);
}

// ── Teclado PIN ───────────────────────────────────────────────────────────────
function PinModal({ cedulaMap, empleadosMap, jornadaId, jornadaActiva, kioskoInfo, onRefrescarJornada, capturarFoto, onReconocido, onEntradaCompleta, onClose }) {
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
    // Inicia la cámara dentro del gesto de "Confirmar". En navegadores móviles,
    // solicitar/reproducir el video después de esperar las consultas al servidor
    // puede ser bloqueado por haber perdido la activación del usuario.
    const fotoRespaldoPromise = capturarFoto?.() ?? Promise.resolve(null);

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
      const [jornadaOperativa, permisoEntrada] = await Promise.all([
        onRefrescarJornada?.(userId) ?? Promise.resolve(jornadaActiva),
        obtenerPermisoEntrada(userId),
      ]);
      const ahora = new Date();
      const yy    = ahora.getFullYear();
      const mm    = String(ahora.getMonth() + 1).padStart(2, "0");
      const dd    = String(ahora.getDate()).padStart(2, "0");

      const foto_respaldo = await fotoRespaldoPromise;

      await workSessionService.createSession({
        user_id:            userId,
        kiosko_id:          kioskoInfo.id,
        registro_diario:    `${yy}-${mm}-${dd}`,
        hora_entrada:       tiempoHHMMSS(ahora),
        horario_laboral_id: jornadaOperativa?.id ?? jornadaId,
        ...(foto_respaldo ? { foto_respaldo } : {}),
      });

      const hora = hhmm(ahora);
      const tarde = !permisoEntrada && minutosTardeEntrada(ahora, jornadaOperativa?.hora_entrada_limite ?? jornadaOperativa?.hora_entrada) > 0;
      decir(jornadaOperativa, mensajeVozEntrada(info.nombre, tarde, permisoEntrada));
      setEstado("exito");
      setMsg(mensajeVisualEntrada(info.nombre, hora, tarde, permisoEntrada));
      onEntradaCompleta(info.nombre, hora, userId);
      setTimeout(onClose, 3000);
    } catch (error) {
      const mensaje = mensajeKioskoError(error);
      setEstado("error");
      setMsg(mensaje);
      decir(jornadaActiva, mensaje);
      setTimeout(() => { setEstado("idle"); setMsg(""); setPin(""); }, 3500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-xs p-6 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Cédula</p>
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
  jornadaId:         PropTypes.number,
  jornadaActiva:     PropTypes.object,
  onRefrescarJornada: PropTypes.func,
  kioskoInfo:        PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }).isRequired,
  capturarFoto:      PropTypes.func,
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

async function obtenerPermisoEntrada(userId) {
  try {
    const res = await permisoService.getPermisosAprobadosHoy(userId);
    const lista = res.data?.data ?? [];
    const ahora = tiempoHHMMSS(new Date()).slice(0, 5);

    return lista.find((permiso) =>
      ["llegada_tarde", "ausencia_parcial"].includes(permiso.tipo)
      && permiso.hora_inicio?.slice(0, 5) <= ahora
      && permiso.hora_fin?.slice(0, 5) >= ahora
    ) ?? null;
  } catch {
    return null;
  }
}

function mensajeVozEntrada(nombre, tarde, permiso) {
  if (permiso) {
    return `${nombre}, tu llegada de permiso ha sido registrada exitosamente.`;
  }

  return tarde
    ? `Registro exitoso. ${nombre}, ingreso tarde.`
    : `Bienvenido, ${nombre}. Registro exitoso.`;
}

function mensajeVisualEntrada(nombre, hora, tarde, permiso) {
  if (permiso) {
    return `${nombre}, tu llegada de permiso ha sido registrada exitosamente. Entrada registrada a las ${hora}.`;
  }

  return tarde
    ? `${nombre}, entrada registrada a las ${hora}. Ingreso tardío.`
    : `¡Bienvenido, ${nombre}! Entrada registrada a las ${hora}.`;
}

function decir(jornada, texto) {
  if (jornada?.comando_voz_activo === false) return;
  hablar(texto);
}

function evaluarCoincidenciaFacial(faceMatcher, descriptor) {
  const mejoresPorUsuario = new Map();

  faceMatcher.labeledDescriptors.forEach((labeled) => {
    const distance = Math.min(
      ...labeled.descriptors.map((knownDescriptor) =>
        faceapi.euclideanDistance(knownDescriptor, descriptor)
      )
    );
    const previo = mejoresPorUsuario.get(labeled.label);

    if (!previo || distance < previo.distance) {
      mejoresPorUsuario.set(labeled.label, { label: labeled.label, distance });
    }
  });

  const candidatos = Array.from(mejoresPorUsuario.values())
    .sort((a, b) => a.distance - b.distance);

  const mejor = candidatos[0] ?? null;
  const segundo = candidatos[1] ?? null;

  if (!mejor || mejor.distance > FACE_MAX_MATCH_DISTANCE) {
    return null;
  }

  if (segundo && segundo.distance - mejor.distance < FACE_AMBIGUOUS_DISTANCE_MARGIN) {
    return null;
  }

  return mejor;
}

export default function KioskoScanner({
  faceMatcher,
  empleadosMap,
  cedulaMap,
  kioskoInfo,
  jornadaId,
  jornadaActiva,
  ultimaMarca,
  onRefrescarJornada,
  onReconocido,
  onEntradaCompleta,
}) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const loopRef    = useRef(null);
  const autoPinRef = useRef(null);
  const cooldown   = useRef(false);
  const detecting  = useRef(false);
  const sleepTimerRef = useRef(null);
  const usuarioBloqueado = useRef(ultimaMarca?.userId ?? null);
  const sinRostroDesde = useRef(null);
  const detOptions = useRef(new faceapi.SsdMobilenetv1Options({ minConfidence: FACE_LIVE_MIN_CONFIDENCE }));
  const matchPendiente = useRef({ userId: null, count: 0, lastAt: 0 });

  const [camError, setCamError]         = useState("");
  const [candidato, setCandidato]       = useState(null);
  const [checkingSession, setChecking]  = useState(false);
  const [guardando, setGuardando]       = useState(false);
  const [exitoMsg, setExitoMsg]         = useState("");
  const [resultadoTipo, setResultadoTipo] = useState("success");
  const [jornadaCerrada, setJornadaCerrada] = useState(false);
  const [showPin, setShowPin]           = useState(false);
  const [reconocimientoFallido, setReconocimientoFallido] = useState(false);
  const [reconocimientoActivo, setReconocimientoActivo] = useState(false);

  const detenerCamara = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Foto de respaldo siempre que se marca por cédula (con o sin error previo
  // de reconocimiento): solo evidencia, nunca debe bloquear la marcación si
  // falla. Si la cámara del reconocimiento ya está activa la reutiliza; si no
  // (cédula usada directamente, sin haber intentado la cara), abre un stream
  // temporal solo para la foto y lo cierra de inmediato.
  const capturarFoto = useCallback(async () => {
    let streamTemporal = null;
    let videoTemporal = null;

    try {
      let video = videoRef.current;

      if (!streamRef.current) {
        streamTemporal = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        videoTemporal = document.createElement("video");
        videoTemporal.muted = true;
        videoTemporal.playsInline = true;
        videoTemporal.autoplay = true;
        videoTemporal.setAttribute("aria-hidden", "true");
        Object.assign(videoTemporal.style, {
          position: "fixed",
          width: "1px",
          height: "1px",
          left: "-9999px",
          opacity: "0",
          pointerEvents: "none",
        });
        document.body.appendChild(videoTemporal);
        videoTemporal.srcObject = streamTemporal;
        await videoTemporal.play();

        await new Promise((resolve, reject) => {
          if (videoTemporal.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
            && videoTemporal.videoWidth > 0) {
            resolve();
            return;
          }

          const timeout = setTimeout(
            () => reject(new Error("La cámara no entregó un fotograma a tiempo.")),
            CAMERA_FRAME_TIMEOUT_MS,
          );
          videoTemporal.addEventListener("loadeddata", () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
        });
        video = videoTemporal;
      } else if (!video || video.readyState < 2) {
        return null;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx || !canvas.width || !canvas.height) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch {
      return null;
    } finally {
      streamTemporal?.getTracks().forEach((t) => t.stop());
      if (videoTemporal) {
        videoTemporal.srcObject = null;
        videoTemporal.remove();
      }
    }
  }, []);

  const activarReconocimiento = useCallback(() => {
    clearTimeout(sleepTimerRef.current);
    cooldown.current = false;
    detecting.current = false;
    matchPendiente.current = { userId: null, count: 0, lastAt: 0 };
    setCamError("");
    setCandidato(null);
    setChecking(false);
    setGuardando(false);
    setExitoMsg("");
    setResultadoTipo("success");
    setJornadaCerrada(false);
    setReconocimientoFallido(false);
    setReconocimientoActivo(true);
  }, []);

  const suspenderReconocimiento = useCallback(() => {
    clearTimeout(sleepTimerRef.current);
    cooldown.current = false;
    detecting.current = false;
    matchPendiente.current = { userId: null, count: 0, lastAt: 0 };
    setReconocimientoActivo(false);
    setReconocimientoFallido(false);
    setCamError("");
    detenerCamara();
  }, [detenerCamara]);

  const resetear = useCallback(() => {
    setCandidato(null);
    setChecking(false);
    setGuardando(false);
    setExitoMsg("");
    setResultadoTipo("success");
    setJornadaCerrada(false);
    setReconocimientoFallido(false);

    matchPendiente.current = { userId: null, count: 0, lastAt: 0 };

    // Reanuda manualmente cuando el kiosko vuelve al estado de espera
    videoRef.current?.play().catch(() => {});

    setTimeout(() => { cooldown.current = false; }, 2000);
  }, []);

  // ── Pausa automática al registrar ────────────────────────────────────────
  useEffect(() => {
    if (exitoMsg || candidato) videoRef.current?.pause();
  }, [exitoMsg, candidato]);

  // ── Cámara (un solo intento) ─────────────────────────────────────────────
  useEffect(() => {
    if (!reconocimientoActivo) {
      detenerCamara();
      return undefined;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => setCamError(err.name + ": " + err.message));

    return () => {
      detenerCamara();
      clearInterval(loopRef.current);
    };
  }, [detenerCamara, reconocimientoActivo]);

  // ── Detección ───────────────────────────────────────────────────────────────
  const detectar = useCallback(async () => {
    if (!reconocimientoActivo || !videoRef.current || !faceMatcher || cooldown.current || candidato || detecting.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    detecting.current = true;
    try {
      const det = await faceapi
        .detectSingleFace(video, detOptions.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!det) {
        matchPendiente.current = { userId: null, count: 0, lastAt: 0 };
        if (usuarioBloqueado.current) {
          sinRostroDesde.current ??= Date.now();
          if (Date.now() - sinRostroDesde.current >= 2000) {
            usuarioBloqueado.current = null;
            sinRostroDesde.current = null;
          }
        }
        return;
      }

      const match = evaluarCoincidenciaFacial(faceMatcher, det.descriptor);
      if (!match) {
        matchPendiente.current = { userId: null, count: 0, lastAt: 0 };
        return;
      }

      const userId = Number(match.label);
      sinRostroDesde.current = null;
      if (usuarioBloqueado.current === userId) return;

      const ahoraMatch = Date.now();
      const previo = matchPendiente.current;
      const esMismoCandidato =
        previo.userId === userId && ahoraMatch - previo.lastAt <= FACE_CONSECUTIVE_WINDOW_MS;
      matchPendiente.current = {
        userId,
        count: esMismoCandidato ? previo.count + 1 : 1,
        lastAt: ahoraMatch,
      };

      if (matchPendiente.current.count < FACE_REQUIRED_CONSECUTIVE_MATCHES) return;
      matchPendiente.current = { userId: null, count: 0, lastAt: 0 };

      cooldown.current = true;
      setReconocimientoFallido(false);
      const info   = empleadosMap.get(userId) ?? { nombre: "Empleado", photoUrl: null };
      setCandidato({ userId, nombre: info.nombre, photoUrl: info.photoUrl });

      setChecking(true);
      try {
        const res      = await workSessionService.getSessionHoy(userId);
        const sessions = res.data?.data?.data ?? res.data?.data ?? [];
        const session  = sessions[0] ?? null;

        // Sesión abierta → pantalla de acciones (salida / pausa / almuerzo)
        if (session && !session.hora_salida) {
          usuarioBloqueado.current = userId;
          onReconocido(userId, session);
          return;
        }

        // Jornada ya cerrada → una sola entrada/salida por día
        if (session && session.hora_salida) {
          setJornadaCerrada(true);
          setResultadoTipo("warning");
          decir(jornadaActiva, `${info.nombre}, tu jornada de hoy ya fue completada. Hasta mañana.`);
          setExitoMsg(`Tu jornada de hoy ya finalizó, ${info.nombre}.`);
          setTimeout(resetear, 4000);
          return;
        }

        // Sin sesión → registrar entrada
        setChecking(false);
        setGuardando(true);
        const [jornadaOperativa, permisoEntrada] = await Promise.all([
          onRefrescarJornada?.(userId) ?? Promise.resolve(jornadaActiva),
          obtenerPermisoEntrada(userId),
        ]);
        const ahora = new Date();
        const yy = ahora.getFullYear();
        const mm = String(ahora.getMonth() + 1).padStart(2, "0");
        const dd = String(ahora.getDate()).padStart(2, "0");

        await workSessionService.createSession({
          user_id:            userId,
          kiosko_id:          kioskoInfo.id,
          registro_diario:    `${yy}-${mm}-${dd}`,
          hora_entrada:       tiempoHHMMSS(ahora),
          horario_laboral_id: jornadaOperativa?.id ?? jornadaId,
        });

        const hora = hhmm(ahora);
        const tarde = !permisoEntrada && minutosTardeEntrada(ahora, jornadaOperativa?.hora_entrada_limite ?? jornadaOperativa?.hora_entrada) > 0;
        decir(jornadaOperativa, mensajeVozEntrada(info.nombre, tarde, permisoEntrada));
        setExitoMsg(mensajeVisualEntrada(info.nombre, hora, tarde, permisoEntrada));
        setResultadoTipo("success");
        usuarioBloqueado.current = userId;
        onEntradaCompleta(info.nombre, hora);
        setTimeout(resetear, 3500);

      } catch (error) {
        const mensaje = mensajeKioskoError(error, "Error al registrar la entrada. Intenta de nuevo.");
        setResultadoTipo("error");
        decir(jornadaActiva, mensaje);
        setExitoMsg(mensaje);
        setTimeout(resetear, 4000);
      } finally {
        setChecking(false);
        setGuardando(false);
      }
    } catch {
      // silencioso
    } finally {
      detecting.current = false;
    }
  }, [faceMatcher, empleadosMap, candidato, onReconocido, kioskoInfo, jornadaId, jornadaActiva, onRefrescarJornada, onEntradaCompleta, resetear, reconocimientoActivo]);

  useEffect(() => {
    if (!reconocimientoActivo) return undefined;

    loopRef.current = setInterval(detectar, 300);
    return () => clearInterval(loopRef.current);
  }, [detectar, reconocimientoActivo]);

  useEffect(() => {
    clearTimeout(autoPinRef.current);

    if (!reconocimientoActivo || candidato || exitoMsg || showPin || reconocimientoFallido) return;

    autoPinRef.current = setTimeout(() => {
      decir(jornadaActiva, "No fue posible validar el reconocimiento facial. Ingresa tu número de cédula.");
      setReconocimientoFallido(true);
    }, 10000);

    return () => clearTimeout(autoPinRef.current);
  }, [candidato, exitoMsg, showPin, reconocimientoFallido, jornadaActiva, reconocimientoActivo]);

  useEffect(() => {
    clearTimeout(sleepTimerRef.current);

    if (!reconocimientoActivo || candidato || exitoMsg || showPin) return undefined;

    sleepTimerRef.current = setTimeout(() => {
      decir(jornadaActiva, "Reconocimiento pausado. Toca la pantalla para activarlo nuevamente.");
      suspenderReconocimiento();
    }, RECOGNITION_ACTIVE_MS);

    return () => clearTimeout(sleepTimerRef.current);
  }, [candidato, exitoMsg, jornadaActiva, showPin, suspenderReconocimiento, reconocimientoActivo]);

  useEffect(() => () => {
    clearTimeout(sleepTimerRef.current);
    detenerCamara();
  }, [detenerCamara]);

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-between py-8 px-4">

      {showPin && (
        <PinModal
          cedulaMap={cedulaMap}
          empleadosMap={empleadosMap}
          jornadaId={jornadaId}
          jornadaActiva={jornadaActiva}
          onRefrescarJornada={onRefrescarJornada}
          kioskoInfo={kioskoInfo}
          capturarFoto={capturarFoto}
          onReconocido={(userId, session) => {
            usuarioBloqueado.current = userId;
            setShowPin(false);
            onReconocido(userId, session);
          }}
          onEntradaCompleta={(nombre, hora, userId) => {
            usuarioBloqueado.current = userId;
            setShowPin(false);
            setReconocimientoFallido(false);
            onEntradaCompleta(nombre, hora, userId);
          }}
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
            : !reconocimientoActivo ? "Reconocimiento en espera · Toca activar"
            : reconocimientoFallido || camError ? "Reconocimiento no validado · Usa tu cédula"
            : "Reconocimiento facial · Acércate a la cámara"}
        </p>
      </div>

      {/* Cámara */}
      <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-2 border-indigo-600/40 shadow-2xl shadow-indigo-900/30 my-4">
        {!reconocimientoActivo ? (
          <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-3 px-5 text-center">
            <svg className="h-12 w-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-2.36A1 1 0 0122 9.03v5.94a1 1 0 01-1.53.85l-4.72-2.36M4.5 6.75h8.25A2.25 2.25 0 0115 9v6a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 15V9A2.25 2.25 0 014.5 6.75z" />
            </svg>
            <div>
              <p className="text-white text-sm font-bold">Cámara pausada</p>
              <p className="text-gray-400 text-xs mt-1">Activa el reconocimiento cuando vayas a marcar.</p>
            </div>
          </div>
        ) : camError ? (
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
          resultadoTipo === "error"
            ? "bg-red-900/40 border-red-500/30"
            : jornadaCerrada
            ? "bg-amber-900/40 border-amber-500/30"
            : "bg-green-900/40 border-green-500/30"
        }`}>
          {!jornadaCerrada && resultadoTipo !== "error" && (
            <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Registro exitoso
            </p>
          )}
          {resultadoTipo === "error" && (
            <p className="text-red-300 text-xs font-semibold uppercase tracking-widest mb-1">
              Marcación no permitida
            </p>
          )}
          <p className={`text-sm font-medium ${
            resultadoTipo === "error" ? "text-red-200" : jornadaCerrada ? "text-amber-300" : "text-green-200"
          }`}>
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
            {!reconocimientoActivo ? (
              <>
                <button
                  onClick={activarReconocimiento}
                  className="w-full py-4 rounded-2xl bg-green-600 border border-green-400/70 text-white text-sm font-bold shadow-lg shadow-green-900/40 hover:bg-green-500 transition-colors">
                  Activar reconocimiento facial
                </button>
                <button
                  onClick={() => setShowPin(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-700/70 border border-indigo-500/40 text-indigo-200 text-sm font-medium hover:bg-indigo-600/80 transition-colors">
                  <KeyRound className="h-4 w-4" strokeWidth={2} />
                  Usar cédula
                </button>
              </>
            ) : !reconocimientoFallido && !camError ? (
              <div className="w-full py-4 rounded-2xl bg-green-600/90 border border-green-500/60 text-white text-center text-sm font-bold select-none shadow-lg shadow-green-900/40">
                Acércate a la cámara
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPin(true)}
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-indigo-700/70 border border-indigo-500/40 text-indigo-200 text-sm font-medium hover:bg-indigo-600/80 transition-colors">
                  <KeyRound className="h-4 w-4" strokeWidth={2} />
                  Usar cédula
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
  jornadaId:         PropTypes.number,
  jornadaActiva:     PropTypes.object,
  onRefrescarJornada: PropTypes.func,
  ultimaMarca:       PropTypes.shape({ nombre: PropTypes.string, hora: PropTypes.string, userId: PropTypes.number }),
  onReconocido:      PropTypes.func.isRequired,
  onEntradaCompleta: PropTypes.func.isRequired,
};
