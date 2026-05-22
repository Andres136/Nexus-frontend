import { useState, useEffect } from "react";
import {
  FileBadge, Download, ChevronDown, Search, Loader2, Building2, User, Calendar, Send,
} from "lucide-react";
import { contratacionService, portalEmpleadoService } from "../../services/nominaService";
import { useAuth } from "../../hooks/useAuth";

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
  const { user } = useAuth({ middleware: "auth" });
  const [empleados, setEmpleados]   = useState([]);
  const [search, setSearch]         = useState("");
  const [showDrop, setShowDrop]     = useState(false);
  const [empSel, setEmpSel]         = useState(null);
  const [contrato, setContrato]     = useState(null);
  const [loadingCnt, setLoadingCnt] = useState(false);
  const [dirigidoA, setDirigidoA]   = useState("");
  const [correo, setCorreo]         = useState("");
  const [descargando, setDescargando] = useState(false);
  const [enviando, setEnviando]     = useState(false);
  const [mensaje, setMensaje]       = useState("");
  const [error, setError]           = useState("");

  useEffect(() => {
    contratacionService.getEmpleados()
      .then((r) => setEmpleados(r.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id || empSel) return;
    setEmpSel({ id: user.id, name: user.name });
  }, [user, empSel]);

  // Cargar contrato al seleccionar empleado
  useEffect(() => {
    if (!empSel) { setContrato(null); setCorreo(""); return; }
    setLoadingCnt(true);
    setError("");
    setMensaje("");
    contratacionService.getContratos({ user_id: empSel.id, per_page: 1 })
      .then((res) => {
        const data = res.data?.data?.data ?? res.data?.data ?? [];
        const contratoActual = data[0] ?? null;
        setContrato(contratoActual);
        setCorreo(contratoActual?.correo ?? empSel.email ?? "");
      })
      .catch(() => { setContrato(null); setCorreo(""); })
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

  const handleEnviar = async () => {
    if (!contrato?.uuid) return;
    setEnviando(true);
    setError("");
    setMensaje("");
    try {
      const res = await portalEmpleadoService.enviarCertificadoLaboral(
        contrato.uuid,
        dirigidoA.trim(),
        correo.trim()
      );
      setMensaje(res.data?.message || "Certificado enviado correctamente.");
    } catch (err) {
      setError(err.response?.data?.message || "Error al enviar el certificado al correo.");
    } finally {
      setEnviando(false);
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
                        onClick={() => { setEmpSel(e); setShowDrop(false); setSearch(""); setError(""); setMensaje(""); }}
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
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Correo</p>
                  <p className="text-sm font-medium text-gray-700">{contrato.correo ?? "Sin correo registrado"}</p>
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
            <p className="text-xs text-gray-400 mt-1">Puede dejarse en blanco para A quien interese.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Enviar a correo
            </label>
            <input type="email"
              placeholder="correo@empresa.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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

          {mensaje && (
            <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {mensaje}
            </p>
          )}

          {/* Botón */}
          <div className="mt-auto pt-2 border-t border-gray-100 space-y-2">
            <button
              onClick={handleEnviar}
              disabled={!empSel || !contrato || !correo.trim() || enviando}
              className="flex items-center justify-center gap-2 w-full h-10 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
            >
              {enviando ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                <><Send className="h-4 w-4" /> Enviar certificado al correo</>
              )}
            </button>
            <button
              onClick={handleDescargar}
              disabled={!empSel || !contrato || descargando}
              className="flex items-center justify-center gap-2 w-full h-9 bg-white text-indigo-700 text-sm font-medium rounded-xl border border-indigo-100 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {descargando ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generando PDF...</>
              ) : (
                <><Download className="h-4 w-4" /> Descargar PDF</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
