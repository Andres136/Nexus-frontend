import { useState, useMemo } from "react";
import { useGetNominas } from "../../hooks/nomina/useGetNominas";
import { useGetNominaSummary } from "../../hooks/nomina/useGetNominaSummary";
import ModalLiquidarNomina from "../../components/nomina/ModalLiquidarNomina";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

function formatCOP(value) {
  if (!value && value !== 0) return "$ 0";
  return "$ " + Number(value).toLocaleString("es-CO");
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

function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function KpiCard({ label, value, sub, icon, valueColor = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
      <div className="ml-4 flex-shrink-0">{icon}</div>
    </div>
  );
}

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

export default function PageProcesarNomina() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth());
  const [anio, setAnio] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");

  const periodoInicio = useMemo(
    () => `${anio}-${String(mes + 1).padStart(2, "0")}-01`,
    [mes, anio]
  );
  const periodoFin = useMemo(() => {
    const ultimo = new Date(anio, mes + 1, 0).getDate();
    return `${anio}-${String(mes + 1).padStart(2, "0")}-${ultimo}`;
  }, [mes, anio]);

  const params = useMemo(
    () => ({ periodo_inicio: periodoInicio, periodo_fin: periodoFin, search: search || undefined, page, per_page: perPage }),
    [periodoInicio, periodoFin, search, page, perPage]
  );

  const summaryParams = useMemo(
    () => ({ periodo_inicio: periodoInicio, periodo_fin: periodoFin }),
    [periodoInicio, periodoFin]
  );

  const { nominas, isLoading } = useGetNominas(params);
  const { summary, isLoading: loadingSummary } = useGetNominaSummary(summaryParams);

  const lista = nominas?.data?.data ?? [];
  const meta = nominas?.data ?? null;

  const handleMes = (e) => { setMes(Number(e.target.value)); setPage(1); };
  const handleAnio = (e) => { setAnio(Number(e.target.value)); setPage(1); };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const TABS = [
    { id: "resumen", label: "Resumen de Nómina", icon: "📋" },
    { id: "historial", label: "Historial de Nóminas", icon: "🗂" },
    { id: "conceptos", label: "Conceptos", icon: "📑" },
    { id: "costos", label: "Centros de Costo", icon: "🏢" },
  ];

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nómina</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión y control de la nómina empresarial</p>
        </div>
        <div className="flex items-center gap-3">
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Procesar nómina
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
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

      {/* Tabs internos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 flex items-center gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "resumen" && (
          <>
            {/* Barra de búsqueda + filtros */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
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
                    className="pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
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
              <table className="min-w-full divide-y divide-gray-100 text-sm">
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
                    const nombre = item.empleado?.name ?? "—";
                    const cargo = item.contratacion?.tipo_contrato?.nombre
                      ?? item.contratacion?.tipoContrato?.nombre
                      ?? "—";
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
                              <p className="text-xs text-gray-400">
                                {item.empleado?.email ?? ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{cargo}</td>
                        <td className="px-4 py-3.5 text-right text-gray-700 font-medium">
                          {formatCOP(item.total_devengado)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-orange-600 font-medium">
                          {formatCOP(item.total_deducciones)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-green-600 font-semibold">
                          {formatCOP(item.salario_neto)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            Pendiente
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 transition-colors ml-auto text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <Pagination meta={meta} page={page} onPage={setPage} />
          </>
        )}

        {activeTab !== "resumen" && (
          <div className="py-20 text-center text-sm text-gray-400">
            Módulo próximamente disponible.
          </div>
        )}
      </div>

      {/* Modal liquidar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-8 animate-slide-in">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ModalLiquidarNomina onClose={() => setModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
