import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  AlertTriangle, Search, Download, X, FileWarning, Plus, Pencil, Loader2,
} from "lucide-react";
import { useGetWorkSessions } from "../../hooks/nomina/useGetWorkSessions";
import { contratacionService, llamadoAtencionService } from "../../services/nominaService";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtFecha(d) {
  if (!d) return "—";
  return new Date(d.slice(0, 10) + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function minsToHM(mins) {
  if (!mins || mins === 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
}

function retardoAlmuerzo(session) {
  if (!session.hora_salida_almuerzo || !session.hora_ingreso_almuerzo) return 0;
  const sal  = new Date(session.hora_salida_almuerzo);
  const ing  = new Date(session.hora_ingreso_almuerzo);
  const mins = Math.round((ing - sal) / 60000);
  return mins > 60 ? mins - 60 : 0;
}

function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const BADGE = {
  tardanza: "bg-orange-100 text-orange-700 border-orange-200",
  almuerzo: "bg-blue-100 text-blue-700 border-blue-200",
  ausencia: "bg-red-100 text-red-700 border-red-200",
  otro:     "bg-purple-100 text-purple-700 border-purple-200",
};

const LABEL_TIPO = {
  tardanza: "Llegada tarde",
  almuerzo: "Retardo en almuerzo",
  ausencia: "Ausencia injustificada",
  otro:     "Otro",
};

const SEVERIDAD = {
  leve:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  moderado: "bg-orange-50 text-orange-700 border-orange-200",
  grave:  "bg-red-50 text-red-700 border-red-200",
};

function calcSeveridad(mins) {
  if (mins >= 60) return "grave";
  if (mins >= 20) return "moderado";
  return "leve";
}

// ── Modal agregar falta manual ────────────────────────────────────────────────
function ModalOtro({ empleados, onGuardar, onClose }) {
  const [empSel, setEmpSel]     = useState("");
  const [searchEmp, setSearchEmp] = useState("");
  const [fecha, setFecha]       = useState(new Date().toISOString().slice(0, 10));
  const [titulo, setTitulo]     = useState("");
  const [detalle, setDetalle]   = useState("");
  const [showDrop, setShowDrop] = useState(false);

  const empFiltrados = empleados.filter((e) =>
    e.name?.toLowerCase().includes(searchEmp.toLowerCase())
  );
  const empObj = empleados.find((e) => String(e.id) === empSel);

  const handleGuardar = () => {
    if (!empObj || !titulo.trim()) return;
    onGuardar({
      uuid:    crypto.randomUUID(),
      user_id: empObj.id,
      nombre:  empObj.name,
      fecha,
      tipo:    "otro",
      minutos: 0,
      detalle: detalle.trim() || titulo,
      titulo:  titulo.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-purple-500" />
            <span className="font-semibold text-gray-800">Agregar otra falta</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Empleado */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Empleado</label>
            <div className="relative">
              <button onClick={() => setShowDrop((v) => !v)}
                className="w-full flex items-center justify-between h-9 px-3 text-sm border border-gray-200 rounded-lg hover:border-indigo-400 bg-white transition-colors">
                <span className={empObj ? "text-gray-800" : "text-gray-400"}>
                  {empObj ? empObj.name : "Seleccionar empleado"}
                </span>
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {showDrop && (
                <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input autoFocus type="text" placeholder="Buscar..." value={searchEmp}
                      onChange={(e) => setSearchEmp(e.target.value)}
                      className="w-full px-3 h-7 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {empFiltrados.map((e) => (
                      <button key={e.id} onClick={() => { setEmpSel(String(e.id)); setShowDrop(false); setSearchEmp(""); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        {e.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fecha del hecho</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Título falta */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tipo de falta</label>
            <input type="text" placeholder="Ej: Incumplimiento de normas, comportamiento inapropiado..."
              value={titulo} onChange={(e) => setTitulo(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descripción detallada</label>
            <textarea rows={3} placeholder="Describe el hecho ocurrido..."
              value={detalle} onChange={(e) => setDetalle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-2 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={!empObj || !titulo.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

ModalOtro.propTypes = {
  empleados: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
  })).isRequired,
  onGuardar: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

// ── Modal generar llamado ─────────────────────────────────────────────────────
function ModalLlamado({ infraccion, onClose }) {
  const [texto, setTexto] = useState("");
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");

  const descripcionAuto = {
    tardanza: `El empleado registró una llegada tarde de ${minsToHM(infraccion.minutos)} el día ${fmtFecha(infraccion.fecha)}, incumpliendo el horario laboral establecido.`,
    almuerzo: `El empleado excedió el tiempo de almuerzo en ${minsToHM(infraccion.minutos)} el día ${fmtFecha(infraccion.fecha)}.`,
    ausencia: `El empleado no registró asistencia el día ${fmtFecha(infraccion.fecha)} sin justificación documentada.`,
  }[infraccion.tipo] ?? "";

  const descripcion = texto || descripcionAuto || infraccion.detalle || "";

  const handleGenerarPdf = async () => {
    if (!infraccion.user_id || !descripcion.trim()) return;
    setGenerando(true);
    setError("");
    try {
      const creado = await llamadoAtencionService.createLlamado({
        user_id: infraccion.user_id,
        tipo: infraccion.tipo,
        titulo: infraccion.titulo ?? LABEL_TIPO[infraccion.tipo] ?? infraccion.tipo,
        detalle: descripcion.trim(),
        minutos: infraccion.minutos ?? 0,
        fecha_hecho: infraccion.fecha,
        severidad: calcSeveridad(infraccion.minutos ?? 0),
      });
      const uuid = creado.data?.uuid;
      const pdf = await llamadoAtencionService.pdfLlamado(uuid, descripcion.trim());
      descargarBlob(pdf.data, `llamado_${uuid}.pdf`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo generar el PDF del llamado.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-gray-800">Generar llamado de atención</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Info empleado */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">{infraccion.nombre}</p>
              <p className="text-xs text-gray-500">{fmtFecha(infraccion.fecha)}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${BADGE[infraccion.tipo]}`}>
              {infraccion.titulo ?? LABEL_TIPO[infraccion.tipo] ?? infraccion.tipo}
            </span>
          </div>

          {/* Descripción auto */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Descripción del hecho
            </label>
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-700"
            />
          </div>

          {/* Severidad */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Severidad:</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${SEVERIDAD[calcSeveridad(infraccion.minutos)]}`}>
              {calcSeveridad(infraccion.minutos)}
            </span>
          </div>
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-2 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleGenerarPdf}
            disabled={generando || !descripcion.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {generando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {generando ? "Generando..." : "Generar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

ModalLlamado.propTypes = {
  infraccion: PropTypes.shape({
    uuid: PropTypes.string,
    user_id: PropTypes.number,
    nombre: PropTypes.string,
    fecha: PropTypes.string,
    tipo: PropTypes.string,
    titulo: PropTypes.string,
    detalle: PropTypes.string,
    minutos: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

const PAGE_SIZE = 20;

// ── Página principal ──────────────────────────────────────────────────────────
export default function PageLlamadosAtencion() {
  const hoy       = new Date().toISOString().slice(0, 10);
  const primerDia = hoy.slice(0, 8) + "01";

  const [search, setSearch]           = useState("");
  const [fechaInicio, setFechaInicio] = useState(primerDia);
  const [fechaFin, setFechaFin]       = useState(hoy);
  const [modal, setModal]             = useState(null);
  const [modalOtro, setModalOtro]     = useState(false);
  const [manuales, setManuales]       = useState([]);
  const [empleados, setEmpleados]     = useState([]);
  const [page, setPage]               = useState(1);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, fechaInicio, fechaFin]);

  useEffect(() => {
    contratacionService.getEmpleados()
      .then((res) => setEmpleados(res.data ?? []))
      .catch(() => {});
  }, []);

  const params = useMemo(() => ({
    fecha_inicio: fechaInicio,
    fecha_fin:    fechaFin,
    per_page:     20,
    page,
  }), [fechaInicio, fechaFin, page]);

  const { workSessions, isLoading } = useGetWorkSessions(params);

  const paginaMeta = workSessions?.data ?? {};
  const totalPages  = paginaMeta.last_page  ?? 1;
  const currentPage = paginaMeta.current_page ?? 1;
  const totalItems  = paginaMeta.total ?? 0;

  // Construir infracciones: automáticas (sesiones) + manuales
  const infracciones = useMemo(() => {
    const lista = workSessions?.data?.data ?? [];
    const result = [];
    lista.forEach((s) => {
      const nombre = s.empleado?.name ?? "—";
      if (!nombre.toLowerCase().includes(search.toLowerCase())) return;

      if (s.minutos_tardanza > 0) {
        result.push({
          uuid:    s.uuid + "_t",
          user_id: s.user_id ?? s.empleado?.id,
          nombre,
          fecha:   s.registro_diario,
          tipo:    "tardanza",
          minutos: s.minutos_tardanza,
          detalle: `Llegó ${minsToHM(s.minutos_tardanza)} tarde`,
          session: s,
        });
      }

      const retAlmuerzo = retardoAlmuerzo(s);
      if (retAlmuerzo > 0) {
        result.push({
          uuid:    s.uuid + "_a",
          user_id: s.user_id ?? s.empleado?.id,
          nombre,
          fecha:   s.registro_diario,
          tipo:    "almuerzo",
          minutos: retAlmuerzo,
          detalle: `Excedió almuerzo ${minsToHM(retAlmuerzo)}`,
          session: s,
        });
      }
    });

    manuales.forEach((m) => {
      if (!m.nombre.toLowerCase().includes(search.toLowerCase())) return;
      result.push(m);
    });

    return result;
  }, [workSessions, search, manuales]);

  return (
    <div className="p-6">
      {modal && <ModalLlamado infraccion={modal} onClose={() => setModal(null)} />}
      {modalOtro && (
        <ModalOtro
          empleados={empleados}
          onGuardar={(nueva) => setManuales((prev) => [nueva, ...prev])}
          onClose={() => setModalOtro(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Llamados de Atención</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Infracciones detectadas automáticamente y registradas manualmente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-lg">
            <AlertTriangle className="h-3.5 w-3.5" />
            {infracciones.length} infracción{infracciones.length !== 1 ? "es" : ""}
          </div>
          <button onClick={() => setModalOtro(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            Agregar otra falta
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y fechas */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Buscar empleado..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <span className="text-gray-400 text-sm">→</span>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando registros...</div>
        ) : infracciones.length === 0 ? (
          <div className="py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No se encontraron infracciones para el período seleccionado.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Empleado", "Fecha", "Tipo", "Detalle", "Severidad", "Acción"].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {infracciones.map((inf) => (
                <tr key={inf.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">{inf.nombre}</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{fmtFecha(inf.fecha)}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${BADGE[inf.tipo]}`}>
                      {inf.titulo ?? LABEL_TIPO[inf.tipo] ?? inf.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{inf.detalle}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${SEVERIDAD[calcSeveridad(inf.minutos)]}`}>
                      {calcSeveridad(inf.minutos)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <button onClick={() => setModal(inf)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      <FileWarning className="h-3.5 w-3.5" />
                      Generar llamado
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-gray-500">
            Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
            {" · "}<span className="font-medium">{totalItems}</span> sesiones
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  disabled={isLoading}
                  className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors disabled:cursor-not-allowed ${
                    p === currentPage
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
