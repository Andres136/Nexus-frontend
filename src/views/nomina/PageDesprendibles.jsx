import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText, Download, Search, Calendar, ChevronDown, Loader2,
} from "lucide-react";
import { nominaService, portalEmpleadoService, contratacionService } from "../../services/nominaService";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

function fmtPesos(v) {
  return "$ " + Number(v ?? 0).toLocaleString("es-CO");
}

function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href    = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function PageDesprendibles() {
  const hoy  = new Date();
  const [empleados, setEmpleados] = useState([]);
  const [search, setSearch]       = useState("");
  const [showDrop, setShowDrop]   = useState(false);
  const [empSel, setEmpSel]       = useState(null);
  const [mes, setMes]             = useState(hoy.getMonth());
  const [anio, setAnio]           = useState(hoy.getFullYear());
  const [buscar, setBuscar]       = useState(false);
  const [descargando, setDescargando] = useState(null);

  useEffect(() => {
    contratacionService.getEmpleados()
      .then((r) => setEmpleados(r.data ?? []))
      .catch(() => {});
  }, []);

  const empFiltrados = empleados.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Rango del mes seleccionado
  const { periodoInicio, periodoFin } = useMemo(() => {
    const inicio = new Date(anio, mes, 1);
    const fin    = new Date(anio, mes + 1, 0);
    const fmt    = (d) => d.toISOString().slice(0, 10);
    return { periodoInicio: fmt(inicio), periodoFin: fmt(fin) };
  }, [mes, anio]);

  const { data: nominasData, isLoading, isFetching } = useQuery({
    queryKey: ["desprendibles", empSel?.id, periodoInicio, periodoFin, buscar],
    queryFn: () => nominaService.getNominas({
      user_id:  empSel?.id,
      per_page: 50,
    }),
    enabled: buscar && !!empSel,
    select: (r) => {
      const lista = r.data?.data?.data ?? r.data?.data ?? [];
      // Filtrar por período en el frontend (el servicio filtra por user_id)
      return lista.filter((n) => {
        const ini = n.periodo_inicio?.slice(0, 10) ?? "";
        const fin = n.periodo_fin?.slice(0, 10)    ?? "";
        return ini >= periodoInicio && fin <= periodoFin;
      });
    },
  });

  const nominas = nominasData ?? [];

  const handleBuscar = () => {
    if (!empSel) return;
    setBuscar(true);
  };

  const handleDescargar = async (nomina) => {
    setDescargando(nomina.uuid);
    try {
      const res = await portalEmpleadoService.desprendiblePdf(nomina.uuid);
      descargarBlob(res.data, `desprendible_${nomina.uuid}.pdf`);
    } catch {
      alert("Error al generar el PDF. Verifica que la nómina esté liquidada.");
    } finally {
      setDescargando(null);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Desprendibles de Pago</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Consulta y descarga los desprendibles de nómina por período.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <p className="text-sm font-medium text-gray-700 mb-4">Selecciona el período</p>
        <div className="flex flex-wrap gap-3">

          {/* Empleado dropdown */}
          <div className="relative flex-1 min-w-52">
            <button
              onClick={() => setShowDrop((v) => !v)}
              className="w-full flex items-center justify-between h-9 px-3 text-sm border border-gray-200 rounded-lg hover:border-indigo-400 bg-white transition-colors"
            >
              <span className={empSel ? "text-gray-800" : "text-gray-400"}>
                {empSel ? empSel.name : "Seleccionar empleado..."}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            </button>
            {showDrop && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input autoFocus type="text" placeholder="Buscar..." value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 h-7 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {empFiltrados.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">Sin resultados</p>
                  ) : empFiltrados.map((e) => (
                    <button key={e.id}
                      onClick={() => { setEmpSel(e); setShowDrop(false); setSearch(""); setBuscar(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mes */}
          <div className="relative">
            <select value={mes} onChange={(e) => { setMes(Number(e.target.value)); setBuscar(false); }}
              className="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white">
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Año */}
          <div className="relative">
            <select value={anio} onChange={(e) => { setAnio(Number(e.target.value)); setBuscar(false); }}
              className="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white">
              {[2024, 2025, 2026, 2027].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button onClick={handleBuscar} disabled={!empSel}
            className="h-9 px-5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            Buscar
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            {buscar && empSel
              ? `${empSel.name} — ${MESES[mes]} ${anio}`
              : "Selecciona un empleado y período"}
          </p>
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>

        {(isLoading || isFetching) ? (
          <div className="py-14 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Buscando nóminas...
          </div>
        ) : !buscar ? (
          <div className="py-14 text-center text-sm text-gray-400">
            Selecciona un empleado y haz clic en <span className="font-medium">Buscar</span>.
          </div>
        ) : nominas.length === 0 ? (
          <div className="py-14 text-center">
            <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              No hay nóminas liquidadas para {MESES[mes]} {anio}.
            </p>
          </div>
        ) : (
          nominas.map((n) => {
            const label = `${MESES[mes]} ${anio} — ${n.periodo_inicio?.slice(0,10)} al ${n.periodo_fin?.slice(0,10)}`;
            return (
              <div key={n.uuid}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 text-sm font-semibold">
                      {(n.empleado?.name ?? empSel?.name ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{n.empleado?.name ?? empSel?.name}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Neto a pagar</p>
                    <p className="text-sm font-semibold text-gray-800">{fmtPesos(n.salario_neto)}</p>
                  </div>
                  <button
                    onClick={() => handleDescargar(n)}
                    disabled={descargando === n.uuid}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 disabled:opacity-60 transition-colors"
                  >
                    {descargando === n.uuid
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Download className="h-3.5 w-3.5" />
                    }
                    {descargando === n.uuid ? "Generando..." : "Descargar PDF"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
