import { useEffect, useState } from "react"
import clienteAxios from "../../config/axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export default function Errores() {
    const [errores, setErrores] = useState([])
    const [kpis, setKpis] = useState({ totalErrores: 0, erroresPorProceso: [] })

    useEffect(() => {
        obtenerErrores()
        obtenerKpis()
    }, [])

    // Obtener errores desde la API
    const obtenerErrores = async () => {
        const token = localStorage.getItem('token')
        try {
            const response = await clienteAxios.get('/api/errores', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setErrores(response.data)
        } catch (error) {
            console.log("Error obteniendo errores:", error)
        }
    }

    // Obtener KPIs desde la API
    const obtenerKpis = async () => {
        const token = localStorage.getItem('token')
        try {
            const response = await clienteAxios.get('/api/errores/kpi', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setKpis(response.data)
        } catch (error) {
            console.log("Error obteniendo KPIs:", error)
        }
    }

    // Colores para el gráfico de pastel
    const COLORS = ["#6B7280", "#EF4444", "#10B981", "#3B82F6", "#F59E0B"]

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📊 Dashboard de Errores</h1>

            {/* Layout con 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna de Métricas y Gráficos */}
                <div className="space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-md text-center">
                            <h2 className="text-xl font-bold text-gray-700">Total Errores</h2>
                            <p className="text-4xl font-semibold text-red-500">{kpis.totalErrores}</p>
                        </div>
                        {kpis.erroresPorProceso?.map((error, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-md text-center">
                                <h2 className="text-lg font-semibold text-gray-700">{error.proceso_nombre}</h2>
                                <p className="text-3xl font-semibold text-gray-800">{error.total}</p>
                            </div>
                        ))}
                    </div>

                    {/* Gráfico de Barras */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-bold text-gray-700 mb-3">Errores por Proceso</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={kpis.erroresPorProceso}>
                                <XAxis dataKey="proceso_nombre" stroke="#374151" />
                                <YAxis stroke="#374151" />
                                <Tooltip />
                                <Bar dataKey="total" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico de Pastel */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-bold text-gray-700 mb-3">Distribución de Errores</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={kpis.erroresPorProceso} dataKey="total" nameKey="proceso_nombre" cx="50%" cy="50%" outerRadius={80}>
                                    {kpis.erroresPorProceso?.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Columna de Errores */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-gray-700 mb-3">🔍 Últimos Errores Registrados</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {errores.length > 0 ? (
                            errores.map((error, index) => (
                                <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                    <p className="text-gray-700 font-semibold">{error.descripcion}</p>
                                    
                                    <p className="text-gray-500 text-sm">🕒 {new Date(error.created_at).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">No hay errores registrados.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
