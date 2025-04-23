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
            setKpis(response.data);
        } catch (error) {
            console.log("Error obteniendo KPIs:", error);
        }
    };

    // Colores para el gráfico de pastel
    const COLORS = ["#6B7280", "#EF4444", "#10B981", "#3B82F6", "#F59E0B"];

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📊 Dashboard de Novedades</h1>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Errores */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-700">Total Novedades</h2>
                    <p className="text-5xl font-semibold text-red-500">{kpis.totalErrores}</p>
                </div>

                {/* Errores del Mes Actual */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-700">Novedades Mes Actual</h2>
                    <p className="text-4xl font-semibold text-blue-500">{kpis.totalErroresMesActual}</p>
                </div>

                {/* Errores del Mes Anterior */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-700">Novedades Mes Anterior</h2>
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
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Novedades por Departamento (Comparación)</h2>
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
                    <h2 className="text-lg font-bold text-gray-700 mb-3">Distribución de Novedades</h2>
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

                 <div className="bg-white p-6 rounded-lg shadow-md mt-6 col-span-1">
                <h2 className="text-lg font-bold text-gray-700 mb-3">🔍 Comparación de Novedades por Departamento</h2>
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Departamento</th>
                            <th className="py-3 px-6 text-center">Mes Anterior</th>
                            <th className="py-3 px-6 text-center">Mes Actual</th>
                            <th className="py-3 px-6 text-center">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {kpis.erroresPorProcesoMesActual.map((actual) => {
                            const anterior = kpis.erroresPorProcesoMesAnterior.find(e => e.departamento_id === actual.departamento_id) || { total: 0 };
                            const diferencia = actual.total - anterior.total;

                            return (
                                <tr key={actual.departamento_id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6">{actual.departamento_nombre}</td>
                                    <td className="py-3 px-6 text-center">{anterior.total}</td>
                                    <td className="py-3 px-6 text-center">{actual.total}</td>
                                    <td className={`py-3 px-6 text-center font-semibold 
                                        ${diferencia >= 0 ? "text-green-500" : "text-red-500"}`}>
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
    );
}
 