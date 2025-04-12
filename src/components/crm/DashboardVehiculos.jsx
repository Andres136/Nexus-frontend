import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
  Cell,
  Pie
} from 'recharts';
import { Link } from "react-router-dom";
import { Car, Wrench, AlertCircle, FileBarChart2, PieChart } from "lucide-react";

export default function DashboardVehiculos() {
  const [data, setData] = useState({
    total_vehiculos: 0,
    mantenimientos_pendientes: 0,
    mantenimientos_proximos: 0,
    mantenimientos_realizados: 0,
    soat: {
      vencidos: 0,
      por_vencer: 0,
    },
    inspecciones: {
      actual: 0,
      anterior: 0,
    },
    gastos: {
      actual: 0,
      anterior: 0,
    },
    historico_gastos: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    clienteAxios.get('/api/dashboard-vehiculos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log('Dashboard data:', response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);
      });
  }, []);

  const variacion = (actual, anterior) => {
    if (anterior === 0) return 'N/A';
    const cambio = ((actual - anterior) / anterior) * 100;
    return `${cambio > 0 ? '↑' : '↓'} ${Math.abs(cambio).toFixed(1)}%`;
  };

  const progreso = () => {
    const total = data.mantenimientos_pendientes + data.mantenimientos_realizados;
    if (total === 0) return 0;
    return ((data.mantenimientos_realizados / total) * 100).toFixed(1);
  };

  const chartData = [
    {
      name: 'Gastos',
      Actual: data.gastos.actual,
      Anterior: data.gastos.anterior,
    },
    {
      name: 'Inspecciones',
      Actual: data.inspecciones.actual,
      Anterior: data.inspecciones.anterior,
    },
    {
      name: 'Mtto Realizados',
      Actual: data.mantenimientos_realizados,
      Anterior: data.mantenimientos_pendientes,
    }
  ];
 


  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard de Flota Vehicular</h1>
        <div className="w-full md:w-auto space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
          <Link to="/auth/crm/vehiculos-all" className="bg-blue-500 text-white w-full text-center px-4 py-2 rounded-lg shadow hover:bg-blue-600 text-sm">Ver Vehículos</Link>
          <Link to="/auth/crm/vehiculos-register" className="bg-green-500 text-white w-full text-center px-4 py-2 rounded-lg shadow hover:bg-green-600 text-sm">Registrar Vehículo</Link>
          <Link to="/auth/crm/vehiculos-documentos" className="bg-purple-500 text-white w-full text-center px-4 py-2 rounded-lg shadow hover:bg-purple-600 text-sm">Registrar Documento</Link>
          <Link to="/auth/crm/vehiculos-inspecciones" className="bg-orange-500 text-white w-full text-center px-4 py-2 rounded-lg shadow hover:bg-orange-600 text-sm">Registrar Inspección</Link>
          <Link to="/auth/crm/vehiculos-mantenimientos" className="bg-rose-500 text-white w-full text-center px-4 py-2 rounded-lg shadow hover:bg-rose-600 text-sm">Registrar Mantenimiento</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded-2xl shadow flex items-center gap-4">
          <Car className="w-10 h-10" />
          <div>
            <h2 className="text-lg">Total Vehículos</h2>
            <p className="text-3xl font-bold">{data.total_vehiculos}</p>
          </div>
        </div>

        <div className="bg-red-500 text-white p-4 rounded-2xl shadow flex items-center gap-4">
          <Wrench className="w-10 h-10" />
          <div>
            <h2 className="text-lg">Mtto Pendientes</h2>
            <p className="text-3xl font-bold">{data.mantenimientos_pendientes}</p>
            <p className="text-xs">{progreso()}% completados</p>
          </div>
        </div>
        <div className="bg-purple-500 text-white p-4 rounded-2xl shadow flex items-center gap-4">
  <FileBarChart2 className="w-10 h-10" />
  <div>
    <h2 className="text-lg">📄 Documentos</h2>
    <p className="text-sm">❌ Vencidos: {data.documentos_estado?.vencidos ?? 0}</p>
    <p className="text-sm">⚠️ Por vencer: {data.documentos_estado?.por_vencer ?? 0}</p>
    <p className="text-sm">✅ Vigentes: {data.documentos_estado?.vigentes ?? 0}</p>
  </div>
</div>



        <div className="bg-green-500 text-white p-4 rounded-2xl shadow flex items-center gap-4">
          <FileBarChart2 className="w-10 h-10" />
          <div>
            <h2 className="text-lg">Gastos Totales</h2>
            <p className="text-xl font-bold">$ {data.gastos.actual.toLocaleString()}</p>
            <p className="text-sm text-white/80">{variacion(data.gastos.actual, data.gastos.anterior)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow p-4 rounded-2xl border">
          <h3 className="text-lg font-semibold mb-2">Progreso de Mantenimientos</h3>
          <p className="mb-1 text-sm">{data.mantenimientos_realizados} de {data.mantenimientos_realizados + data.mantenimientos_pendientes} completados</p>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-green-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progreso()}%` }}></div>
          </div>
        </div>
        {data.ultimos_mantenimientos?.length > 0 && (
  <div className="mt-4">
  
    <ul className="text-xs mt-1 space-y-1 text-gray-700">
    {data.ultimos_mantenimientos?.length > 0 && (
  <div className="bg-white shadow p-4 rounded-2xl border mt-4">
    <h3 className="text-lg font-semibold mb-2">🛠️ Últimos Mantenimientos Realizados</h3>
    <ul className="text-sm text-gray-700 space-y-1">
      {data.ultimos_mantenimientos.map((m) => (
        <li key={m.id}>
          • {m.vehiculo?.placa ?? "Vehículo"} — {m.fecha_realizado}
        </li>
      ))}
    </ul>
  </div>
)}

    </ul>
  </div>
)}

        <div className="bg-white shadow p-4 rounded-2xl border">
          <h3 className="text-lg font-semibold mb-2">Inspecciones</h3>
          <p className="text-base">Actual: {data.inspecciones.actual}</p>
          <p className="text-base">Anterior: {data.inspecciones.anterior}</p>
          <p className="text-sm text-green-600">{variacion(data.inspecciones.actual, data.inspecciones.anterior)}</p>
        </div>
      </div>

      <div className="bg-white shadow mt-8 p-4 rounded-2xl border">
        <h3 className="text-lg font-semibold mb-4">Comparativo Mensual</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Actual" fill="#3b82f6" name="Actual" />
            <Bar dataKey="Anterior" fill="#facc15" name="Anterior" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow mt-8 p-4 rounded-2xl border">
        <h3 className="text-lg font-semibold mb-4">Gastos Anuales</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.historico_gastos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#10b981" name="Gastos" />
          </LineChart>
        </ResponsiveContainer>
      </div>
   

    </div>
  );
}
