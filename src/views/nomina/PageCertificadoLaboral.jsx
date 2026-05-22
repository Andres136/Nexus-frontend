import { useState, useEffect } from "react";
import {
  FileBadge, Download, ChevronDown, Search, Loader2, Building2, User, Calendar,
} from "lucide-react";
import { contratacionService, portalEmpleadoService } from "../../services/nominaService";

function fmtFecha(d) {
  if (!d) return "—";
  return new Date(d.slice(0, 10) + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
  });
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

export default function PageCertificadoLaboral() {
  const [empleados, setEmpleados]   = useState([]);
  const [search, setSearch]         = useState("");
  const [showDrop, setShowDrop]     = useState(false);
  const [empSel, setEmpSel]         = useState(null);
  const [contrato, setContrato]     = useState(null);
  const [loadingCnt, setLoadingCnt] = useState(false);
  const [dirigidoA, setDirigidoA]   = useState("");
  const [descargando, setDescargando] = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    contratacionService.getEmpleados()
      .then((r) => setEmpleados(r.data ?? []))
      .catch(() => {});
  }, []);

  // Cargar contrato al seleccionar empleado
  useEffect(() => {
    if (!empSel) { setContrato(null); return; }
    setLoadingCnt(true);
    setError("");
    contratacionService.getContrataciones({ user_id: empSel.id, per_page: 1 })
      .then((res) => {
        const data = res.data?.data?.data ?? res.data?.data ?? [];
        setContrato(data[0] ?? null);
      })
      .catch(() => setContrato(null))
      .finally(() => setLoadingCnt(false));
  }, [empSel]);

  const empFiltrados = empleados.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDescargar = async () => {
    if (!contrato?.uuid) return;
    setDescargando(true);
    setError("");
    try {
      const res = await portalEmpleadoService.certificadoLaboralPdf(
        contrato.uuid,
        dirigidoA.trim()
      );
      descargarBlob(res.data, `certificado_${empSel.name.replace(/\s+/g, "_")}.pdf`);
    } catch {
      setError("Error al generar el certificado. Verifica que el empleado tenga contrato activo.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Certificado Laboral</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Genera y descarga el certificado laboral con el logo de la empresa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Panel izquierdo — selector + contrato */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Selector empleado */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <User className="h-3.5 w-3.5" /> Empleado
            </label>
            <div className="relative">
              <button onClick={() => setShowDrop((v) => !v)}
                className="w-full flex items-center justify-between h-9 px-3 text-sm border border-gray-200 rounded-lg hover:border-indigo-400 bg-white transition-colors">
                <span className={empSel ? "text-gray-800" : "text-gray-400"}>
                  {empSel ? empSel.name : "Seleccionar..."}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
                    {empFiltrados.map((e) => (
                      <button key={e.id}
                        onClick={() => { setEmpSel(e); setShowDrop(false); setSearch(""); setError(""); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        {e.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info contrato */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Datos del contrato</p>
            {loadingCnt ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando...
              </div>
            ) : contrato ? (
              <>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Empresa</p>
                    <p className="text-sm font-medium text-gray-700">{contrato.empresa?.nombre ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Cargo</p>
                    <p className="text-sm font-medium text-gray-700">{contrato.cargo ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Desde</p>
                    <p className="text-sm font-medium text-gray-700">{fmtFecha(contrato.inicio_contratacion)}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic">
                {empSel ? "Sin contrato activo." : "Selecciona un empleado."}
              </p>
            )}
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-5">

          {/* Dirigido a */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Dirigido a
            </label>
            <input type="text"
              placeholder="ej: Banco Colombia, A quien interese..."
              value={dirigidoA}
              onChange={(e) => setDirigidoA(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <p className="text-xs text-gray-400 mt-1">Puede dejarse en blanco para "A quien interese".</p>
          </div>

          {/* Preview */}
          {empSel && contrato && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3">
              <FileBadge className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-gray-800">{empSel.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {contrato.cargo ?? "—"} · {contrato.empresa?.nombre ?? "—"}
                </p>
                {dirigidoA && (
                  <p className="text-xs text-indigo-500 mt-0.5">Dirigido a: {dirigidoA}</p>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Botón */}
          <div className="mt-auto pt-2 border-t border-gray-100">
            <button
              onClick={handleDescargar}
              disabled={!empSel || !contrato || descargando}
              className="flex items-center justify-center gap-2 w-full h-10 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
            >
              {descargando ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generando PDF...</>
              ) : (
                <><Download className="h-4 w-4" /> Descargar Certificado PDF</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
