import  { useState } from 'react';
import useResumenMensual from '../../hooks/useResumenMensual';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ResumenMensualTareas() {
  const [filtros, setFiltros] = useState({ user_id: '', departamento_id: '' });

  const { resumen, usuarios, departamentos, cargando, error } = useResumenMensual(filtros);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">📈 Resumen Mensual de Tareas</h2>

      <div className="flex gap-4 mb-6">
        <select
          value={filtros.user_id}
          onChange={(e) => setFiltros({ ...filtros, user_id: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Todos los usuarios</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <select
          value={filtros.departamento_id}
          onChange={(e) => setFiltros({ ...filtros, departamento_id: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Todos los departamentos</option>
          {departamentos.map((d) => (
            <option key={d.id} value={d.id}>{d.nombre}</option>
          ))}
        </select>
      </div>

      {cargando && <p>Cargando datos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!cargando && resumen.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={resumen}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pendientes" stroke="#FFA500" name="Pendientes" />
            <Line type="monotone" dataKey="completadas" stroke="#00C49F" name="Completadas" />
            <Line type="monotone" dataKey="total" stroke="#0088FE" name="Total" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
