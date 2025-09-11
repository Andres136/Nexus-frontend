import {
  CheckCircleIcon,
  AlertTriangle,
  XCircle,
  FileDiffIcon,
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

export default function DashboardIndicadores() {
  const [data, setData] = useState([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await indicadoresDepartamentoApi.getAll({ mes, anio });
        setData(res.data.data || []);
      } catch (error) {
        console.error("Error fetching indicadores por departamento:", error);
      }
    };
    fetchData();
  }, [mes, anio]);

  const EstadoIcon = ({ estado }) => {
    if (estado === "ok")
      return (
        <CheckCircleIcon className="text-green-600" size={20} title="OK" />
      );
    if (estado === "medio")
      return (
        <AlertTriangle className="text-yellow-500" size={20} title="Medio" />
      );
    if (estado === "critico")
      return <XCircle className="text-red-600" size={20} title="Crítico" />;
    return <span className="text-gray-400 italic text-sm">Sin estado</span>;
  };

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
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
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
      // Puedes mejorar esto si tienes info de la quincena seleccionada
      return mes ? `${meses[mes - 1]} (Quincenal) ${anio}` : "Quincenal";
    }
    default:
      return "";
  }
}
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Indicadores por Departamento
      </h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6 border p-4 rounded bg-gray-50">
        <div>
          <label className="block text-sm text-gray-700">Mes</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {meses.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Año</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border rounded px-2 py-1 w-24"
            min="2000"
            max={new Date().getFullYear()}
          />
        </div>
      </div>

      {/* Mensaje si no hay datos */}
      {data.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <XCircle size={40} className="mx-auto text-gray-400" />
          <p className="mt-2">No hay indicadores registrados para mostrar.</p>
        </div>
      ) : (
        <div className="space-y-10 max-h-[75vh] overflow-y-auto pr-2">
          {Object.entries(indicadoresAgrupados).map(
            ([departamento, indicadores]) => (
              <div key={departamento}>
                <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-1">
                  {departamento}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {indicadores.map((item) => {
                    const aplicaFrecuencia = validarFrecuencia(item.frecuencia);

                    if (!aplicaFrecuencia) {
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl shadow p-4 border flex flex-col justify-center items-center"
                        >
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">
                            {item.nombre || "—"}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">
                            Frecuencia: {item.frecuencia || "—"}
                          </p>
                          <div className="text-gray-400 italic text-sm mt-8 mb-8 text-center">
                            No aplica este mes según la frecuencia (
                            {item.frecuencia})
                          </div>
                        </div>
                      );
                    }

                    const registro = item.registro;
                    const valor = registro ? parseFloat(registro.valor) : null;
                    const meta = item.meta ? parseFloat(item.meta) : null;
                    const tieneDatos = valor !== null && !isNaN(meta);

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl shadow p-4 border"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-lg text-gray-800">
                            {item.nombre || "—"}
                          </h4>
                          <EstadoIcon estado={registro?.estado} />
                        </div>

                      <p className="text-xs text-gray-500 mb-1">
  Frecuencia: {item.frecuencia || "—"}{" "}
  <span className="text-[11px] text-gray-400">
    ({getPeriodoLabel(item.frecuencia, mes, anio)})
  </span>
</p>
{registro?.fecha && (
  <p className="text-xs text-gray-400 mb-2">
    Último registro: {formatFecha(registro.fecha)}
  </p>
)}

                        {/* Gráfico */}
                        <div className="h-40">
                          {tieneDatos ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                layout="vertical"
                                data={[
                                  {
                                    name: "Comparativo",
                                    Valor: valor,
                                    Meta: meta,
                                  },
                                ]}
                                margin={{
                                  top: 10,
                                  right: 20,
                                  bottom: 10,
                                  left: 20,
                                }}
                              >
                                <XAxis
                                  type="number"
                                  domain={[0, Math.max(valor, meta) * 1.2]}
                                  hide
                                />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip formatter={(v) => v.toFixed(2)} />
                                <Bar
                                  dataKey="Meta"
                                  fill="#D1D5DB"
                                  radius={[0, 4, 4, 0]}
                                />
                                <Bar
                                  dataKey="Valor"
                                  fill="#3B82F6"
                                  radius={[0, 4, 4, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-red-500 italic text-sm text-center mt-6">
                              Sin registro este mes
                            </div>
                          )}
                        </div>

                        {/* Pie */}
                        <div className="flex justify-between items-center mt-4">
                          <div>
                            <p className="text-xs text-gray-500">
                              Valor: {valor ?? "—"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Meta: {meta ?? "—"}
                            </p>
                          </div>
                          {registro?.documento && (
                            <a
                              href={`${clienteAxios.defaults.baseURL}/api/registro-indicadores/descargar/${registro.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Descargar análisis"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FileDiffIcon size={20} />
                            </a>
                          )}
                          {!registro?.documento && registro?.observaciones && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 italic">
                                Observaciones: {registro.observaciones}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
