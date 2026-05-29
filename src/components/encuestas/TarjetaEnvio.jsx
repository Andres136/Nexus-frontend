import { Copy, Check, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

const ESTADO_CONFIG = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    class: "bg-amber-50 text-amber-700 border-amber-200",
  },
  respondida: {
    label: "Respondida",
    icon: CheckCircle2,
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  vencida: {
    label: "Vencida",
    icon: AlertCircle,
    class: "bg-red-50 text-red-700 border-red-200",
  },
};

const formatFecha = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function TarjetaEnvio({ envio }) {
  const [copiado, setCopiado] = useState(false);

  const config = ESTADO_CONFIG[envio.estado] ?? ESTADO_CONFIG.pendiente;
  const Icono = config.icon;

  const link = `${import.meta.env.VITE_APP_URL ?? ""}/encuesta/${envio.token}`;

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
      {/* Cliente */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {envio.cliente?.nombre ?? "—"}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {envio.cliente?.email ?? "Sin email"}
        </p>
      </div>

      {/* Fecha envío */}
      <div className="hidden sm:block text-xs text-gray-400 shrink-0 text-right">
        <p>Enviado</p>
        <p className="text-gray-600 font-medium">{formatFecha(envio.sent_at)}</p>
      </div>

      {/* Fecha respuesta */}
      {envio.responded_at && (
        <div className="hidden md:block text-xs text-gray-400 shrink-0 text-right">
          <p>Respondido</p>
          <p className="text-gray-600 font-medium">{formatFecha(envio.responded_at)}</p>
        </div>
      )}

      {/* Estado chip */}
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0 ${config.class}`}
      >
        <Icono className="w-3 h-3" />
        {config.label}
      </span>

      {/* Copiar link */}
      {envio.estado === "pendiente" && (
        <button
          type="button"
          onClick={copiarLink}
          title="Copiar link"
          className={`shrink-0 p-1.5 rounded-lg transition-colors
            ${copiado
              ? "text-emerald-600 bg-emerald-50"
              : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
        >
          {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
