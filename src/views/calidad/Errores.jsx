import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell, ResponsiveContainer 
} from "recharts";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";




export default function ErroresDashboard() {
    const [kpis, setKpis] = useState({
        totalErrores: 0,
        totalErroresMesActual: 0,
        totalErroresMesAnterior: 0,
        variacionPorcentaje: 0,
        erroresPorProceso: [],
        erroresPorProcesoMesActual: [],
        erroresPorProcesoMesAnterior: []
    });

    useEffect(() => {
        obtenerKpis();
    }, []);

    // Obtener KPIs desde la API
    const obtenerKpis = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await clienteAxios.get('/api/errores/kpi', {
 
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("KPIs obtenidos:", response.data);
            setKpis(response.data);
        } catch (error) {
            console.log("Error obteniendo KPIs:", error);
        }
    };
function DescripcionCorta({ texto, max = 100 }) {
  const [expandido, setExpandido] = useState(false);

  if (!texto || texto.length === 0) {
    return <span className="italic text-gray-400">Sin descripción</span>;
  }

  // Si viene como array, conviértelo a string
  const contenido = Array.isArray(texto) ? texto.join(", ") : texto;

  if (contenido.length <= max) {
    return <span>{contenido}</span>;
  }

  return (
    <span>
      {expandido ? contenido : contenido.slice(0, max) + "... "}
      <button
        className="text-blue-600 underline text-xs ml-1"
        onClick={() => setExpandido((v) => !v)}
        type="button"
      >
        {expandido ? "Ver menos" : "Leer más"}
      </button>
    </span>
  );
}

// Colores para el gráfico de pastel
const COLORS = ["#6B7280", "#EF4444", "#10B981", "#3B82F6", "#F59E0B"];

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📊 Dashboard de No Conformidades</h1>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Errores */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-700">Total No Conformidades</h2>
                    <p className="text-5xl font-semibold text-red-500">{kpis.totalErrores}</p>
                </div>

                {/* Errores del Mes Actual */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-700">No Conformidades Mes Actual</h2>
                    <p className="text-4xl font-semibold text-blue-500">{kpis.totalErroresMesActual}</p>
                </div>

                {/* Errores del Mes Anterior */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-700">No Conformidades Mes Anterior</h2>
                    <p className="text-4xl font-semibold text-gray-500">{kpis.totalErroresMesAnterior}</p>
                </div>
            </div>

            {/* Variación del KPI */}
            <div className="mt-6 text-center">
                <h2 className="text-lg font-bold text-gray-700">📈 Variación Mensual</h2>
                {kpis.variacionPorcentaje !== "No hay datos del mes anterior" ? (
                    <div className={`flex items-center justify-center text-3xl font-semibold mt-2 
                        ${kpis.variacionPorcentaje >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {kpis.variacionPorcentaje >= 0 ? (
                            <ArrowUpCircle size={36} />
                        ) : (
                            <ArrowDownCircle size={36} />
                        )}
                        <span className="ml-2">{kpis.variacionPorcentaje}%</span>
                    </div>
                ) : (
                    <p className="text-gray-500 mt-2">No hay datos para comparar.</p>
                )}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Gráfico de Barras Comparativo */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">No Conformidades por Departamento (Comparación)</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart>
                            <XAxis dataKey="departamento_nombre" stroke="#374151" />
                            <YAxis stroke="#374151" />
                            <Tooltip />
                            <Bar data={kpis.erroresPorProcesoMesAnterior} dataKey="total" fill="#6B7280" name="Mes Anterior" />
                            <Bar data={kpis.erroresPorProcesoMesActual} dataKey="total" fill="#EF4444" name="Mes Actual" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico de Pastel */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Distribución de No Conformidades</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={kpis.erroresPorProceso} dataKey="total" nameKey="departamento_nombre" cx="50%" cy="50%" outerRadius={80}>
                                {kpis.erroresPorProceso?.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabla Comparativa */}
            <div className="grid grid-cols-1">
  <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mt-6 col-span-1 overflow-x-auto">
    <h2 className="text-lg font-bold text-gray-700 mb-3">
      🔍 Comparación de No Conformidades por Departamento
    </h2>

    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-xs md:text-sm leading-normal">
            <th className="py-3 px-4 md:px-6 text-left whitespace-nowrap">Departamento</th>
            <th className="py-3 px-4 md:px-6 text-left whitespace-nowrap">Descripcion</th>
            <th className="py-3 px-4 md:px-6 text-center whitespace-nowrap">Mes Anterior</th>
            <th className="py-3 px-4 md:px-6 text-center whitespace-nowrap">Mes Actual</th>
            <th className="py-3 px-4 md:px-6 text-center whitespace-nowrap">Diferencia</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {kpis.erroresPorProcesoMesActual.map((actual) => {
            const anterior = kpis.erroresPorProcesoMesAnterior.find(
              (e) => e.departamento_id === actual.departamento_id
            ) || { total: 0 };
            const diferencia = actual.total - anterior.total;

            return (
              <tr
                key={actual.departamento_id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4 md:px-6">{actual.departamento_nombre}</td>
                <td className="py-3 px-4 md:px-6">
                  <DescripcionCorta texto={actual.descripciones} />
                </td>

                <td className="py-3 px-4 md:px-6 text-center">{anterior.total}</td>
                <td className="py-3 px-4 md:px-6 text-center">{actual.total}</td>
                <td
                  className={`py-3 px-4 md:px-6 text-center font-semibold ${
                    diferencia >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {diferencia}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
</div>

           
        </div>
    );
}
 