import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import clienteAxios from '../../config/axios';

export default function ResumenDashboard() {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    clienteAxios.get('/api/estadisticas-comerciales')
      .then(({ data: json }) => {
        setData(json);
        // Extraer meses únicos y ordenar
        const uniqueMonths = Array.from(new Set(json.map(item => item.mes))).sort();
        setMonths(uniqueMonths);
        // Por defecto, seleccionar el último mes
        const defaultMonth = uniqueMonths[uniqueMonths.length - 1] || '';
        setSelectedMonth(defaultMonth);
      })
      .catch(err => setError(err.message || 'Error al cargar datos'))
      .finally(() => setLoading(false));
  }, []);

  // Actualizar chartData cuando data o selectedMonth cambien
  useEffect(() => {
    if (selectedMonth) {
      const filtered = data.filter(item => item.mes === selectedMonth);
      setChartData(filtered);
    }
  }, [data, selectedMonth]);

  if (loading) return <div className="text-center p-4">Cargando datos...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  // Métricas a mostrar
  const metrics = [
    { key: 'total_gestiones', name: 'Gestiones', color: '#8884d8' },
    { key: 'total_cotizaciones', name: 'Cotizaciones', color: '#82ca9d' },
    { key: 'total_ordenes', name: 'Órdenes', color: '#ffc658' },
    { key: 'total_clientes', name: 'Clientes Nuevos', color: '#ff7361' }
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Comparativo por Usuario</h2>

      {/* Selector de mes */}
      <div>
        <label className="mr-2 font-medium">Seleccionar Mes:</label>
        <select
          className="border rounded p-2"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Gráfico de barras */}
      <div className="w-full h-64 bg-white p-4 rounded shadow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="usuario" />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map(m => (
              <Bar
                key={m.key}
                dataKey={m.key}
                name={m.name}
                fill={m.color}
                barSize={20}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
