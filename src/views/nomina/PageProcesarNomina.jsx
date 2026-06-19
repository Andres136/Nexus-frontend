import { useState } from "react";
import PropTypes from "prop-types";
import ModalLiquidarNomina from "../../components/nomina/ModalLiquidarNomina";
import { CENTROS_COSTO, useProcesarNomina } from "../../hooks/nomina/useProcesarNomina";
import { Building2, Download, History, LayoutDashboard, ReceiptText } from "lucide-react";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
function formatCOP(value) {
  if (!value && value !== 0) return "$ 0";
  return "$ " + Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-yellow-100 text-yellow-700",
  "bg-red-100 text-red-700",
];

const ACTION_MENU_HEIGHT = 164;
const ACTION_MENU_GAP = 6;

function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function KpiCard({ label, value, sub, icon, valueColor = "text-gray-900" }) {
  return (
    <div className="min-w-0 bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <p className={`text-xl font-bold break-words ${valueColor}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
      <div className="ml-4 flex-shrink-0">{icon}</div>
    </div>
  );
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  sub: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  valueColor: PropTypes.string,
};

function Pagination({ meta, page, onPage }) {
  if (!meta || meta.last_page <= 1) return null;
  const pages = [];
  const total = meta.last_page;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
    if (page < total - 2) pages.push("...");
    pages.push(total);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Mostrando {meta.from ?? 0} a {meta.to ?? 0} de {meta.total} registros
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white border border-indigo-600"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === total}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
        >
          ›
        </button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  meta: PropTypes.shape({
    last_page: PropTypes.number,
    from: PropTypes.number,
    to: PropTypes.number,
    total: PropTypes.number,
  }),
  page: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
};

export default function PageProcesarNomina() {
  const [actionMenuPosition, setActionMenuPosition] = useState(null);
  const {
    mes, anio, quincena, search, page, setPage, activeTab, setActiveTab,
    showLiquidarModal, setShowLiquidarModal, liquidarInitialData,
    openActions, setOpenActions, batchJornada, setBatchJornada,
    batchEmpresa, setBatchEmpresa, batchPeriodoInicio, setBatchPeriodoInicio,
    batchPeriodoFin, setBatchPeriodoFin, batchInicioSeleccionado, batchFinSeleccionado,
    batchRunning,
    jornadasList, empresasList, periodoInicio, periodoFin,
    lista, meta, nominasLista, nominaByUser, conceptos, centrosCosto,
    summary, isLoading, loadingNominas, loadingSummary, deleteMutation, exportandoPlano,
    handleMes, handleAnio, handleQuincena, handleSearch,
    handleBatchLiquidar, abrirLiquidacion, descargarDesprendible,
    enviarDesprendible, descargarArchivoPlano, eliminarNomina, estimarNominaContrato,
  } = useProcesarNomina();

  const TABS = [
    { id: "resumen", label: "Resumen de Nómina", icon: LayoutDashboard },
    { id: "historial", label: "Historial de Nóminas", icon: History },
    { id: "conceptos", label: "Conceptos", icon: ReceiptText },
    { id: "costos", label: "Centros de Costo", icon: Building2 },
  ];

  const toggleActionMenu = (event, uuid) => {
    if (openActions === uuid) {
      setOpenActions(null);
      setActionMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setOpenActions(uuid);
    const opensDown = rect.bottom + ACTION_MENU_GAP + ACTION_MENU_HEIGHT <= window.innerHeight;

    setActionMenuPosition({
      top: opensDown
        ? rect.bottom + ACTION_MENU_GAP
        : Math.max(ACTION_MENU_GAP, rect.top - ACTION_MENU_HEIGHT - ACTION_MENU_GAP),
      right: window.innerWidth - rect.right,
    });
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden box-border p-4 sm:p-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
      
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de período */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-white px-3 h-9 shadow-sm">
            <select
              value={mes}
              onChange={handleMes}
              className="text-sm text-gray-700 bg-transparent border-none outline-none pr-1 cursor-pointer"
            >
              {MESES.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={anio}
              onChange={handleAnio}
              className="text-sm text-gray-700 bg-transparent border-none outline-none cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={quincena}
              onChange={handleQuincena}
              className="text-sm text-gray-700 bg-transparent border-none outline-none cursor-pointer ml-1"
            >
              <option value="0">Mes completo</option>
              <option value="1">1ª quincena</option>
              <option value="2">2ª quincena</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <button
            type="button"
            onClick={() => abrirLiquidacion()}
            className="h-9 px-4 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Liquidar Nómina
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4 mb-6">
        <KpiCard
          label="Empleados Activos"
          value={loadingSummary ? "—" : (summary?.empleados_activos ?? 0)}
          sub="Total empleados"
          icon={
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          }
        />
        <KpiCard
          label="Nómina Bruta"
          value={loadingSummary ? "—" : formatCOP(summary?.nomina_bruta)}
          sub="Total devengado"
          valueColor="text-gray-900"
          icon={
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          }
        />
        <KpiCard
          label="Deducciones"
          value={loadingSummary ? "—" : formatCOP(summary?.deducciones)}
          sub="Total deducciones"
          valueColor="text-orange-600"
          icon={
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          }
        />
        <KpiCard
          label="Nómina Neta"
          value={loadingSummary ? "—" : formatCOP(summary?.nomina_neta)}
          sub="Total a pagar"
          valueColor="text-green-600"
          icon={
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          }
        />
        <KpiCard
          label="Pagos Realizados"
          value={loadingSummary ? "—" : formatCOP(summary?.pagos_realizados)}
          sub="Este período"
          valueColor={summary?.pagos_realizados > 0 ? "text-green-600" : "text-red-500"}
          icon={
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          }
        />
      </div>

      {/* Panel de liquidación en lote */}
        <div className="mb-6 bg-white rounded-xl border border-indigo-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-indigo-900">Liquidación masiva por empresa</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Liquida empleados pendientes y descarga el archivo plano con los mismos filtros.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
              <input
                type="date"
                value={batchInicioSeleccionado}
                onChange={(e) => setBatchPeriodoInicio(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
              <input
                type="date"
                value={batchFinSeleccionado}
                onChange={(e) => setBatchPeriodoFin(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Jornada laboral</label>
              <select
                value={batchJornada}
                onChange={(e) => setBatchJornada(e.target.value)}
                className="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar jornada...</option>
                {jornadasList.map((j) => (
                  <option key={j.id} value={j.id}>{j.nombre} · {j.horas_semanales} h/sem</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Empresa</label>
              <select
                value={batchEmpresa}
                onChange={(e) => setBatchEmpresa(e.target.value)}
                className="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[190px]"
              >
                <option value="">Todas las empresas</option>
                {empresasList.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleBatchLiquidar}
              disabled={batchRunning || !batchJornada || !batchInicioSeleccionado || !batchFinSeleccionado}
              className="h-9 px-5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {batchRunning ? "Procesando..." : "Liquidar y generar plano"}
            </button>
            <button
              type="button"
              onClick={descargarArchivoPlano}
              disabled={exportandoPlano || !batchInicioSeleccionado || !batchFinSeleccionado}
              className="h-9 px-4 inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {exportandoPlano ? "Preparando..." : "Descargar archivo plano"}
            </button>
          </div>

        </div>

      {/* Tabs internos */}
      <div className="min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
        <div className="border-b border-gray-100 px-4 flex min-w-0 items-center gap-0.5 overflow-x-auto">

{TABS.map((tab) => {
  const Icon = tab.icon;

  return (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        activeTab === tab.id
          ? "border-indigo-600 text-indigo-700"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon size={18} strokeWidth={2} />
      <span>{tab.label}</span>
    </button>
  );
})}
        </div>

        {activeTab === "resumen" && (
          <>
            {/* Barra de búsqueda + filtros */}
            <div className="flex flex-col gap-3 px-4 py-4 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Resumen de Nómina — {MESES[mes]} {anio}
                </h3>
                {meta?.total != null && (
                  <p className="text-xs text-gray-400 mt-0.5">{meta.total} registros encontrados</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearch}
                    placeholder="Buscar empleado..."
                    className="pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
                  />
                </div>
                <button className="flex items-center gap-1.5 h-9 px-3 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filtros
                </button>
              </div>
            </div>

            {/* Tabla */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20 text-sm text-gray-400">
                <svg className="animate-spin h-5 w-5 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Cargando...
              </div>
            ) : lista.length === 0 ? (
              <div className="text-center py-20 text-sm text-gray-400">
                No hay nóminas procesadas para este período.
              </div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto overflow-y-visible">
              <table className="w-full min-w-[980px] divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Devengado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deducciones</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Neto a Pagar</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {lista.map((item) => {
                    const nombre    = item.usuario?.name ?? "—";
                    const cargo     = item.cargo ?? "—";
                    const tipoDoc   = item.tipo_documento ?? "CC";
                    const numDoc    = item.numero_documento ?? "";
                    const estimado  = estimarNominaContrato(item);

                    // ¿ya tiene nómina liquidada en este período?
                    const nominaExiste = nominaByUser[item.users_id];

                    return (
                      <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                          #{item.id}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(nombre)}`}>
                              {getInitials(nombre)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{nombre}</p>
                              <p className="text-xs text-gray-400">{tipoDoc} {numDoc}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{cargo}</td>
                        <td className="px-4 py-3.5 text-right text-gray-700 font-medium">
                          {nominaExiste ? formatCOP(nominaExiste.total_devengado) : formatCOP(estimado.devengado)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-orange-600 font-medium">
                          {nominaExiste ? formatCOP(nominaExiste.total_deducciones) : formatCOP(estimado.deducciones)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-green-600 font-semibold">
                          {nominaExiste ? formatCOP(nominaExiste.salario_neto) : formatCOP(estimado.neto)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {nominaExiste ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Liquidado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={(event) => toggleActionMenu(event, item.uuid)}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 transition-colors ml-auto text-gray-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                            </svg>
                          </button>
                          {openActions === item.uuid && actionMenuPosition && (
                            <div
                              className="fixed z-[9999] w-48 rounded-md border border-gray-200 bg-white shadow-xl text-left"
                              style={{
                                top: `${actionMenuPosition.top}px`,
                                right: `${actionMenuPosition.right}px`,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => abrirLiquidacion(item)}
                                className="block w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
                                disabled={Boolean(nominaExiste)}
                              >
                                Liquidar período
                              </button>
                              <button
                                type="button"
                                onClick={() => descargarDesprendible(nominaExiste)}
                                className="block w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
                                disabled={!nominaExiste}
                              >
                                Descargar desprendible
                              </button>
                              <button
                                type="button"
                                onClick={() => enviarDesprendible(nominaExiste)}
                                className="block w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
                                disabled={!nominaExiste}
                              >
                                Enviar por correo
                              </button>
                              {nominaExiste && (
                                <button
                                  type="button"
                                  onClick={() => eliminarNomina(nominaExiste)}
                                  disabled={deleteMutation.isPending}
                                  className="block w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 disabled:opacity-50"
                                >
                                  Eliminar nómina
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}

            <Pagination meta={meta} page={page} onPage={setPage} />
          </>
        )}

        {activeTab === "historial" && (
          <>
            <div className="flex flex-col gap-3 px-4 py-4 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Historial de Nóminas — {MESES[mes]} {anio}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{nominasLista.length} liquidaciones encontradas</p>
              </div>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar historial..."
                  className="pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
                />
              </div>
            </div>

            {loadingNominas ? (
              <div className="flex justify-center items-center py-20 text-sm text-gray-400">Cargando historial...</div>
            ) : nominasLista.length === 0 ? (
              <div className="text-center py-20 text-sm text-gray-400">No hay nóminas liquidadas para este período.</div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-[920px] divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Devengado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deducciones</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Neto</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {nominasLista.map((item) => (
                    <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">#{item.id}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-800">{item.empleado?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{item.contratacion?.cargo ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {item.periodo_inicio} / {item.periodo_fin}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-gray-700">{formatCOP(item.total_devengado)}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-orange-600">{formatCOP(item.total_deducciones)}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-green-600">{formatCOP(item.salario_neto)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => descargarDesprendible(item)}
                            className="h-8 px-3 rounded-md border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Descargar
                          </button>
                          <button
                            type="button"
                            onClick={() => enviarDesprendible(item)}
                            className="h-8 px-3 rounded-md border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                          >
                            Enviar
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarNomina(item)}
                            disabled={deleteMutation.isPending}
                            className="h-8 px-3 rounded-md border border-red-200 bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </>
        )}

        {activeTab === "conceptos" && (
          <>
            <div className="px-4 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">
                Conceptos — {MESES[mes]} {anio}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Resumen de devengados y deducciones liquidadas</p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 border-b border-gray-100 md:grid-cols-3">
              <KpiCard label="Total Devengado" value={formatCOP(conceptos.devengado)} sub="Ingresos del período" valueColor="text-gray-900" icon={<span className="text-xl">+</span>} />
              <KpiCard label="Total Deducciones" value={formatCOP(conceptos.deducciones)} sub="Descuentos del período" valueColor="text-orange-600" icon={<span className="text-xl">−</span>} />
              <KpiCard label="Neto Pagado" value={formatCOP(conceptos.neto)} sub="Valor final a pagar" valueColor="text-green-600" icon={<span className="text-xl">=</span>} />
            </div>

            <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full min-w-[760px] divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {[
                  ["Devengado", "Salario base", conceptos.salario],
                  ["Devengado", "Auxilio de transporte", conceptos.auxilio],
                  ["Devengado", "Comisiones", conceptos.comisiones],
                  ["Devengado", "Horas extras / recargos", conceptos.extras],
                  ["Deducción", "Salud empleado", conceptos.salud],
                  ["Deducción", "Pensión empleado", conceptos.pension],
                  ["Deducción", "Descuentos y permisos no remunerados", conceptos.descuentos],
                ].map(([tipo, nombre, valor]) => (
                  <tr key={`${tipo}-${nombre}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tipo === "Devengado" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">{nombre}</td>
                    <td className={`px-4 py-3.5 text-right font-semibold ${
                      tipo === "Devengado" ? "text-green-600" : "text-orange-600"
                    }`}>
                      {formatCOP(valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}

        {activeTab === "costos" && (
          <>
            <div className="px-4 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">
                Centros de Costo — {MESES[mes]} {anio}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Distribución por sedes: Bogotá, Cali, Barranquilla, Medellín y Girardot</p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 border-b border-gray-100 sm:grid-cols-2 xl:grid-cols-4">
              {centrosCosto
                .filter((centro) => CENTROS_COSTO.includes(centro.nombre))
                .map((centro) => (
                  <div key={centro.nombre} className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{centro.nombre}</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">{formatCOP(centro.neto)}</p>
                    <p className="text-xs text-gray-400 mt-1">{centro.liquidados} liquidados de {centro.empleados} empleados</p>
                  </div>
                ))}
            </div>

            <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full min-w-[820px] divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sede</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Empleados</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Liquidados</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Devengado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deducciones</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Neto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {centrosCosto.map((centro) => (
                  <tr key={centro.nombre} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">{centro.nombre}</td>
                    <td className="px-4 py-3.5 text-right text-gray-600">{centro.empleados}</td>
                    <td className="px-4 py-3.5 text-right text-gray-600">{centro.liquidados}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-700">{formatCOP(centro.devengado)}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-orange-600">{formatCOP(centro.deducciones)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-green-600">{formatCOP(centro.neto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      {showLiquidarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <ModalLiquidarNomina
              onClose={() => setShowLiquidarModal(false)}
              initialData={liquidarInitialData}
            />
          </div>
        </div>
      )}

    </div>
  );
}
