import { useState } from "react";
import PropTypes from "prop-types";
import { Clock, Copy, Monitor } from "lucide-react";
import { kioskoDeviceService } from "../../services/nominaService";
import { useGetKioscos } from "../../hooks/nomina/useGetKioscos";
import { showToast } from "../../helpers/utils/showToast";

function BtnGenerar({ uuid, className = "" }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const response  = await kioskoDeviceService.generateGuestLink(uuid);
      const guestUrl  = response.data?.data?.guest_url;
      const expiresAt = response.data?.data?.expires_at;
      const url = guestUrl?.startsWith("http")
        ? guestUrl
        : `${window.location.origin}${guestUrl}`;
      await navigator.clipboard.writeText(url);
      const expira = expiresAt ? new Date(expiresAt).toLocaleString("es-CO") : "24 horas";
      showToast("success", `Link temporal copiado. Vence: ${expira}`);
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo generar el link temporal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800 disabled:opacity-50 transition-colors ${className}`}
    >
      {loading ? <Copy className="h-3.5 w-3.5 animate-pulse" /> : <Clock className="h-3.5 w-3.5" />}
      Acceso temporal
    </button>
  );
}

BtnGenerar.propTypes = {
  uuid:      PropTypes.string.isRequired,
  className: PropTypes.string,
};

// Cuando se usa sin uuid muestra la lista de kioscos activos
function ListaKioscos() {
  const { kioscos, isLoading } = useGetKioscos({ per_page: 50 });
  const activos = (kioscos?.data?.data ?? []).filter((k) => k.status === "active");

  if (isLoading) {
    return <p className="text-sm text-gray-400 animate-pulse">Cargando kioscos...</p>;
  }

  if (!activos.length) {
    return <p className="text-sm text-gray-400">No hay kioscos activos.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {activos.map((k) => (
        <li key={k.uuid} className="flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Monitor className="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{k.name}</p>
              <p className="text-xs text-gray-400 font-mono">{k.code}</p>
            </div>
          </div>
          <BtnGenerar uuid={k.uuid} className="px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 !text-violet-700 gap-1.5" />
        </li>
      ))}
    </ul>
  );
}

// ─── Exportación principal ────────────────────────────────────────────────────
// Con uuid  → solo el botón (para usar en tablas)
// Sin uuid  → panel con lista de kioscos activos (para usar en layout)
export default function BtnAccesoTemporalKiosko({ uuid, className }) {
  if (uuid) return <BtnGenerar uuid={uuid} className={className} />;

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Acceso temporal</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Genera un link con vencimiento de 24 h para acceso externo al kiosko.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ListaKioscos />
      </div>
    </div>
  );
}

BtnAccesoTemporalKiosko.propTypes = {
  uuid:      PropTypes.string,
  className: PropTypes.string,
};
