import { useState } from "react";
import {
  ReceiptText,
  FileText,
  Stethoscope,
  Clock,
  BarChart2,
  Settings,
  FileSignature,
  ShieldCheck,
  UserCheck,
  Percent,
  Timer,
  ClipboardList,
  Coins,
  ScanFace,
  CalendarCheck,
  AlarmClock,
  Palmtree,
  Monitor,
  FileBadge,
  AlertTriangle,
  FileWarning,
} from "lucide-react";

import PageProcesarNomina from "../views/nomina/PageProcesarNomina";
import PageContratos from "../views/nomina/PageContratos";
import PageSeguridadSocial from "../views/nomina/PageSeguridadSocial";
import PageTipoContrato from "../views/nomina/PageTipoContrato";
import PageDescuentos from "../views/nomina/PageDescuentos";
import PageJornadaLaboral from "../views/nomina/PageJornadaLaboral";
import PageIncapacidades from "../views/nomina/PageIncapacidades";
import PageValores from "../views/nomina/PageValores";
import PageTipoRegistros from "../views/nomina/PageTipoRegistros";
import PageWorkSessions from "../views/nomina/PageWorkSessions";
import PageKioscos from "../views/nomina/PageKioscos";
import PagePermisos from "../views/nomina/PagePermisos";
import PageVacaciones from "../views/nomina/PageVacaciones";
import PageHorasExtras from "../views/nomina/PageHorasExtras";
import PageReconocimientoFacial from "../views/nomina/PageReconocimientoFacial";
import PageDesprendibles from "../views/nomina/PageDesprendibles";
import PageCertificadoLaboral from "../views/nomina/PageCertificadoLaboral";
import PageLlamadosAtencion from "../views/nomina/PageLlamadosAtencion";
import PageDescargos from "../views/nomina/PageDescargos";
import PageConfiguracionNomina from "../views/nomina/PageConfiguracionNomina";

const NAV_ITEMS = [
  {
    id: "procesar",
    label: "Nómina",
    
    icon: ReceiptText,
    component: <PageProcesarNomina />,
  },
  {
    id: "contratacion",
    label: "Contratación",
    icon: FileSignature,
    tabs: [
      {
        id: "tipo-contrato",
        label: "Tipos de Contrato",
        icon: FileText,
        component: <PageTipoContrato />,
      },
      {
        id: "seguridad-social",
        label: "Seguridad Social",
        icon: ShieldCheck,
        component: <PageSeguridadSocial />,
      },
      {
        id: "contratos",
        label: "Contrataciones",
        icon: UserCheck,
        component: <PageContratos />,
      },
      {
        id: "descuentos",
        label: "Descuentos / Préstamos",
        icon: Percent,
        component: <PageDescuentos />,
      },
    ],
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    icon: CalendarCheck,
    tabs: [
      {
        id: "permisos",
        label: "Permisos",
        icon: AlarmClock,
        component: <PagePermisos />,
      },
      {
        id: "vacaciones",
        label: "Vacaciones",
        icon: Palmtree,
        component: <PageVacaciones />,
      },
      {
        id: "horas-extras",
        label: "Horas Extras",
        icon: Timer,
        component: <PageHorasExtras />,
      },
    ],
  },
  {
    id: "portal-empleado",
    label: "Portal del Empleado",
    icon: FileBadge,
    tabs: [
      {
        id: "desprendibles",
        label: "Desprendibles de Pago",
        icon: FileText,
        component: <PageDesprendibles />,
      },
      {
        id: "certificado-laboral",
        label: "Certificado Laboral",
        icon: FileText,
        component: <PageCertificadoLaboral />,
      },
    ],
  },
  {
    id: "incapacidades",
    label: "Incapacidades",
    icon: Stethoscope,
    component: <PageIncapacidades />,
  },
  {
    id: "asistencia",
    label: "Asistencia",
    icon: Clock,
    tabs: [
      {
        id: "jornada",
        label: "Jornada Laboral",
        icon: Timer,
        component: <PageJornadaLaboral />,
      },
      {
        id: "valores",
        label: "Valores de Horas",
        icon: Coins,
        component: <PageValores />,
      },
      {
        id: "tipo-registros",
        label: "Tipos de Registro",
        icon: ClipboardList,
        component: <PageTipoRegistros />,
      },
      {
        id: "kioscos",
        label: "Kioscos",
        icon: Monitor,
        component: <PageKioscos />,
      },
      {
        id: "work-sessions",
        label: "Registro de Asistencia",
        icon: ClipboardList,
        component: <PageWorkSessions />,
      },
      {
        id: "reconocimiento",
        label: "Reconocimiento Facial",
        icon: ScanFace,
        component: <PageReconocimientoFacial />,
      },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: BarChart2,
    tabs: [
      {
        id: "llamados",
        label: "Llamados de Atención",
        icon: AlertTriangle,
        component: <PageLlamadosAtencion />,
      },
      {
        id: "descargos",
        label: "Descargos",
        icon: FileWarning,
        component: <PageDescargos />,
      },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    component: <PageConfiguracionNomina />,
  },
];

export default function NominaLayout() {
  const [activeNav, setActiveNav] = useState("procesar");
  const [activeTab, setActiveTab] = useState({});

  const currentNav = NAV_ITEMS.find((n) => n.id === activeNav);
  const currentTabId = currentNav?.tabs
    ? (activeTab[activeNav] ?? currentNav.tabs[0].id)
    : null;
  const currentComponent = currentNav?.tabs
    ? currentNav.tabs.find((t) => t.id === currentTabId)?.component
    : currentNav?.component;

  const handleNavChange = (navId) => {
    setActiveNav(navId);
  };

  const handleTabChange = (tabId) => {
    setActiveTab((prev) => ({ ...prev, [activeNav]: tabId }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="px-6">
          <div className="flex items-center h-14 gap-0.5">
         

            {/* Nav items */}
            <div className="flex items-center gap-0.5 overflow-x-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`}
                      strokeWidth={2}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Sub-tabs */}
      {currentNav?.tabs && (
        <div className="bg-white border-b border-gray-100 px-6">
          <div className="flex items-center gap-0.5">
            {currentNav.tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = currentTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <TabIcon
                    className={`h-3.5 w-3.5 ${isActive ? "text-indigo-600" : "text-gray-400"}`}
                    strokeWidth={2}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <main>{currentComponent}</main>
    </div>
  );
}
