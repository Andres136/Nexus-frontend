import { FileText, FileBadge, Receipt, Palmtree, AlarmClock, Baby, Stethoscope } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import PageDesprendibles from "./PageDesprendibles";
import PageCertificadoLaboral from "./PageCertificadoLaboral";
import PageVacaciones from "./PageVacaciones";
import PagePermisos from "./PagePermisos";
import PageLicencias from "./PageLicencias";
import PageIncapacidades from "./PageIncapacidades";

const TABS = [
  { id: "desprendibles",       label: "Desprendibles",       icon: Receipt      },
  { id: "certificado-laboral", label: "Certificado Laboral", icon: FileBadge    },
  { id: "vacaciones",          label: "Vacaciones",          icon: Palmtree     },
  { id: "permisos",            label: "Permisos",            icon: AlarmClock   },
  { id: "licencias",           label: "Licencias",           icon: Baby         },
  { id: "incapacidades",       label: "Incapacidades",       icon: Stethoscope  },
];

export default function PagePortalEmpleado() {
  useAuth({ middleware: "auth" });
  const [activeTab, setActiveTab] = useState("desprendibles");

  return (
    <div className="min-h-screen w-0 min-w-full max-w-full overflow-hidden bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-800 leading-tight">
              Portal del Empleado
            </h1>
            <p className="text-xs text-gray-400">
              Documentos, certificados y solicitudes laborales
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 flex items-center gap-0.5 overflow-x-auto [scrollbar-width:thin]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-indigo-600" : "text-gray-400"}`} strokeWidth={2} />
                {tab.label}
              </button>
            );
          })}
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
