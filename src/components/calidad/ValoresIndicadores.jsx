import { useEffect, useState } from "react";
import { valoresIndicadoresApi, departamentosApi} from "../../services/api";
import clienteAxios from "../../config/axios";
import { 
  FileDownIcon, 
  X, 
  Search, 
  Calendar, 
  Building2, 
  Trash2, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Inbox,
  Loader2,
  ListFilter
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Swal from "sweetalert2";

export default function ValoresIndicadores({ valores, setValores, mes, setMes, anio, setAnio }) {
  // === LÓGICA INTACTA ===
  const { user } = useAuth({ middleware: "auth" });
  const [departamentoId, setDepartamentoId] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedObservacion, setSelectedObservacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const fetchValores = async () => {
    setLoading(true);
    try {
      const params = { mes, anio };
      
      if (departamentoId) {
        params.departamento_id = departamentoId;
      }

      const res = await valoresIndicadoresApi.getAll(params);
      console.log("Valores fetched:", res.data);
      
      setValores(res.data.data || []);
    } catch (error) {
      console.error("Error fetching valores:", error);    
      setValores([]);
    }
    setLoading(false);
  };

  const fetchdepartamentos = async () => {
    try {
      const res = await departamentosApi.getAll();
      setDepartamentos(res.data);
    } catch (error) {
      setDepartamentos([]);
      console.error("Error fetching departamentos:", error);
    }
  };

  useEffect(() => {
    fetchValores();
  }, [mes, anio, departamentoId]);

  useEffect(() => {
    fetchdepartamentos();
  }, []);

  const roleId = user?.role_id;
  const esAdmin = [1, 2].includes(roleId);
  const esRegistrador = valores.some(v => v.user_id === user?.id);
  const puedeVerTabla = esAdmin || esRegistrador;

  const handleDelete = async(id)=>{
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981", // Ajustado color al tema esmeralda
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await valoresIndicadoresApi.delete(id);
          Swal.fire("Eliminado", "El valor del indicador ha sido eliminado.", "success");
          fetchValores(); 
        } catch (error) {
          console.error("Error al eliminar el valor del indicador:", error);
          Swal.fire("Error", "Hubo un problema al eliminar el valor del indicador.", "error");
        }
      }
    });
  }
  // === FIN LÓGICA INTACTA ===

  return (
    <div className="h-full flex flex-col bg-white">
      {/* HEADER DE LA TABLA */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-800">
            Valores Registrados
          </h2>
        </div>

        {/* CONTROLES DE FILTRO */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 hover:border-slate-300 transition-colors"
            >
              {meses.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-24 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 hover:border-slate-300 transition-colors"
              min="2000"
              max={new Date().getFullYear()}
            />
          </div>

          {esAdmin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 hover:border-slate-300 transition-colors"
              >
                <option value="">Todos los Dptos</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={fetchValores}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Buscar</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO (TABLA O ESTADOS) */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        {!puedeVerTabla ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Acceso Denegado</h3>
            <p className="text-sm text-slate-500 max-w-sm">No tienes los permisos necesarios para visualizar el registro de indicadores.</p>
          </div>
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Cargando registros...</p>
          </div>
        ) : valores.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-400">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No hay datos</h3>
            <p className="text-sm text-slate-500 max-w-sm">No se han encontrado registros de indicadores para el periodo seleccionado.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Indicador</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Resultado</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Meta</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Análisis</th>
                  {esAdmin && <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {valores.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Nombre Indicador */}
                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                      {v.indicador?.nombre}
                    </td>

                    {/* Resultado */}
                    <td className="px-5 py-4 text-sm text-center font-bold text-slate-700 bg-slate-50/50">
                      {v.resultado ? (
                        v.resultado 
                      ) : (
                        (() => {
                          const valor = Number(v.valor);
                          const nombre = v.indicador?.nombre?.toLowerCase() || "";
                          const formula = v.indicador?.formula?.toLowerCase() || "";

                          if (nombre.includes("dia") || formula.includes("dia")) return `${Math.round(valor)} días`;
                          if (nombre.includes("porcentaje") || nombre.includes("eficiencia") || nombre.includes("cumplimiento") || formula.includes("/") || formula.includes("porc")) return `${Math.round(valor)}%`;

                          return Math.round(valor);
                        })()
                      )}
                    </td>

                    {/* Meta */}
                    <td className="px-5 py-4 text-sm text-center text-slate-600">
                      <span className="text-slate-400 font-medium mr-1">
                        {v.indicador?.tipo_meta === "mayor" ? "≥" : "≤"}
                      </span>
                      <span className="font-semibold">{v.indicador?.meta}</span>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4 text-center">
                      {v.estado ? (
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border
                              ${
                                v.estado === "ok"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : v.estado === "medio"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : v.estado === "critico"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                          >
                            {v.estado === "ok" && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {v.estado === "medio" && <AlertTriangle className="w-3.5 h-3.5" />}
                            {v.estado === "critico" && <AlertCircle className="w-3.5 h-3.5" />}
                            {v.estado.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(v.fecha).toLocaleDateString("es-CO", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Análisis / Documento */}
                    <td className="px-5 py-4 text-center">
                      {v.documento ? (
                        <a
                          href={`${clienteAxios.defaults.baseURL}/api/registro-indicadores/descargar/${v.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors shadow-sm"
                          title="Descargar Evidencia"
                        >
                          <FileDownIcon size={18} />
                        </a>
                      ) : v.observaciones ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-slate-500 max-w-[120px] truncate" title={v.observaciones}>
                            {v.observaciones}
                          </span>
                          <button
                            onClick={() => setSelectedObservacion(v.observaciones)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Ver observación completa"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Acciones (Admin) */}
                    {esAdmin && (
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={loading}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar Registro"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 👇 Modal de Observaciones */}
      {selectedObservacion && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-slate-400" />
                Análisis / Observación
              </h3>
              <button
                onClick={() => setSelectedObservacion(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                  {selectedObservacion}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedObservacion(null)}
                className="bg-white border border-slate-300 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-50 font-medium transition-colors text-sm shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}