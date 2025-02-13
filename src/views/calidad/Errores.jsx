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

    // Monitorear cambios en errores
    useEffect(() => {
        console.log("Errores actualizados:", errores)
    }, [errores])

    // Obtener errores desde la API
    const obtenerErrores = async () => {
        const token = localStorage.getItem('token')
        try {
            const response = await clienteAxios.get('/api/errores', {  // ✅ URL corregida
                headers: { Authorization: `Bearer ${token}` }
            })
            setErrores(response.data)  // ✅ Ahora almacena correctamente los errores
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
            console.log("KPIs:", response.data)
            setKpis(response.data)
        } catch (error) {
            console.log("Error obteniendo KPIs:", error)
        }
    }

    // Colores para el gráfico de pastel
    const COLORS = ["#ff6361", "#bc5090", "#ffa600"]

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard de Errores</h1>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg text-center">
                    <h2 className="text-xl font-bold">Total Errores</h2>
                    <p className="text-4xl font-semibold text-red-500">{kpis.totalErrores}</p>
                </div>
                {kpis.erroresPorProceso?.map((error, index) => (
                    <div key={index} className="bg-gray-900 text-white p-4 rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-bold">Proceso {error.proceso_nombre}</h2>
                        <p className="text-3xl font-semibold">{error.total}</p>
                    </div>
                ))}
            </div>

            {/* Gráfico de Barras */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold text-white mb-3">Errores por Proceso</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={kpis.erroresPorProceso}>
                        <XAxis dataKey="proceso_nombre" stroke="#ffffff" />
                        <YAxis stroke="#ffffff" />
                        <Tooltip />
                        <Bar dataKey="total" fill="#ff6361" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfico de Pastel */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg mt-6">
                <h2 className="text-lg font-bold text-white mb-3">Distribución de Errores</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={kpis.erroresPorProceso} dataKey="total" nameKey="proceso_nombre" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                            {kpis.erroresPorProceso?.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Tabla de Errores */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg mt-6">
                <h2 className="text-lg font-bold text-white mb-3">Últimos Errores</h2>
                <table className="w-full text-white">
                    <thead>
                        <tr className="bg-gray-800">
                            <th className="p-2">ID</th>
                            <th className="p-2">Descripción</th>
                            <th className="p-2">Proceso</th>
                            <th className="p-2">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {errores?.map((error, index) => (
                            <tr key={index} className="border-b border-gray-700">
                                <td className="p-2">{error.id}</td>
                                <td className="p-2">{error.descripcion}</td>
                                <td className="p-2">{error.proceso_id}</td>
                                <td className="p-2">{new Date(error.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
