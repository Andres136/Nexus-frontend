import { useEffect, useState } from 'react';
import clienteAxios from '../config/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState({
    num_ultimas_ordenes: 0,
    num_ordenes_vencidas: 0,
    num_ordenes_trabajo_faltantes: 0,
    num_ordenes_completadas: 0,
    ordenes_por_mes: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    clienteAxios
      .get("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((error) => {
        console.error("Error al cargar el dashboard:", error);
      });
  }, []);

  // ✅ Validamos antes de usar .map()
  const ordenesPorMesChartData = Array.isArray(data.ordenes_por_mes)
    ? data.ordenes_por_mes.map(orden => ({
        fecha: orden.mes,
        total: orden.total_ordenes,
      }))
    : [];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>

    
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-100 p-4 rounded-md shadow text-center">
          <h2 className="text-lg font-bold mb-2">Órdenes de Compra del Mes</h2>
          <p className="text-4xl font-bold text-blue-600">{data.num_ultimas_ordenes}</p>
        </div>

        <div className="bg-red-100 p-4 rounded-md shadow text-center">
          <h2 className="text-lg font-bold mb-2">Órdenes Vencidas</h2>
          <p className="text-4xl font-bold text-red-600">{data.num_ordenes_vencidas}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded-md shadow text-center">
          <h2 className="text-lg font-bold mb-2">Órdenes con Faltantes</h2>
          <p className="text-4xl font-bold text-yellow-600">{data.num_ordenes_trabajo_faltantes}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-md shadow text-center">
          <h2 className="text-lg font-bold mb-2">Órdenes Completadas</h2>
          <p className="text-4xl font-bold text-green-600">{data.num_ordenes_completadas}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Gráfico de Barras - Órdenes por Mes */}
        <div className=" col-span-2 bg-blue-100 p-6 rounded-md shadow">
          <h2 className="text-lg font-bold mb-2 text-center">Órdenes de Compra por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordenesPorMesChartData} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fill: "#374151", fontSize: 14 }} />
              <YAxis tick={{ fill: "#374151", fontSize: 14 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563EB" radius={[10, 10, 0, 0]}>
                <LabelList dataKey="total" position="top" fill="#1E40AF" fontSize={14} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
