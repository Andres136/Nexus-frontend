import { FileBadge, Receipt, Palmtree, AlarmClock, Baby, Stethoscope } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import PageDesprendibles from "./PageDesprendibles";
import PageCertificadoLaboral from "./PageCertificadoLaboral";
import PageVacaciones from "./PageVacaciones";
import PagePermisos from "./PagePermisos";
import PageLicencias from "./PageLicencias";
import PageIncapacidades from "./PageIncapacidades";

const TABS = [
  { id: "desprendibles",       label: "Desprendibles", icon: Receipt     },
  { id: "certificado-laboral", label: "Certificados",  icon: FileBadge   },
  { id: "vacaciones",          label: "Vacaciones",    icon: Palmtree    },
  { id: "permisos",            label: "Permisos",      icon: AlarmClock  },
  { id: "licencias",           label: "Licencias",     icon: Baby        },
  { id: "incapacidades",       label: "Incapacidades", icon: Stethoscope },
];

export default function PagePortalEmpleado() {
  useAuth({ middleware: "auth" });
  const [activeTab, setActiveTab] = useState("desprendibles");

  return (
    <div className="min-h-screen w-0 min-w-full max-w-full overflow-hidden bg-white">

      {/* Header */}
      <div className="bg-gray-50 px-4 pb-5 pt-8 sm:px-7 lg:px-7">
        <div className="mx-auto w-full max-w-none">
          <div
            className="relative h-[190px] w-full overflow-hidden rounded-md bg-slate-900 shadow-sm sm:h-[220px] lg:h-[240px]"
            aria-label="Portal del Empleado"
          >
            <img
              src="/images/portal_empleado.jpeg"
              alt="Portal del Empleado"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>

          <div className="mt-3 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex h-16 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md border px-3 text-sm font-semibold uppercase tracking-wide text-white/85 backdrop-blur-md transition-all duration-200 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:-translate-y-1/2 before:bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.85),transparent)] before:opacity-45 before:shadow-[0_0_14px_rgba(56,189,248,0.9)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_88%_18%,rgba(125,211,252,0.45),transparent_12%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%,rgba(56,189,248,0.12))] after:opacity-90 ${
                    isActive
                      ? "border-cyan-100/60 bg-[#062a58] shadow-[0_0_22px_rgba(56,189,248,0.35),inset_0_0_20px_rgba(56,189,248,0.16)]"
                      : "border-cyan-100/25 bg-[#041f45] shadow-[inset_0_0_16px_rgba(56,189,248,0.08)] hover:border-cyan-100/55 hover:bg-[#062a58] hover:text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.28),inset_0_0_18px_rgba(56,189,248,0.14)]"
                  }`}
                >
                  <Icon className="relative z-10 h-5 w-5 shrink-0 text-white/80 drop-shadow-[0_0_8px_rgba(125,211,252,0.85)]" strokeWidth={1.65} />
                  <span className="relative z-10 truncate text-white/80 drop-shadow-[0_0_8px_rgba(125,211,252,0.72)] group-hover:text-white/95">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido — portalMode indica que el backend filtra por Auth::id() */}
      <main className="w-0 min-w-full max-w-full overflow-hidden">
        {activeTab === "desprendibles"       && <PageDesprendibles portalMode />}
        {activeTab === "certificado-laboral" && <PageCertificadoLaboral portalMode />}
        {activeTab === "vacaciones"          && <PageVacaciones portalMode />}
        {activeTab === "permisos"            && <PagePermisos portalMode />}
        {activeTab === "licencias"           && <PageLicencias portalMode />}
        {activeTab === "incapacidades"       && <PageIncapacidades portalMode />}
      </main>
    </div>
  );
}
