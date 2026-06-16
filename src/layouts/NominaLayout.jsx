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
  AlertTriangle,
  FileWarning,
  Baby,
  RefreshCcw,
  Landmark,
  UserMinus,
} from "lucide-react";

import PageProcesarNomina from "../views/nomina/PageProcesarNomina";
import PageContratos from "../views/nomina/PageContratos";
import PageSeguridadSocial from "../views/nomina/PageSeguridadSocial";
import PageTipoContrato from "../views/nomina/PageTipoContrato";
import PageDescuentos from "../views/nomina/PageDescuentos";
import PageJornadaLaboral from "../views/nomina/PageJornadaLaboral";
import PageIncapacidades from "../views/nomina/PageIncapacidades";
import PageValores from "../views/nomina/PageValores";

import PageWorkSessions from "../views/nomina/PageWorkSessions";
import PagePermisos from "../views/nomina/PagePermisos";
import PageVacaciones from "../views/nomina/PageVacaciones";
import PageLicencias from "../views/nomina/PageLicencias";
import PageHorasExtras from "../views/nomina/PageHorasExtras";
import PageReconocimientoFacial from "../views/nomina/PageReconocimientoFacial";

import PageLlamadosAtencion from "../views/nomina/PageLlamadosAtencion";
import PageDescargos from "../views/nomina/PageDescargos";
import PageConfiguracionNomina from "../views/nomina/PageConfiguracionNomina";
import PageNovedadesRetroactivas from "../views/nomina/PageNovedadesRetroactivas";
import PageControlContableNomina from "../views/nomina/PageControlContableNomina";
import PageComisiones from "../views/nomina/PageComisiones";
import PageLiquidacionesRetiro from "../views/nomina/PageLiquidacionesRetiro";
import PageLiquidacionesPrestaciones from "../views/nomina/PageLiquidacionesPrestaciones";
import BtnAccesoTemporalKiosko from "../components/nomina/BtnAccesoTemporalKiosko";
import { useSolicitudesPendientesCount } from "../hooks/nomina/useSolicitudesPendientesCount";

const NAV_ITEMS = [
  {
    id: "procesar",
    label: "Nómina",
    icon: ReceiptText,
    tabs: [
      {
        id: "liquidacion",
        label: "Liquidación",
        icon: ReceiptText,
        component: <PageProcesarNomina />,
      },
      {
        id: "comisiones",
        label: "Comisiones",
        icon: Coins,
        component: <PageComisiones />,
      },
      {
        id: "liquidaciones-retiro",
        label: "Liquidaciones de Retiro",
        icon: UserMinus,
        component: <PageLiquidacionesRetiro />,
      },
      {
        id: "prestaciones",
        label: "Prestaciones Sociales",
        icon: Landmark,
        component: <PageLiquidacionesPrestaciones />,
      },
      {
        id: "descuentos",
        label: "Descuentos / Préstamos",
        icon: Percent,
        component: <PageDescuentos />,
      },
      {
        id: "retroactivos",
        label: "Novedades Retroactivas",
        icon: RefreshCcw,
        component: <PageNovedadesRetroactivas />,
      },
      {
        id: "control-contable",
        label: "Control Contable",
        icon: Landmark,
        component: <PageControlContableNomina />,
      },
    ],
  },
  {
    id: "contratacion",
    label: "Contratación",
    icon: FileSignature,
    tabs: [
         {
        id: "contratos",
        label: "Contrataciones",
        icon: UserCheck,
        component: <PageContratos />,
      },
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
        id: "licencias",
        label: "Licencias",
        icon: Baby,
        component: <PageLicencias />,
      },
        {
    id: "incapacidades",
    label: "Incapacidades",
    icon: Stethoscope,
    component: <PageIncapacidades />,
  },
     {
        id: "horas-extras",
        label: "Horas Extras Operación",
        icon: Timer,
        component: <PageHorasExtras />,
      },
    ],

    
  },


  {
    id: "asistencia",
    label: "Asistencia",
    icon: Clock,
    tabs: [
 
      {
        id: "acceso-temporal",
        label: "Acceso Temporal",
        icon: Clock,
        component: <BtnAccesoTemporalKiosko />,
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
    id: "jornada-laboral",
    label: "Jornada Laboral",
    icon: Timer,
    tabs: [
      {
        id: "jornada",
        label: "Jornadas",
        icon: Timer,
        component: <PageJornadaLaboral />,
      },
      {
        id: "valores",
        label: "Valores de Horas",
        icon: Coins,
        component: <PageValores />,
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
    tabs: [
      {
        id: "parametros",
        label: "Parámetros",
        icon: Settings,
        component: <PageConfiguracionNomina />,
      },
   
    ],
  },
];

export default function NominaLayout() {
  const [activeNav, setActiveNav] = useState("procesar");
  const [activeTab, setActiveTab] = useState({});
  const { totalPendientes, totalNominaPendientes, pendientesPorTab } = useSolicitudesPendientesCount();

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

  const formatBadge = (count) => (count > 99 ? "99+" : count);

  return (
    <div className="min-h-screen w-0 min-w-full max-w-full overflow-hidden bg-white">
      <div className="bg-gray-50 px-4 pb-5 pt-8 sm:px-7 lg:px-7">
        <div className="mx-auto w-full max-w-none">
          <div
            className="relative h-[190px] w-full overflow-hidden rounded-md bg-slate-900 shadow-sm sm:h-[220px] lg:h-[240px]"
            aria-label="Nómina"
          >
            <img
              src="/images/Nomina.png"
              alt="Nómina"
              className="absolute inset-0 h-full w-full object-cover object-[center_32%]"
            />
          </div>

          <nav className="mt-3 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-[repeat(7,minmax(0,1fr))]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavChange(item.id)}
                  className={`group relative flex h-16 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md border px-3 text-sm font-semibold uppercase tracking-wide text-white/85 backdrop-blur-md transition-all duration-200 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:-translate-y-1/2 before:bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.85),transparent)] before:opacity-45 before:shadow-[0_0_14px_rgba(56,189,248,0.9)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_88%_18%,rgba(125,211,252,0.45),transparent_12%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%,rgba(56,189,248,0.12))] after:opacity-90 ${
                    isActive
                      ? "border-cyan-100/60 bg-[#062a58] shadow-[0_0_22px_rgba(56,189,248,0.35),inset_0_0_20px_rgba(56,189,248,0.16)]"
                      : "border-cyan-100/25 bg-[#041f45] shadow-[inset_0_0_16px_rgba(56,189,248,0.08)] hover:border-cyan-100/55 hover:bg-[#062a58] hover:text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.28),inset_0_0_18px_rgba(56,189,248,0.14)]"
                  }`}
                >
                  {item.id === "solicitudes" && totalPendientes > 0 && (
                    <span className="absolute right-2 top-2 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(220,38,38,0.45)] ring-2 ring-white">
                      {formatBadge(totalPendientes)}
                    </span>
                  )}
                  {item.id === "procesar" && totalNominaPendientes > 0 && (
                    <span className="absolute right-2 top-2 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(220,38,38,0.45)] ring-2 ring-white">
                      {formatBadge(totalNominaPendientes)}
                    </span>
                  )}
                  <Icon className="relative z-10 h-5 w-5 shrink-0 text-white/80 drop-shadow-[0_0_8px_rgba(125,211,252,0.85)]" strokeWidth={1.65} />
                  <span className="relative z-10 truncate text-white/80 drop-shadow-[0_0_8px_rgba(125,211,252,0.72)] group-hover:text-white/95">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sub-tabs */}
      {currentNav?.tabs && (
        <div className="w-full min-w-0 max-w-full overflow-hidden bg-white border-b border-gray-100 px-4 sm:px-6 box-border">
          <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
            {currentNav.tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = currentTabId === tab.id;
              const pendientesTab = ["solicitudes", "procesar"].includes(activeNav) ? (pendientesPorTab[tab.id] ?? 0) : 0;
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
                  <span>{tab.label}</span>
                  {pendientesTab > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                      {formatBadge(pendientesTab)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="w-0 min-w-full max-w-full overflow-hidden">{currentComponent}</main>
    </div>
  );
}
