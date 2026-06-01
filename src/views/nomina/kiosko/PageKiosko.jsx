import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import * as faceapi from "face-api.js";
import KioskoScanner from "./KioskoScanner";
import KioskoAcciones from "./KioskoAcciones";
import {
  kioskoDeviceService,
  horarioOperacionService,
} from "../../../services/nominaService";
import {
  getKioskoFingerprint,
  getKioskoSession,
  removeKioskoSession,
} from "../../../helpers/nomina/kioskoSession";

const API_URL    = import.meta.env.VITE_API_URL;
const STORAGE_URL = API_URL + "/storage/";
const MODEL_URL  = "/models";

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function loadModels() {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
}

// Carga la imagen a través de la API (con auth) para evitar CORS en storage
async function loadImageViaApi(uuid) {
  const deviceUuid = window.location.pathname.match(/^\/kiosko\/([^/]+)/)?.[1];
  const sessionToken = deviceUuid ? getKioskoSession(deviceUuid) : null;
  const fingerprint = deviceUuid ? await getKioskoFingerprint() : null;
  const token = localStorage.getItem("token");
  const url = sessionToken
    ? `${API_URL}/api/nomina/kiosko-face-photos/${uuid}/image`
    : `${API_URL}/api/nomina/users-face-photos/${uuid}/image`;
  const res   = await fetch(url, {
    headers: sessionToken
      ? {
          "X-Kiosko-Device": deviceUuid,
          "X-Kiosko-Session": sessionToken,
          "X-Kiosko-Fingerprint": fingerprint,
        }
      : { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob    = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img  = new Image();
    img.onload = () => { URL.revokeObjectURL(blobUrl); resolve(img); };
    img.onerror = reject;
    img.src = blobUrl;
  });
}

async function buildFaceMatcher(fotos) {
  if (!fotos.length) return null;
  const labeled = [];
  for (const foto of fotos) {
    try {
      const img = await loadImageViaApi(foto.uuid);
      const det = await faceapi
        .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.35 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (det) {
        labeled.push(
          new faceapi.LabeledFaceDescriptors(String(foto.users_id), [det.descriptor])
        );
      }
    } catch {
      // foto no cargó o no se detectó rostro — se omite
    }
  }
  if (!labeled.length) return null;
  return new faceapi.FaceMatcher(labeled, 0.62);
}

function aplicarInstruccionDiaria(jornada, instruccion) {
  if (!instruccion) return jornada;

  return {
    ...jornada,
    instruccion_operativa_diaria: instruccion,
    hora_entrada: instruccion.hora_entrada ?? jornada?.hora_entrada,
    hora_entrada_limite: instruccion.hora_entrada_limite ?? jornada?.hora_entrada_limite,
    hora_salida_pausa: instruccion.hora_salida_pausa ?? jornada?.hora_salida_pausa,
    hora_ingreso_pausa: instruccion.hora_ingreso_pausa ?? jornada?.hora_ingreso_pausa,
    hora_salida_almuerzo: instruccion.hora_salida_almuerzo ?? jornada?.hora_salida_almuerzo,
    hora_ingreso_almuerzo: instruccion.hora_ingreso_almuerzo ?? jornada?.hora_ingreso_almuerzo,
    hora_salida: instruccion.hora_salida ?? jornada?.hora_salida,
    duracion_pausa_minutos: instruccion.duracion_pausa_minutos ?? jornada?.duracion_pausa_minutos,
    duracion_almuerzo_minutos: instruccion.duracion_almuerzo_minutos ?? jornada?.duracion_almuerzo_minutos,
  };
}

function fechaLocal() {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Pantalla de carga ────────────────────────────────────────────────────────
function PantallaEstado({ titulo, detalle, error }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
      {error ? (
        <div className="w-16 h-16 rounded-full bg-red-900/40 flex items-center justify-center mb-2">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
      ) : (
        <svg className="animate-spin h-10 w-10 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      <p className="text-white text-lg font-semibold">{titulo}</p>
      {detalle && <p className="text-gray-400 text-sm max-w-xs">{detalle}</p>}
    </div>
  );
}

PantallaEstado.propTypes = {
  titulo: PropTypes.string.isRequired,
  detalle: PropTypes.string,
  error: PropTypes.bool,
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PageKiosko() {
  const { code } = useParams();
  const queryClient = useQueryClient();
  const fechaOperacion = fechaLocal();

  const [status, setStatus]         = useState("loading"); // loading | error | ready
  const [loadMsg, setLoadMsg]       = useState("Inicializando kiosko...");
  const [errorMsg, setErrorMsg]     = useState("");

  const [kioskoInfo, setKioskoInfo] = useState(null);  // { id, name, uuid }
  const [jornadasLaborales, setJornadasLaborales] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [empleadosMap, setEmpleadosMap] = useState(new Map()); // userId → { nombre, photoUrl }
  const [cedulaMap, setCedulaMap]       = useState(new Map()); // cedula → userId

  const [step, setStep]             = useState("scanner"); // scanner | acciones
  const [empleadoActual, setEmpleadoActual] = useState(null); // { userId, nombre, photoUrl, session }
  const [ultimaMarca, setUltimaMarca] = useState(null); // { nombre, hora }

  const jornadaBaseActiva = useMemo(
    () => jornadasLaborales.find((j) => j.status !== false) ?? jornadasLaborales[0] ?? null,
    [jornadasLaborales]
  );

  const construirJornadaOperativa = useCallback((instruccionDiaria) => {
    if (!jornadaBaseActiva) return null;
    const jornadaDelDia = instruccionDiaria?.jornada_laboral ?? instruccionDiaria?.jornadaLaboral ?? jornadaBaseActiva;
    return aplicarInstruccionDiaria(jornadaDelDia, instruccionDiaria);
  }, [jornadaBaseActiva]);

  const { data: instruccionOperativa } = useQuery({
    queryKey: ["horarioOperacionKiosko", fechaOperacion],
    queryFn: async () => {
      const response = await horarioOperacionService.getKioskoHoy();
      return response.data?.data ?? null;
    },
    enabled: status === "ready" && jornadasLaborales.length > 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const jornadaActiva = useMemo(
    () => construirJornadaOperativa(instruccionOperativa) ?? jornadaBaseActiva,
    [construirJornadaOperativa, instruccionOperativa, jornadaBaseActiva]
  );
  const jornadaId = jornadaActiva?.id ?? jornadaBaseActiva?.id ?? null;

  const refrescarJornadaOperativa = useCallback(async () => {
    if (!jornadasLaborales.length) return jornadaActiva;

    const instruccionDiaria = await queryClient.fetchQuery({
      queryKey: ["horarioOperacionKiosko", fechaOperacion],
      queryFn: async () => {
        const response = await horarioOperacionService.getKioskoHoy();
        return response.data?.data ?? null;
      },
      staleTime: 0,
    });

    const jornadaOperativa = construirJornadaOperativa(instruccionDiaria);
    if (!jornadaOperativa) return jornadaActiva;

    return jornadaOperativa;
  }, [construirJornadaOperativa, fechaOperacion, jornadaActiva, jornadasLaborales, queryClient]);

  useEffect(() => {
    async function init() {
      try {
        // 1. Validar dispositivo activado
        setLoadMsg("Validando dispositivo...");
        const sessionToken = getKioskoSession(code);
        if (!sessionToken) {
          throw new Error("Este kiosko no está activado en este dispositivo. Usa el link de activación generado por administración.");
        }

        const fingerprint = await getKioskoFingerprint();
        const validationPayload = {
          uuid: code,
          session_token: sessionToken,
          fingerprint,
        };
        const validation = await kioskoDeviceService.bootstrapDevice(validationPayload);
        const bootstrap = validation.data?.data;
        const kiosko = bootstrap?.device;
        if (!kiosko?.id) throw new Error("No fue posible validar este kiosko.");
        setKioskoInfo({ id: kiosko.id, uuid: kiosko.uuid, name: kiosko.name });

        // 2. Cargar modelos
        setLoadMsg("Cargando modelos de reconocimiento facial...");
        await loadModels();

        // 3. Primera jornada activa (fallback para horario_laboral_id)
        setLoadMsg("Cargando jornadas laborales...");
        const jornadas = bootstrap?.jornadas ?? [];
        setJornadasLaborales(jornadas);
        const jornadaBase = jornadas.find((j) => j.status !== false) ?? jornadas[0];
        if (!jornadaBase) throw new Error("No hay jornadas laborales configuradas.");

        // 4. Empleados (nombre por userId)
        setLoadMsg("Cargando empleados...");
        const empleados = bootstrap?.empleados ?? [];

        // 5. Fotos faciales + construir matcher
        setLoadMsg("Cargando fotos faciales...");
        const fotos = bootstrap?.fotos ?? [];

        // Mapa userId → { nombre, photoUrl }
        const mapa = new Map();
        const cedulas = new Map(); // cedula → userId
        empleados.forEach((e) => {
          mapa.set(e.id, { nombre: e.name, photoUrl: null });
          if (e.numero_documento) cedulas.set(String(e.numero_documento).trim(), e.id);
        });
        fotos.forEach((f) => {
          const entry = mapa.get(f.users_id);
          if (entry) entry.photoUrl = f.photo ? STORAGE_URL + f.photo : null;
          else mapa.set(f.users_id, { nombre: `Usuario #${f.users_id}`, photoUrl: f.photo ? STORAGE_URL + f.photo : null });
        });
        setEmpleadosMap(mapa);
        setCedulaMap(cedulas);

        // 6. Construir FaceMatcher
        setLoadMsg("Procesando descriptores faciales...");
        const matcher = await buildFaceMatcher(fotos);
        setFaceMatcher(matcher);

        setStatus("ready");
      } catch (err) {
        if (err.response?.status === 403) {
          removeKioskoSession(code);
        }
        setErrorMsg(err.response?.data?.message || err.message || "Error al inicializar el kiosko.");
        setStatus("error");
      }
    }
    init();
  }, [code]);

  const handleReconocido = (userId, session) => {
    const info = empleadosMap.get(userId) ?? { nombre: "Empleado", photoUrl: null };
    setEmpleadoActual({ userId, nombre: info.nombre, photoUrl: info.photoUrl, session });
    setStep("acciones");
  };

  const handleAccionCompleta = (nombre, hora) => {
    setUltimaMarca({ nombre, hora });
    setEmpleadoActual(null);
    setStep("scanner");
  };

  if (status === "loading") return <PantallaEstado titulo={loadMsg} />;
  if (status === "error")   return <PantallaEstado titulo="Error al iniciar" detalle={errorMsg} error />;

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      {step === "scanner" && (
        <KioskoScanner
          faceMatcher={faceMatcher}
          empleadosMap={empleadosMap}
          cedulaMap={cedulaMap}
          kioskoInfo={kioskoInfo}
          jornadaId={jornadaId}
          jornadaActiva={jornadaActiva}
          ultimaMarca={ultimaMarca}
          onRefrescarJornada={refrescarJornadaOperativa}
          onReconocido={handleReconocido}
          onEntradaCompleta={handleAccionCompleta}
        />
      )}
      {step === "acciones" && empleadoActual && (
        <KioskoAcciones
          empleado={empleadoActual}
          kioskoInfo={kioskoInfo}
          jornadaId={jornadaId}
          jornadaActiva={jornadaActiva}
          onRefrescarJornada={refrescarJornadaOperativa}
          onDone={handleAccionCompleta}
          onCancelar={() => { setEmpleadoActual(null); setStep("scanner"); }}
        />
      )}
    </div>
  );
}
