import {
  CheckCircleIcon,
  AlertTriangle,
  XCircle,
  FileDiffIcon,
  BarChart3,
  Calendar,
  Building2,
  TrendingUp,
  Filter,
  Download,
  Eye
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { indicadoresDepartamentoApi } from "../../services/api";
import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { Link } from "react-router-dom";

export default function DashboardIndicadores() {
  const [data, setData] = useState([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [showFullObs, setShowFullObs] = useState(false);
  const [departamentoFiltro, setDepartamentoFiltro] = useState("Todos");

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await indicadoresDepartamentoApi.getAll({ mes, anio });
        console.log("Datos de indicadores por departamento:", res.data);
        setData(res.data.data || []);
      } catch (error) {
        console.error("Error fetching indicadores por departamento:", error);
      }
    };
    fetchData();
  }, [mes, anio]);

  // Agrupar indicadores por departamento
  const indicadoresAgrupados = data.reduce((acc, item) => {
    const depto = item.departamento?.nombre || "Sin Departamento";
    if (!acc[depto]) acc[depto] = [];
    acc[depto].push(item);
    return acc;
  }, {});

  // Validar si aplica este mes según la frecuencia
  const validarFrecuencia = (frecuencia) => {
    if (!frecuencia) return false;
    const f = frecuencia.toLowerCase();

    const frecuencias = {
      diario: () => true,
      semanal: () => true,
      quincenal: () => mes % 2 === 0,
      mensual: () => true,
      bimestral: () => mes % 2 === 0,
      trimestral: () => mes % 3 === 0,
      cuatrimestral: () => mes % 4 === 0,
      semestral: () => mes % 6 === 0,
      anual: () => mes === 12,
    };

    return frecuencias[f] ? frecuencias[f]() : false;
  };

  // Función para formatear fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  function getPeriodoLabel(frecuencia, mes, anio) {
    const meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    mes = Number(mes);
    switch (frecuencia?.toLowerCase()) {
      case "trimestral": {
        const trimestre = Math.ceil(mes / 3);
        const inicio = (trimestre - 1) * 3;
        return `${meses[inicio]} - ${meses[inicio + 2]} ${anio}`;
      }
      case "bimestral": {
        const bimestre = Math.ceil(mes / 2);
        const inicio = (bimestre - 1) * 2;
        return `${meses[inicio]} - ${meses[inicio + 1]} ${anio}`;
      }
      case "cuatrimestral": {
        const cuatrimestre = Math.ceil(mes / 4);
        const inicio = (cuatrimestre - 1) * 4;
        return `${meses[inicio]} - ${meses[inicio + 3]} ${anio}`;
      }
      case "semestral": {
        if (mes <= 6) return `Ene - Jun ${anio}`;
        return `Jul - Dic ${anio}`;
      }
      case "anual":
        return `Ene - Dic ${anio}`;
      case "mensual":
        return `${meses[mes - 1]} ${anio}`;
      case "quincenal": {
        return mes ? `${meses[mes - 1]} (Quincenal) ${anio}` : "Quincenal";
      }
      default:
        return "";
    }
  }

  const departamentosUnicos = Object.keys(indicadoresAgrupados);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ✅ HEADER MEJORADO */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard de Indicadores</h1>
                <p className="text-gray-600 mt-1">Monitoreo de KPIs por departamento</p>
              </div>
            </div>
            <Link
              to="/auth/rendimiento"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Eye className="w-4 h-4" />
              Ver Tareas
            </Link>
          </div>

          {/* ✅ FILTROS MEJORADOS */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Filtros de Consulta</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Selector de Mes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Mes
                </label>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                >
                  {meses.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Departamento */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 className="w-4 h-4 text-green-600" />
                  Departamento
                </label>
                <select
                  value={departamentoFiltro}
                  onChange={e => setDepartamentoFiltro(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="Todos">Todos los departamentos</option>
                  {departamentosUnicos.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Año */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Año
                </label>
                <input
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                  min="2000"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Mensaje si no hay datos */}
        {data.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin datos disponibles</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No hay indicadores registrados para el período seleccionado. 
              Intenta cambiar los filtros o contacta al administrador.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(indicadoresAgrupados)
            .filter(([departamento]) =>
              departamentoFiltro === "Todos" ? true : departamento === departamentoFiltro
            )
            .map(([departamento, indicadores]) => (
              <div key={departamento} className="space-y-6">
                {/* ✅ HEADER DE DEPARTAMENTO MEJORADO */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{departamento}</h2>
                      <p className="text-indigo-100">
                        {indicadores.length} indicador{indicadores.length !== 1 ? 'es' : ''} registrado{indicadores.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ✅ GRID DE INDICADORES MEJORADO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {indicadores.map((item) => {
                    const aplicaFrecuencia = validarFrecuencia(item.frecuencia);

                    if (!aplicaFrecuencia) {
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 mb-2">
                              {item.nombre || "—"}
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-3 mb-4">
                              <p className="text-xs text-gray-600 font-medium">
                                Frecuencia: {item.frecuencia || "—"}
                              </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                              <p className="text-amber-800 text-sm font-medium">
                                No aplica este período
                              </p>
                              <p className="text-amber-600 text-xs mt-1">
                                Frecuencia: {item.frecuencia}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const registro = item.registro;
                    const valor = registro?.porcentaje_meta
                      ? `${Math.round(registro.porcentaje_meta)}%`
                      : registro?.resultado || "—";
                    const estado = registro?.estado?.toLowerCase() || "sin datos";
                    const meta = parseFloat(item.meta) || 0;
                    const tieneDatos = valor !== null && !isNaN(meta);

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group"
                      >
                        {/* Header del indicador */}
                        <div className="mb-4">
                          <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                            {item.nombre || "—"}
                          </h4>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                              {item.frecuencia || "—"}
                            </div>
                            <div className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs">
                              {getPeriodoLabel(item.frecuencia, mes, anio)}
                            </div>
                          </div>

                          {registro?.fecha && (
                            <p className="text-xs text-gray-500">
                              Último registro: {formatFecha(registro.fecha)}
                            </p>
                          )}
                        </div>

                        {/* ✅ GRÁFICO MEJORADO */}
                        <div className="mb-6">
                          <div className="h-32 bg-gradient-to-t from-gray-50 to-white rounded-xl p-3">
                            {tieneDatos ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  layout="vertical"
                                  data={[
                                    {
                                      name: "Comparativo",
                                      Valor: registro?.valor ? Number(registro.valor) : 0,
                                      Meta: meta ?? 0,
                                    },
                                  ]}
                                  margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                                >
                                  <XAxis
                                    type="number"
                                    domain={[0, Math.max(Number(meta ?? 0), Number(registro?.valor ?? 0)) * 1.2]}
                                    tickFormatter={(v) => Math.floor(v)}
                                    hide
                                  />
                                  <YAxis type="category" dataKey="name" hide />
                                  <Tooltip formatter={(v, name) => {
                                    if (isNaN(v)) return "—";
                                    const unidad = registro?.resultado?.includes("días")
                                      ? " días"
                                      : registro?.resultado?.includes("%")
                                      ? " %"
                                      : "";
                                    return [Math.floor(v) + unidad, name];
                                  }} />
                                  <Bar dataKey="Meta" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
                                  <Bar dataKey="Valor" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                  <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                  <p className="text-red-600 text-sm font-medium">Sin registro</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ✅ FOOTER MEJORADO */}
                        <div className="border-t border-gray-100 pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Valor:</span>
                                <span className="font-bold text-gray-900">{valor ?? "—"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Meta:</span>
                                <span className="text-gray-500">
                                  {item.tipo_meta === "mayor" ? "≥" : "≤"}
                                </span>
                                <span className="font-bold text-gray-900">{meta ?? "—"}</span>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-2">
                              {registro?.documento_url && (
                                <a
                                  href={`${clienteAxios.defaults.baseURL}${registro.documento_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                  title="Descargar análisis"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>


{estado && (
  <div className="mt-1">
    {estado === "ok" && (
      <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
        <CheckCircleIcon className="w-4 h-4 text-green-600" />
        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
          OK
        </span>
      </div>
    )}
    {estado === "medio" && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-semibold">
          MEDIO
        </span>
      </div>
    )}
    {["crítico", "critico"].includes(estado) && (
      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-600" />
        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
          CRÍTICO
        </span>
      </div>
    )}
  </div>
)}

                          {/* Observaciones */}
                          {!registro?.documento_url && registro?.observaciones && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <p className="text-xs text-gray-600 font-medium mb-1">Observaciones:</p>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {showFullObs || registro.observaciones.length <= 120
                                  ? registro.observaciones
                                  : registro.observaciones.slice(0, 120) + "... "}
                                {registro.observaciones.length > 120 && (
                                  <button
                                    className="text-indigo-600 hover:text-indigo-800 font-medium ml-1"
                                    onClick={() => setShowFullObs((v) => !v)}
                                  >
                                    {showFullObs ? "Ver menos" : "Ver más"}
                                  </button>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}