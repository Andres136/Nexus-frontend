import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
        link: "/auth/crm/nomina/procesar",
      },
      {
        id: "comisiones",
        label: "Comisiones",
        icon: Coins,
        link: "/auth/crm/nomina/comisiones",
      },
      {
        id: "liquidaciones-retiro",
        label: "Liquidaciones de Retiro",
        icon: UserMinus,
        link: "/auth/crm/nomina/liquidaciones-retiro",
      },
      {
        id: "prestaciones",
        label: "Prestaciones Sociales",
        icon: Landmark,
        link: "/auth/crm/nomina/prestaciones",
      },
      {
        id: "descuentos",
        label: "Descuentos / Préstamos",
        icon: Percent,
        link: "/auth/crm/nomina/descuentos",
      },
      {
        id: "retroactivos",
        label: "Novedades Retroactivas",
        icon: RefreshCcw,
        link: "/auth/crm/nomina/retroactivos",
      },
      {
        id: "control-contable",
        label: "Control Contable",
        icon: Landmark,
        link: "/auth/crm/nomina/control-contable",
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
        link: "/auth/crm/nomina/contratacion/contratos",
      },
      {
        id: "tipo-contrato",
        label: "Tipos de Contrato",
        icon: FileText,
        link: "/auth/crm/nomina/contratacion/tipo-contrato",
      },
      {
        id: "seguridad-social",
        label: "Seguridad Social",
        icon: ShieldCheck,
        link: "/auth/crm/nomina/contratacion/seguridad-social",
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
        link: "/auth/crm/nomina/solicitudes/permisos",
      },
      {
        id: "vacaciones",
        label: "Vacaciones",
        icon: Palmtree,
        link: "/auth/crm/nomina/solicitudes/vacaciones",
      },
      {
        id: "licencias",
        label: "Licencias",
        icon: Baby,
        link: "/auth/crm/nomina/solicitudes/licencias",
      },
        {
    id: "incapacidades",
    label: "Incapacidades",
    icon: Stethoscope,
    link: "/auth/crm/nomina/solicitudes/incapacidades",
  },
     {
        id: "horas-extras",
        label: "Horas Extras Operación",
        icon: Timer,
        link: "/auth/crm/nomina/solicitudes/horas-extras",
      },
    ],


  },


  {
    id: "asistencia",
    label: "Asistencia",
    icon: Clock,
    tabs: [
   {
        id: "work-sessions",
        label: "Registro de Asistencia",
        icon: ClipboardList,
        link: "/auth/crm/nomina/asistencia/work-sessions",
      },

      {
        id: "reconocimiento",
        label: "Reconocimiento Facial",
        icon: ScanFace,
        link: "/auth/crm/nomina/asistencia/reconocimiento",
      },
          {
        id: "acceso-temporal",
        label: "Acceso Temporal",
        icon: Clock,
        link: "/auth/crm/nomina/asistencia/acceso-temporal",
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
        link: "/auth/crm/nomina/jornada-laboral/jornada",
      },
      {
        id: "valores",
        label: "Valores de Horas",
        icon: Coins,
        link: "/auth/crm/nomina/jornada-laboral/valores",
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
        link: "/auth/crm/nomina/reportes/llamados",
      },
      {
        id: "descargos",
        label: "Descargos",
        icon: FileWarning,
        link: "/auth/crm/nomina/reportes/descargos",
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
        link: "/auth/crm/nomina/configuracion/parametros",
      },
   
    ],
  },
];

export default function NominaLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { totalPendientes, totalNominaPendientes, pendientesPorTab } = useSolicitudesPendientesCount();

  const isCurrentRoute = (link) => pathname === link || pathname.startsWith(`${link}/`);

  const currentNav = NAV_ITEMS.find((nav) =>
    nav.tabs?.some((tab) => isCurrentRoute(tab.link))
  ) ?? NAV_ITEMS[0];

  const currentTabId = currentNav?.tabs?.find((tab) => isCurrentRoute(tab.link))?.id
    ?? currentNav?.tabs?.[0]?.id
    ?? null;

  const handleNavChange = (item) => {
    const firstTabLink = item.tabs?.[0]?.link;
    if (firstTabLink) navigate(firstTabLink);
  };

  const handleTabChange = (tab) => {
    if (tab.link) navigate(tab.link);
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
              const isActive = currentNav?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavChange(item)}
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
              const pendientesTab = ["solicitudes", "procesar"].includes(currentNav.id) ? (pendientesPorTab[tab.id] ?? 0) : 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab)}
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
      <main className="w-0 min-w-full max-w-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
