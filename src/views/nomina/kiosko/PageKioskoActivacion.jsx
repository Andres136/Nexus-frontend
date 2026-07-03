import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { kioskoDeviceService } from "../../../services/nominaService";
import { getKioskoFingerprint, saveKioskoSession } from "../../../helpers/nomina/kioskoSession";

const ACTIVATION_REDIRECT_PREFIX = "kiosko_activation_redirect:";

function activationRedirectKey(token) {
  return `${ACTIVATION_REDIRECT_PREFIX}${token}`;
}

export default function PageKioskoActivacion() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Activando este dispositivo...");

  useEffect(() => {
    async function activar() {
      try {
        const activatedUuid = localStorage.getItem(activationRedirectKey(token));
        if (activatedUuid) {
          setStatus("success");
          setMessage("Este dispositivo ya está activado. Abriendo kiosko...");
          setTimeout(() => navigate(`/kiosko/${activatedUuid}`, { replace: true }), 600);
          return;
        }

        const fingerprint = await getKioskoFingerprint();
        const response = await kioskoDeviceService.activateDevice({ token, fingerprint });
        const data = response.data?.data;
        const device = data?.device;

        if (!device?.uuid || !data?.session_token) {
          throw new Error("Respuesta de activación incompleta.");
        }

        saveKioskoSession(device.uuid, data.session_token);
        localStorage.setItem(activationRedirectKey(token), device.uuid);
        setStatus("success");
        setMessage("Dispositivo activado. Abriendo kiosko...");
        setTimeout(() => navigate(`/kiosko/${device.uuid}`, { replace: true }), 1200);
      } catch (error) {
        const activatedUuid = localStorage.getItem(activationRedirectKey(token));
        if (activatedUuid && error.response?.status === 422) {
          setStatus("success");
          setMessage("Este link ya fue usado en este dispositivo. Abriendo kiosko...");
          setTimeout(() => navigate(`/kiosko/${activatedUuid}`, { replace: true }), 900);
          return;
        }

        setStatus("error");
        setMessage(error.response?.data?.message || error.message || "No se pudo activar el kiosko.");
      }
    }

    activar();
  }, [navigate, token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6 text-center">
      <div className="max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        {status === "loading" && <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-indigo-400" />}
        {status === "success" && <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-green-400" />}
        {status === "error" && <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-red-400" />}
        <h1 className="mb-2 text-lg font-semibold text-white">Activación de kiosko</h1>
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
}
