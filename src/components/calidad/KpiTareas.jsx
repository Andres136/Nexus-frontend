import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function KpiTareas() {
  const [resumenTareas, setResumenTareas] = useState([]);
  const [nombreUsuario, setNombreUsuario] = useState('');
const [nombreDepartamento, setNombreDepartamento] = useState('');

  const cargarResumenTareas = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await clienteAxios.get('api/tareasKpi', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log('🧾 Respuesta cruda de /tareasKpi:', data); // 👈🏽 AQUI SE MUESTRA EL JSON
  
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
      const mapaResumen = {};
      data.resumen.forEach(item => {
        const mesIndex = item.mes - 1;
        mapaResumen[mesIndex] = {
          pendientes: parseInt(item.pendientes),
          completadas: parseInt(item.completadas)
        };
      });
  
      const formateado = meses.map((mes, index) => {
        const datos = mapaResumen[index] || { pendientes: 0, completadas: 0 };
        const userNames = data.usuarios.map(u => u.name).join(', ');
        const deptNames = data.departamentos.map(d => d.nombre).join(', ');
      
        return {
          mes,
          pendientes: datos.pendientes,
          completadas: datos.completadas,
          total: datos.pendientes + datos.completadas,
          usuarios: userNames,
          departamentos: deptNames
        };
      });
      
  
      console.log('📊 Datos formateados para el gráfico:', formateado); // 👈🏽 AQUI SE MUESTRA EL FORMATO FINAL
      if (data.usuarios.length > 0) {
        setNombreUsuario(data.usuarios[0].name);
      }
      if (data.departamentos.length > 0) {
        setNombreDepartamento(data.departamentos[0].nombre);
      }
      
      setResumenTareas(formateado);
    } catch (err) {
      console.error('❌ Error cargando resumen tareas:', err);
    }
  };
  

  useEffect(() => {
    cargarResumenTareas();
  }, []);

  return (
<div className="mb-2 text-sm text-gray-600">
<h3 className="text-lg font-semibold mb-4">Tareas Mensuales</h3>

<div className="mb-2 text-sm text-gray-600">
  {nombreUsuario && <p>👤 Usuario: <span className="font-medium">{nombreUsuario}</span></p>}
  {nombreDepartamento && <p>🏢 Departamento: <span className="font-medium">{nombreDepartamento}</span></p>}
</div>

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={resumenTareas}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="mes" />
    <YAxis />
    <Legend />
    <Line type="monotone" dataKey="pendientes" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Pendientes" />
    <Line type="monotone" dataKey="completadas" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Completadas" />
    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Total" />
    <Tooltip
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          const { usuarios, departamentos } = payload[0].payload;
          return (
            <div className="bg-white border rounded shadow p-2 text-sm">
              <p><strong>{label}</strong></p>
              <p className="text-red-500">🔴 Pendientes: {payload.find(p => p.dataKey === 'pendientes')?.value ?? 0}</p>
              <p className="text-green-600">✅ Completadas: {payload.find(p => p.dataKey === 'completadas')?.value ?? 0}</p>
              <p className="text-blue-600">📊 Total: {payload.find(p => p.dataKey === 'total')?.value ?? 0}</p>
              <p>👤 Usuarios: {usuarios}</p>
              <p>🏢 Departamentos: {departamentos}</p>
            </div>
          );
        }
        return null;
      }}
    />
  </LineChart>
</ResponsiveContainer>

</div>

  );
}
