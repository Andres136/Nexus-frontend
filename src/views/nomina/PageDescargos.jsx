import { useState, useEffect, useMemo } from "react";
import {
  FileText, User, Building2, Calendar, ChevronDown,
  Printer, Send, CheckCircle, Search, ClipboardList,
} from "lucide-react";
import { contratacionService } from "../../services/nominaService";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtFecha(d) {
  if (!d) return "—";
  return new Date(d.slice(0, 10) + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

const TIPOS_DESCARGO = [
  "Llegada tarde reiterativa",
  "Retardo en regreso de almuerzo",
  "Ausencia injustificada",
  "Incumplimiento de funciones",
  "Comportamiento inapropiado",
  "Incumplimiento de normas de seguridad",
  "Otro",
];

function Campo({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PageDescargos() {
  const [empleados, setEmpleados]     = useState([]);
  const [loadingEmp, setLoadingEmp]   = useState(true);
  const [search, setSearch]           = useState("");
  const [showDrop, setShowDrop]       = useState(false);
  const [empleadoSel, setEmpleadoSel] = useState(null);
  const [contrato, setContrato]       = useState(null);
  const [loadingCnt, setLoadingCnt]   = useState(false);

  const [tipoDescargo, setTipoDescargo] = useState(TIPOS_DESCARGO[0]);
  const [fechaHecho, setFechaHecho]     = useState(new Date().toISOString().slice(0, 10));
  const [descargo, setDescargo]         = useState("");
  const [enviado, setEnviado]           = useState(false);
  const [enviando, setEnviando]         = useState(false);

  // Cargar empleados
  useEffect(() => {
    contratacionService.getEmpleados()
      .then((res) => setEmpleados(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingEmp(false));
  }, []);

  // Cargar contrato al seleccionar empleado
  useEffect(() => {
    if (!empleadoSel) { setContrato(null); return; }
    setLoadingCnt(true);
    contratacionService.getContrataciones({ user_id: empleadoSel.id, per_page: 1 })
      .then((res) => {
        const data = res.data?.data?.data ?? res.data?.data ?? [];
        setContrato(data[0] ?? null);
      })
      .catch(() => setContrato(null))
      .finally(() => setLoadingCnt(false));
  }, [empleadoSel]);

  const empFiltrados = useMemo(() =>
    empleados.filter((e) => e.name?.toLowerCase().includes(search.toLowerCase())),
    [empleados, search]
  );

  const handleEnviar = async () => {
    if (!empleadoSel || !descargo.trim()) return;
    setEnviando(true);
    await new Promise((r) => setTimeout(r, 1000));
    setEnviando(false);
    setEnviado(true);
  };

  const handleNuevo = () => {
    setEnviado(false);
    setEmpleadoSel(null);
    setContrato(null);
    setDescargo("");
    setTipoDescargo(TIPOS_DESCARGO[0]);
    setFechaHecho(new Date().toISOString().slice(0, 10));
  };

  if (enviado) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-14 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Descargo registrado</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              El descargo de <span className="font-medium text-gray-700">{empleadoSel?.name}</span> ha sido registrado correctamente.
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Printer className="h-4 w-4" /> Imprimir
            </button>
            <button onClick={handleNuevo}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
              <ClipboardList className="h-4 w-4" /> Nuevo descargo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Descargos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Registra la respuesta formal del empleado ante un llamado de atención.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Panel izquierdo — datos del documento */}
        <div className="lg:col-span-1 flex flex-col gap-4">

          {/* Selector empleado */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <Campo label="Empleado" icon={User}>
              <div className="relative">
                <button
                  onClick={() => setShowDrop((v) => !v)}
                  className="w-full flex items-center justify-between h-9 px-3 text-sm border border-gray-200 rounded-lg hover:border-indigo-400 transition-colors bg-white"
                >
                  <span className={empleadoSel ? "text-gray-800" : "text-gray-400"}>
                    {empleadoSel ? empleadoSel.name : "Seleccionar empleado"}
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
                      {loadingEmp ? (
                        <p className="text-xs text-gray-400 text-center py-4">Cargando...</p>
                      ) : empFiltrados.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">Sin resultados</p>
                      ) : empFiltrados.map((e) => (
                        <button key={e.id} onClick={() => { setEmpleadoSel(e); setShowDrop(false); setSearch(""); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Campo>
          </div>

          {/* Info contrato */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Datos del contrato</p>

            {loadingCnt ? (
              <p className="text-xs text-gray-400 animate-pulse">Cargando contrato...</p>
            ) : contrato ? (
              <>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Empresa</p>
                    <p className="text-sm font-medium text-gray-700">{contrato.empresa?.nombre ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cargo</p>
                    <p className="text-sm font-medium text-gray-700">{contrato.cargo ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Inicio contrato</p>
                    <p className="text-sm font-medium text-gray-700">{fmtFecha(contrato.inicio_contratacion)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tipo contrato</p>
                    <p className="text-sm font-medium text-gray-700">{contrato.tipoContrato?.nombre ?? "—"}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic">
                {empleadoSel ? "Sin contrato activo registrado." : "Selecciona un empleado."}
              </p>
            )}
          </div>
        </div>

        {/* Panel derecho — formulario descargo */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-5">

          <Campo label="Tipo de falta" icon={ClipboardList}>
            <div className="relative">
              <select value={tipoDescargo} onChange={(e) => setTipoDescargo(e.target.value)}
                className="w-full h-9 pl-3 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white">
                {TIPOS_DESCARGO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </Campo>

          <Campo label="Fecha del hecho" icon={Calendar}>
            <input type="date" value={fechaHecho} onChange={(e) => setFechaHecho(e.target.value)}
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" />
          </Campo>

          <Campo label="Descargo del empleado" icon={FileText}>
            <textarea rows={7} value={descargo} onChange={(e) => setDescargo(e.target.value)}
              placeholder="Escriba aquí la explicación o descargo del empleado ante la falta notificada..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-700 placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{descargo.length} caracteres</p>
          </Campo>

          {/* Preview del documento */}
          {empleadoSel && descargo.trim() && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vista previa</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold">{empleadoSel.name}</span>
                {contrato?.cargo ? `, ${contrato.cargo}` : ""} — descargo por{" "}
                <span className="italic">{tipoDescargo.toLowerCase()}</span> del{" "}
                {fmtFecha(fechaHecho)}.
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Printer className="h-4 w-4" /> Imprimir
            </button>
            <button
              onClick={handleEnviar}
              disabled={!empleadoSel || !descargo.trim() || enviando}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200">
              {enviando ? (
                <span className="animate-pulse">Registrando...</span>
              ) : (
                <><Send className="h-4 w-4" /> Registrar descargo</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
