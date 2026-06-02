import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { kioskoDeviceService } from "../../../services/nominaService";
import { saveKioskoGuestSession } from "../../../helpers/nomina/kioskoSession";

export default function PageKioskoAccesoTemporal() {
  const { uuid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus]   = useState("loading");
  const [message, setMessage] = useState("Validando acceso temporal...");

  useEffect(() => {
    async function validar() {
      try {
        const response = await kioskoDeviceService.bootstrapGuest({ uuid, guest_token: token });
        const data = response.data?.data;

        if (!data?.device?.uuid) {
          throw new Error("Respuesta de validación incompleta.");
        }

        // El token y su expiración se guardan en localStorage para sesiones posteriores en la misma pestaña/dispositivo
        const expiresAt = data.device.guest_expires_at ?? null;
        saveKioskoGuestSession(uuid, token, expiresAt);

        setStatus("success");
        setMessage("Acceso temporal validado. Abriendo kiosko...");
        setTimeout(() => navigate(`/kiosko/${uuid}`, { replace: true }), 1200);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || error.message || "El link de acceso temporal no es válido o ha vencido.");
      }
    }

    validar();
  }, [navigate, uuid, token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6 text-center">
      <div className="max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        {status === "loading" && <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-violet-400" />}
        {status === "success" && <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-green-400" />}
        {status === "error"   && <ShieldAlert  className="mx-auto mb-4 h-10 w-10 text-red-400" />}
        <h1 className="mb-2 text-lg font-semibold text-white">Acceso temporal al kiosko</h1>
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
}
