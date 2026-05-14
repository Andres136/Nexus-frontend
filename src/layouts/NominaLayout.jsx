import { useState } from "react";
import PageProcesarNomina from "../views/nomina/PageProcesarNomina";
import PageContratos from "../views/nomina/PageContratos";
import PageSeguridadSocial from "../views/nomina/PageSeguridadSocial";
import PageTipoContrato from "../views/nomina/PageTipoContrato";
import PageDescuentos from "../views/nomina/PageDescuentos";
import PageJornadaLaboral from "../views/nomina/PageJornadaLaboral";
import PageIncapacidades from "../views/nomina/PageIncapacidades";
import PageValores from "../views/nomina/PageValores";
import PageTipoRegistros from "../views/nomina/PageTipoRegistros";

const NAV_ITEMS = [
  {
    id: "procesar",
    label: "Procesar Nómina",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    tabs: null,
    component: <PageProcesarNomina />,
  },
  {
    id: "empleados",
    label: "Empleados",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tabs: null,
    component: <PageContratos />,
  },
  {
    id: "desprendibles",
    label: "Desprendibles",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    tabs: [
      { id: "descuentos", label: "Descuentos", component: <PageDescuentos /> },
      { id: "valores", label: "Valores", component: <PageValores /> },
    ],
  },
  {
    id: "incapacidades",
    label: "Incapacidades",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    tabs: null,
    component: <PageIncapacidades />,
  },
  {
    id: "asistencia",
    label: "Asistencia",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    tabs: [
      { id: "jornada", label: "Jornada Laboral", component: <PageJornadaLaboral /> },
      { id: "tipo-registros", label: "Tipos de Registro", component: <PageTipoRegistros /> },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    tabs: null,
    component: <ReportesPlaceholder />,
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tabs: [
      { id: "tipo-contrato", label: "Tipos de Contrato", component: <PageTipoContrato /> },
      { id: "seguridad-social", label: "Seguridad Social", component: <PageSeguridadSocial /> },
    ],
  },
];


function ReportesPlaceholder() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Reportes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Informes y estadísticas de nómina.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm text-gray-400">Módulo de reportes próximamente.</p>
      </div>
    </div>
  );
}

export default function NominaLayout() {
  const [activeNav, setActiveNav] = useState("procesar");
  const [activeTab, setActiveTab] = useState({});

  const currentNav = NAV_ITEMS.find((n) => n.id === activeNav);
  const currentTab = currentNav?.tabs
    ? activeTab[activeNav] ?? currentNav.tabs[0].id
    : null;
  const currentComponent = currentNav?.tabs
    ? currentNav.tabs.find((t) => t.id === currentTab)?.component
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
          <div className="flex items-center h-14 gap-1">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2 mr-6">
              <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-800">Nómina</span>
            </div>

            {/* Nav Items */}
            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    activeNav === item.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className={activeNav === item.id ? "text-indigo-600" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Sub-tabs (if section has multiple tabs) */}
      {currentNav?.tabs && (
        <div className="bg-white border-b border-gray-100 px-6">
          <div className="flex items-center gap-0.5">
            {currentNav.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  currentTab === tab.id
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page Content */}
      <main>{currentComponent}</main>
    </div>
  );
}
