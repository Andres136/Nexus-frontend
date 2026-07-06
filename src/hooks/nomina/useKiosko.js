import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import * as faceapi from "face-api.js";
import {
  kioskoDeviceService,
  horarioOperacionService,
  horarioUsuarioSemanalService,
} from "../../services/nominaService";
import {
  getKioskoFingerprint,
  getKioskoSession,
  removeKioskoSession,
  getKioskoGuestSession,
  removeKioskoGuestSession,
  shouldClearKioskoSession,
} from "../../helpers/nomina/kioskoSession";
import {
  getFaceDescriptorCache,
  getKioskoBootstrapCache,
  saveFaceDescriptorCache,
  saveKioskoBootstrapCache,
} from "../../helpers/nomina/kioskoCache";

const API_URL     = import.meta.env.VITE_API_URL;
const STORAGE_URL = API_URL + "/storage/";
const MODEL_URL   = "/models";
const FACE_IMAGE_MIN_CONFIDENCE = 0.5;
const FACE_MATCH_THRESHOLD = 0.42;
const BOOTSTRAP_CACHE_TIMEOUT_MS = 7000;

async function loadModels() {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
}

async function loadImageViaApi(uuid) {
  const deviceUuid   = window.location.pathname.match(/^\/kiosko\/([^/]+)/)?.[1];
  const sessionToken = deviceUuid ? getKioskoSession(deviceUuid) : null;
  const guestToken   = deviceUuid ? getKioskoGuestSession(deviceUuid) : null;
  const fingerprint  = (sessionToken || guestToken) && deviceUuid ? await getKioskoFingerprint() : null;
  const authToken    = localStorage.getItem("token");

  const isKiosko = sessionToken || guestToken;
  const url = isKiosko
    ? `${API_URL}/api/nomina/kiosko-face-photos/${uuid}/image`
    : `${API_URL}/api/nomina/users-face-photos/${uuid}/image`;

  let headers;
  if (guestToken) {
    headers = { "X-Kiosko-Device": deviceUuid, "X-Kiosko-Guest-Token": guestToken, "X-Kiosko-Guest-Fingerprint": fingerprint };
  } else if (sessionToken) {
    headers = { "X-Kiosko-Device": deviceUuid, "X-Kiosko-Session": sessionToken, "X-Kiosko-Fingerprint": fingerprint };
  } else {
    headers = { Authorization: `Bearer ${authToken}` };
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob    = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img    = new Image();
    img.onload   = () => { URL.revokeObjectURL(blobUrl); resolve(img); };
    img.onerror  = reject;
    img.src      = blobUrl;
  });
}

function facePhotoCacheKey(foto) {
  return [
    foto.uuid,
    foto.users_id,
    foto.photo,
    foto.updated_at ?? foto.created_at ?? "",
  ].join("|");
}

async function buildFaceMatcher(fotos, kioskoUuid) {
  if (!fotos.length) return null;
  const labeled = [];
  const descriptorCache = getFaceDescriptorCache(kioskoUuid);
  const nextDescriptorCache = {};
  let cacheChanged = false;

  for (const foto of fotos) {
    const cacheKey = facePhotoCacheKey(foto);
    const cachedDescriptor = descriptorCache[cacheKey];

    try {
      if (Array.isArray(cachedDescriptor) && cachedDescriptor.length) {
        nextDescriptorCache[cacheKey] = cachedDescriptor;
        labeled.push(
          new faceapi.LabeledFaceDescriptors(String(foto.users_id), [new Float32Array(cachedDescriptor)])
        );
        continue;
      }

      const img = await loadImageViaApi(foto.uuid);
      const det = await faceapi
        .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: FACE_IMAGE_MIN_CONFIDENCE }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (det) {
        const descriptor = Array.from(det.descriptor);
        nextDescriptorCache[cacheKey] = descriptor;
        cacheChanged = true;
        labeled.push(
          new faceapi.LabeledFaceDescriptors(String(foto.users_id), [new Float32Array(descriptor)])
        );
      }
    } catch {
      // foto no cargó o no se detectó rostro — se omite
    }
  }
  if (cacheChanged) {
    saveFaceDescriptorCache(kioskoUuid, nextDescriptorCache);
  }
  if (!labeled.length) return null;
  return new faceapi.FaceMatcher(labeled, FACE_MATCH_THRESHOLD);
}

function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("El backend tardó demasiado en responder.")), ms);
  });
}

async function bootstrapKiosko({ code, sessionToken, guestToken }) {
  const fingerprint = await getKioskoFingerprint();

  if (guestToken) {
    const response = await kioskoDeviceService.bootstrapGuest({ uuid: code, guest_token: guestToken, fingerprint });
    return response.data?.data;
  }

  const response = await kioskoDeviceService.bootstrapDevice({ uuid: code, session_token: sessionToken, fingerprint });
  return response.data?.data;
}

function aplicarInstruccionDiaria(jornada, instruccion) {
  if (!instruccion) return jornada;
  return {
    ...jornada,
    instruccion_operativa_diaria: instruccion,
    hora_entrada:              instruccion.hora_entrada              ?? jornada?.hora_entrada,
    hora_entrada_limite:       instruccion.hora_entrada_limite       ?? jornada?.hora_entrada_limite,
    hora_salida_pausa:         instruccion.hora_salida_pausa         ?? jornada?.hora_salida_pausa,
    hora_ingreso_pausa:        instruccion.hora_ingreso_pausa        ?? jornada?.hora_ingreso_pausa,
    hora_salida_almuerzo:      instruccion.hora_salida_almuerzo      ?? jornada?.hora_salida_almuerzo,
    hora_ingreso_almuerzo:     instruccion.hora_ingreso_almuerzo     ?? jornada?.hora_ingreso_almuerzo,
    hora_salida:               instruccion.hora_salida               ?? jornada?.hora_salida,
    duracion_pausa_minutos:    instruccion.duracion_pausa_minutos    ?? jornada?.duracion_pausa_minutos,
    duracion_almuerzo_minutos: instruccion.duracion_almuerzo_minutos ?? jornada?.duracion_almuerzo_minutos,
  };
}

function aplicarHorarioUsuario(jornada, horarioUsuario) {
  if (!horarioUsuario) return jornada;
  const jornadaUsuario = horarioUsuario.jornada_laboral ?? horarioUsuario.jornadaLaboral ?? jornada;
  return {
    ...jornada,
    ...jornadaUsuario,
    horario_usuario_semanal: horarioUsuario,
    hora_entrada:              horarioUsuario.hora_entrada              ?? jornadaUsuario?.hora_entrada              ?? jornada?.hora_entrada,
    hora_entrada_limite:       horarioUsuario.hora_entrada_limite       ?? jornadaUsuario?.hora_entrada_limite       ?? jornada?.hora_entrada_limite,
    hora_salida_pausa:         horarioUsuario.hora_salida_pausa         ?? jornadaUsuario?.hora_salida_pausa         ?? jornada?.hora_salida_pausa,
    hora_ingreso_pausa:        horarioUsuario.hora_ingreso_pausa        ?? jornadaUsuario?.hora_ingreso_pausa        ?? jornada?.hora_ingreso_pausa,
    hora_salida_almuerzo:      horarioUsuario.hora_salida_almuerzo      ?? jornadaUsuario?.hora_salida_almuerzo      ?? jornada?.hora_salida_almuerzo,
    hora_ingreso_almuerzo:     horarioUsuario.hora_ingreso_almuerzo     ?? jornadaUsuario?.hora_ingreso_almuerzo     ?? jornada?.hora_ingreso_almuerzo,
    hora_salida:               horarioUsuario.hora_salida               ?? jornadaUsuario?.hora_salida               ?? jornada?.hora_salida,
    duracion_pausa_minutos:    horarioUsuario.duracion_pausa_minutos    ?? jornadaUsuario?.duracion_pausa_minutos    ?? jornada?.duracion_pausa_minutos,
    duracion_almuerzo_minutos: horarioUsuario.duracion_almuerzo_minutos ?? jornadaUsuario?.duracion_almuerzo_minutos ?? jornada?.duracion_almuerzo_minutos,
  };
}

function instruccionEsDeUsuario(instruccion) {
  return instruccion?.user_id !== null && instruccion?.user_id !== undefined;
}

function fechaLocal() {
  const fecha = new Date();
  const yyyy  = fecha.getFullYear();
  const mm    = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd    = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useKiosko() {
  const { code } = useParams();
  const queryClient = useQueryClient();
  const fechaOperacion = fechaLocal();

  const [status, setStatus]       = useState("loading"); // loading | error | ready
  const [loadMsg, setLoadMsg]     = useState("Inicializando kiosko...");
  const [errorMsg, setErrorMsg]   = useState("");

  const [kioskoInfo, setKioskoInfo]             = useState(null);
  const [jornadasLaborales, setJornadasLaborales] = useState([]);
  const [faceMatcher, setFaceMatcher]           = useState(null);
  const [empleadosMap, setEmpleadosMap]         = useState(new Map());
  const [cedulaMap, setCedulaMap]               = useState(new Map());

  const [step, setStep]                   = useState("scanner"); // scanner | acciones
  const [empleadoActual, setEmpleadoActual] = useState(null);
  const [ultimaMarca, setUltimaMarca]     = useState(null);

  const invalidarSesionKiosko = useCallback((message = "La sesión de este kiosko no es válida. Genera un nuevo link de activación y reactívalo en este dispositivo.") => {
    if (shouldClearKioskoSession(message)) {
      removeKioskoSession(code);
      removeKioskoGuestSession(code);
    }

    const mensajeNormalizado = message === "El kiosko no está activo."
      ? "Este kiosko está desactivado en administración. Actívalo nuevamente y recarga esta pantalla."
      : message;
    setErrorMsg(mensajeNormalizado);
    setStatus("error");
  }, [code]);

  const jornadaBaseActiva = useMemo(
    () => jornadasLaborales.find((j) => j.status !== false) ?? jornadasLaborales[0] ?? null,
    [jornadasLaborales]
  );

  const construirJornadaOperativa = useCallback((instruccionDiaria, jornadaBase = jornadaBaseActiva) => {
    if (!jornadaBase) return null;
    const jornadaDelDia =
      instruccionDiaria?.jornada_laboral ?? instruccionDiaria?.jornadaLaboral ?? jornadaBase;
    return aplicarInstruccionDiaria(jornadaDelDia, instruccionDiaria);
  }, [jornadaBaseActiva]);

  const { data: instruccionOperativa } = useQuery({
    queryKey: ["horarioOperacionKiosko", fechaOperacion],
    queryFn: async () => {
      try {
        const response = await horarioOperacionService.getKioskoHoy();
        return response.data?.data ?? null;
      } catch (error) {
        if (error.response?.status === 403) {
          invalidarSesionKiosko(error.response?.data?.message);
          throw error;
        }
        return null;
      }
    },
    enabled: status === "ready" && jornadasLaborales.length > 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 0,
  });

  const jornadaActiva = useMemo(
    () => construirJornadaOperativa(instruccionOperativa) ?? jornadaBaseActiva,
    [construirJornadaOperativa, instruccionOperativa, jornadaBaseActiva]
  );
  const jornadaId = jornadaActiva?.id ?? jornadaBaseActiva?.id ?? null;

  const refrescarJornadaOperativa = useCallback(async (userId) => {
    if (!jornadasLaborales.length) return jornadaActiva;
    const [instruccionDiaria, horarioUsuario] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: ["horarioOperacionKiosko", fechaOperacion, userId || "global"],
        queryFn: async () => {
          try {
            const response = await horarioOperacionService.getKioskoHoy(userId ? { user_id: userId } : {});
            return response.data?.data ?? null;
          } catch (error) {
            if (error.response?.status === 403) {
              invalidarSesionKiosko(error.response?.data?.message);
              throw error;
            }
            return null;
          }
        },
        staleTime: 0,
        retry: false,
      }),
      userId
        ? horarioUsuarioSemanalService.getKioskoHoy(userId)
            .then((response) => response.data?.data ?? null)
            .catch((error) => {
              if (error.response?.status === 403) invalidarSesionKiosko(error.response?.data?.message);
              return null;
            })
        : Promise.resolve(null),
    ]);

    const baseConInstruccionGeneral = instruccionEsDeUsuario(instruccionDiaria)
      ? jornadaBaseActiva
      : construirJornadaOperativa(instruccionDiaria, jornadaBaseActiva) ?? jornadaBaseActiva;
    const baseConHorarioUsuario = aplicarHorarioUsuario(baseConInstruccionGeneral, horarioUsuario) ?? baseConInstruccionGeneral;

    return instruccionEsDeUsuario(instruccionDiaria)
      ? construirJornadaOperativa(instruccionDiaria, baseConHorarioUsuario) ?? baseConHorarioUsuario ?? jornadaActiva
      : baseConHorarioUsuario ?? jornadaActiva;
  }, [construirJornadaOperativa, fechaOperacion, invalidarSesionKiosko, jornadaActiva, jornadaBaseActiva, jornadasLaborales, queryClient]);

  useEffect(() => {
    async function init() {
      try {
        setLoadMsg("Validando dispositivo...");

        const sessionToken = getKioskoSession(code);
        const guestToken   = getKioskoGuestSession(code);

        if (!sessionToken && !guestToken) {
          throw new Error(
            "Este kiosko no está activado en este dispositivo. Usa el link de activación generado por administración."
          );
        }

        const cachedBootstrap = sessionToken ? getKioskoBootstrapCache(code) : null;
        let bootstrap;
        let usandoCache = false;

        try {
          const onlineBootstrap = bootstrapKiosko({ code, sessionToken, guestToken });
          bootstrap = cachedBootstrap
            ? await Promise.race([onlineBootstrap, timeout(BOOTSTRAP_CACHE_TIMEOUT_MS)])
            : await onlineBootstrap;

          if (sessionToken) {
            saveKioskoBootstrapCache(code, bootstrap);
          }
        } catch (error) {
          if (error.response?.status === 403) {
            throw error;
          }

          if (!cachedBootstrap) {
            throw error;
          }

          bootstrap = cachedBootstrap;
          usandoCache = true;
        }

        const kiosko = bootstrap?.device;
        if (!kiosko?.id) throw new Error("No fue posible validar este kiosko.");
        setKioskoInfo({ id: kiosko.id, uuid: kiosko.uuid, name: kiosko.name });

        setLoadMsg("Cargando modelos de reconocimiento facial...");
        await loadModels();

        setLoadMsg(usandoCache ? "Cargando datos guardados del kiosko..." : "Cargando jornadas laborales...");
        const jornadas   = bootstrap?.jornadas ?? [];
        setJornadasLaborales(jornadas);
        const jornadaBase = jornadas.find((j) => j.status !== false) ?? jornadas[0];
        if (!jornadaBase) throw new Error("No hay jornadas laborales configuradas.");

        setLoadMsg("Cargando empleados...");
        const empleados = bootstrap?.empleados ?? [];

        setLoadMsg("Cargando fotos faciales...");
        const fotos = bootstrap?.fotos ?? [];

        const mapa    = new Map();
        const cedulas = new Map();
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

        setLoadMsg("Procesando descriptores faciales...");
        setFaceMatcher(await buildFaceMatcher(fotos, code));

        setStatus("ready");
      } catch (err) {
        const mensaje = err.response?.data?.message || err.message || "";
        if (err.response?.status === 403 && shouldClearKioskoSession(mensaje)) {
          removeKioskoSession(code);
          removeKioskoGuestSession(code);
        }
        setErrorMsg(err.response?.data?.message || err.message || "Error al inicializar el kiosko.");
        setStatus("error");
      }
    }
    init();
  }, [code]);

  const handleReconocido = useCallback((userId, session) => {
    const info = empleadosMap.get(userId) ?? { nombre: "Empleado", photoUrl: null };
    setEmpleadoActual({ userId, nombre: info.nombre, photoUrl: info.photoUrl, session });
    setStep("acciones");
  }, [empleadosMap]);

  const handleAccionCompleta = useCallback((nombre, hora, userId) => {
    setUltimaMarca({ nombre, hora, userId });
    setEmpleadoActual(null);
    setStep("scanner");
  }, []);

  const handleCancelar = useCallback(() => {
    setEmpleadoActual(null);
    setStep("scanner");
  }, []);

  return {
    status,
    loadMsg,
    errorMsg,
    kioskoInfo,
    faceMatcher,
    empleadosMap,
    cedulaMap,
    jornadaId,
    jornadaActiva,
    step,
    empleadoActual,
    ultimaMarca,
    refrescarJornadaOperativa,
    handleReconocido,
    handleAccionCompleta,
    handleCancelar,
  };
}
