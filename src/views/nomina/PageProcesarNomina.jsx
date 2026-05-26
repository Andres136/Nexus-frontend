import { useState, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetNominas } from "../../hooks/nomina/useGetNominas";
import { useGetNominaSummary } from "../../hooks/nomina/useGetNominaSummary";
import { useGetContrataciones } from "../../hooks/nomina/useGetContrataciones";
import { useGetJornadaLaboral } from "../../hooks/nomina/useGetJornadaLaboral";
import ModalLiquidarNomina from "../../components/nomina/ModalLiquidarNomina";
import { nominaService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
const CENTROS_COSTO = ["Bogotá", "Cali", "Barranquilla", "Medellín", "Girardot"];

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

function normalizarTexto(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCentroCosto(item = {}) {
  if (item.centro_costo) return item.centro_costo;
  if (item.contratacion?.centro_costo) return item.contratacion.centro_costo;
  const sede = item.usuario?.sede?.nombre ?? item.empleado?.sede?.nombre ?? "";
  const empresa = item.empresa?.nombre ?? item.contratacion?.empresa?.nombre ?? "";
  const texto = normalizarTexto(`${sede} ${empresa}`);
  const centro = CENTROS_COSTO.find((nombre) => texto.includes(normalizarTexto(nombre)));
  return centro ?? "Sin sede";
}

function diasPeriodo(inicio, fin) {
  const desde = new Date(`${inicio}T00:00:00`);
  const hasta = new Date(`${fin}T00:00:00`);
  return Math.max(1, Math.round((hasta - desde) / 86400000) + 1);
}

function estimarNominaContrato(item = {}, periodoInicio, periodoFin) {
  const dias = Math.min(30, diasPeriodo(periodoInicio, periodoFin));
  const frecuencia = Number(item.pago_frecuencia ?? 30);
  const salarioPeriodo = (Number(item.base_salario ?? 0) / 30) * dias;
  const auxilioPeriodo = Number(item.auxilio_transporte ?? 0) * (dias / 30);
  const noSalarialBase = Number(item.no_salarial ?? 0);
  const noSalarialPeriodo = frecuencia === 15
    ? noSalarialBase * (dias > 15 ? 2 : 1)
    : noSalarialBase * (dias / 30);
  const deducciones = salarioPeriodo * 0.08;
  const devengado = salarioPeriodo + auxilioPeriodo + noSalarialPeriodo;

  return {
    devengado: Math.round(devengado),
    deducciones: Math.round(deducciones),
    neto: Math.round(devengado - deducciones),
  };
}

function buildNominaByUser(nominas = []) {
  return nominas.reduce((acc, nomina) => {
    if (nomina?.user_id && nomina.liquidada) acc[nomina.user_id] = nomina;
    return acc;
  }, {});
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
  const queryClient = useQueryClient();
  const [mes, setMes] = useState(now.getMonth());
  const [anio, setAnio] = useState(now.getFullYear());
  const [quincena, setQuincena] = useState("0");           // "0"=mes completo, "1"=primera, "2"=segunda
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [activeTab, setActiveTab] = useState("resumen");
  const [showLiquidarModal, setShowLiquidarModal] = useState(false);
  const [liquidarInitialData, setLiquidarInitialData] = useState({});
  const [openActions, setOpenActions] = useState(null);

  // ── Lote ───────────────────────────────────────────────────────────
  const [showBatch, setShowBatch] = useState(false);
  const [batchJornada, setBatchJornada] = useState("");
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResults, setBatchResults] = useState([]);

  const { jornadas } = useGetJornadaLaboral();
  const jornadasList = jornadas?.data?.data ?? [];

  const periodoInicio = useMemo(() => {
    if (quincena === "2") return `${anio}-${String(mes + 1).padStart(2, "0")}-16`;
    return `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
  }, [mes, anio, quincena]);
  const periodoFin = useMemo(() => {
    const m = String(mes + 1).padStart(2, "0");
    if (quincena === "1") return `${anio}-${m}-15`;
    const ultimo = new Date(anio, mes + 1, 0).getDate();
    return `${anio}-${m}-${ultimo}`;
  }, [mes, anio, quincena]);

  const nominaParams = useMemo(
    () => ({ periodo_inicio: periodoInicio, periodo_fin: periodoFin, search: search || undefined, page, per_page: perPage }),
    [periodoInicio, periodoFin, search, page, perPage]
  );

  const contratacionParams = useMemo(
    () => ({ search: search || undefined, page, per_page: perPage, status: 1 }),
    [search, page, perPage]
  );

  const summaryParams = useMemo(
    () => ({ periodo_inicio: periodoInicio, periodo_fin: periodoFin }),
    [periodoInicio, periodoFin]
  );

  const { nominas, isLoading: loadingNominas } = useGetNominas(nominaParams);
  const { contrataciones, isLoading } = useGetContrataciones(contratacionParams);
  const { summary, isLoading: loadingSummary } = useGetNominaSummary(summaryParams);

  const lista = contrataciones?.data?.data ?? [];
  const meta  = contrataciones?.data ?? null;
  const nominasLista = nominas?.data?.data ?? [];
  const nominaByUser = useMemo(() => buildNominaByUser(nominasLista), [nominasLista]);

  const conceptos = useMemo(() => {
    return nominasLista.reduce((acc, item) => {
      acc.salario += Number(item.salario_base_devengado ?? 0);
      acc.auxilio += Number(item.auxilio_transporte ?? 0);
      acc.extras += Number(item.valor_horas_extras_diurnas ?? 0)
        + Number(item.valor_horas_extras_nocturnas ?? 0)
        + Number(item.valor_horas_festivas ?? 0)
        + Number(item.valor_horas_nocturnas_festivas ?? 0);
      acc.salud += Number(item.deduccion_salud ?? 0);
      acc.pension += Number(item.deduccion_pension ?? 0);
      acc.descuentos += Number(item.total_descuentos_adicionales ?? 0);
      acc.devengado += Number(item.total_devengado ?? 0);
      acc.deducciones += Number(item.total_deducciones ?? 0);
      acc.neto += Number(item.salario_neto ?? 0);
      return acc;
    }, {
      salario: 0,
      auxilio: 0,
      extras: 0,
      salud: 0,
      pension: 0,
      descuentos: 0,
      devengado: 0,
      deducciones: 0,
      neto: 0,
    });
  }, [nominasLista]);

  const centrosCosto = useMemo(() => {
    const base = CENTROS_COSTO.reduce((acc, nombre) => {
      acc[nombre] = { nombre, empleados: 0, liquidados: 0, devengado: 0, deducciones: 0, neto: 0 };
      return acc;
    }, {});

    lista.forEach((contrato) => {
      const centro = getCentroCosto(contrato);
      if (!base[centro]) base[centro] = { nombre: centro, empleados: 0, liquidados: 0, devengado: 0, deducciones: 0, neto: 0 };
      const nomina = nominaByUser[contrato.users_id];
      base[centro].empleados += 1;
      if (nomina) {
        base[centro].liquidados += 1;
        base[centro].devengado += Number(nomina.total_devengado ?? 0);
        base[centro].deducciones += Number(nomina.total_deducciones ?? 0);
        base[centro].neto += Number(nomina.salario_neto ?? 0);
      }
    });

    return Object.values(base);
  }, [lista, nominaByUser]);

  const handleMes = (e) => { setMes(Number(e.target.value)); setPage(1); };
  const handleAnio = (e) => { setAnio(Number(e.target.value)); setPage(1); };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  // Liquidación en lote de todos los empleados pendientes
  const handleBatchLiquidar = useCallback(async () => {
    if (!batchJornada) { showToast("error", "Selecciona una jornada laboral."); return; }
    const pendientes = lista.filter((item) => !nominaByUser[item.users_id]);
    if (pendientes.length === 0) { showToast("success", "Todos los empleados ya están liquidados."); return; }

    setBatchRunning(true);
    setBatchResults([]);
    const results = [];

    for (const item of pendientes) {
      const nombre = item.usuario?.name ?? `Contrato #${item.id}`;
      try {
        const res = await nominaService.liquidar({
          user_id: item.users_id,
          jornada_laboral_id: Number(batchJornada),
          periodo_inicio: periodoInicio,
          periodo_fin: periodoFin,
        });
        results.push({
          nombre,
          status: "ok",
          neto: res.data.data?.salario_neto,
          advertencias: res.data.advertencias ?? [],
        });
      } catch (err) {
        results.push({
          nombre,
          status: "error",
          message: err.response?.data?.message ?? "Error al liquidar",
        });
      }
    }

    setBatchResults(results);
    setBatchRunning(false);
    queryClient.invalidateQueries(["nominas"]);
    queryClient.invalidateQueries(["nominaSummary"]);
    queryClient.invalidateQueries(["contrataciones"]);
  }, [batchJornada, lista, nominaByUser, periodoInicio, periodoFin, queryClient]);

  const periodoContrato = (item = {}) => {
    if (Number(item.pago_frecuencia) !== 15) {
      return { inicio: periodoInicio, fin: periodoFin };
    }

    const seleccionadoEsMesActual = mes === now.getMonth() && anio === now.getFullYear();
    const usaSegundaQuincena = seleccionadoEsMesActual && now.getDate() > 15;
    const mesTexto = String(mes + 1).padStart(2, "0");

    return {
      inicio: `${anio}-${mesTexto}-${usaSegundaQuincena ? "16" : "01"}`,
      fin: usaSegundaQuincena ? periodoFin : `${anio}-${mesTexto}-15`,
    };
  };

  const abrirLiquidacion = (item = {}) => {
    const periodo = periodoContrato(item);
    setLiquidarInitialData({
      user_id: item.users_id ? String(item.users_id) : "",
      periodo_inicio: periodo.inicio,
      periodo_fin: periodo.fin,
    });
    setShowLiquidarModal(true);
    setOpenActions(null);
  };

  const descargarDesprendible = async (nomina) => {
    if (!nomina?.uuid) {
      showToast("error", "Primero debes liquidar esta nómina.");
      return;
    }

    try {
      const response = await nominaService.desprendiblePdf(nomina.uuid);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `desprendible_${nomina.uuid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setOpenActions(null);
    } catch {
      showToast("error", "No se pudo descargar el desprendible.");
    }
  };

  const enviarDesprendible = async (nomina) => {
    if (!nomina?.uuid) {
      showToast("error", "Primero debes liquidar esta nómina.");
      return;
    }

    try {
      const response = await nominaService.enviarDesprendible(nomina.uuid);
      showToast("success", response.data?.message || "Desprendible enviado.");
      setOpenActions(null);
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo enviar el desprendible.");
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (uuid) => nominaService.deleteNomina(uuid),
    onSuccess: () => {
      showToast("success", "Nómina eliminada. Ya puedes re-liquidar el período.");
      queryClient.invalidateQueries(["nominas"]);
      queryClient.invalidateQueries(["nominaSummary"]);
      setOpenActions(null);
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo eliminar la nómina.");
    },
  });

  const eliminarNomina = (nomina) => {
    if (!nomina?.uuid) return;
    if (!window.confirm(`¿Eliminar la nómina de ${nomina.empleado?.name ?? "este empleado"}? No se puede deshacer.`)) return;
    deleteMutation.mutate(nomina.uuid);
  };

  const TABS = [
    { id: "resumen", label: "Resumen de Nómina", icon: "📋" },
    { id: "historial", label: "Historial de Nóminas", icon: "🗂" },
    { id: "conceptos", label: "Conceptos", icon: "📑" },
    { id: "costos", label: "Centros de Costo", icon: "🏢" },
  ];

  return (
    <div className="w-0 min-w-full max-w-full overflow-hidden box-border p-4 sm:p-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Nómina</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión y control de la nómina empresarial</p>
        </div>
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
              onChange={(e) => { setQuincena(e.target.value); setPage(1); }}
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
            onClick={() => { setShowBatch((v) => !v); setBatchResults([]); }}
            className="h-9 px-4 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Liquidar todos
          </button>
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
      {showBatch && (
        <div className="mb-6 bg-white rounded-xl border border-indigo-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-indigo-900">Liquidar todos los empleados pendientes</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Período: {periodoInicio} / {periodoFin} &nbsp;·&nbsp;
                {lista.filter((i) => !nominaByUser[i.users_id]).length} empleado(s) sin liquidar
              </p>
            </div>
            <button onClick={() => { setShowBatch(false); setBatchResults([]); }}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          </div>

          <div className="flex flex-wrap gap-3 items-end mb-4">
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
            <button
              onClick={handleBatchLiquidar}
              disabled={batchRunning || !batchJornada}
              className="h-9 px-5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {batchRunning ? "Procesando..." : "Iniciar liquidación"}
            </button>
          </div>

          {/* Resultados del lote */}
          {batchResults.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {batchResults.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm border ${
                  r.status === "ok" && r.advertencias?.length === 0
                    ? "bg-green-50 border-green-200"
                    : r.status === "ok"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
                }`}>
                  <span className="text-base leading-none mt-0.5">
                    {r.status === "ok" && r.advertencias?.length === 0 ? "✅" : r.status === "ok" ? "⚠️" : "❌"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{r.nombre}</p>
                    {r.status === "ok" ? (
                      <>
                        <p className="text-xs text-gray-500">Neto a pagar: {formatCOP(r.neto)}</p>
                        {r.advertencias?.map((adv, j) => (
                          <p key={j} className="text-xs text-amber-700 mt-0.5">{adv}</p>
                        ))}
                      </>
                    ) : (
                      <p className="text-xs text-red-600">{r.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs internos */}
      <div className="min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 flex min-w-0 items-center gap-0.5 overflow-x-auto">
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
              <div className="w-full max-w-full overflow-x-auto">
              <table className="min-w-[980px] divide-y divide-gray-100 text-sm">
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
                    const estimado  = estimarNominaContrato(item, periodoInicio, periodoFin);

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
                        <td className="px-4 py-3.5 text-right relative">
                          <button
                            type="button"
                            onClick={() => setOpenActions(openActions === item.uuid ? null : item.uuid)}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 transition-colors ml-auto text-gray-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                            </svg>
                          </button>
                          {openActions === item.uuid && (
                            <div className="absolute right-4 top-11 z-20 w-48 rounded-md border border-gray-200 bg-white shadow-lg text-left">
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
              <table className="min-w-[920px] divide-y divide-gray-100 text-sm">
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
            <table className="min-w-[760px] divide-y divide-gray-100 text-sm">
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
            <table className="min-w-[820px] divide-y divide-gray-100 text-sm">
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
