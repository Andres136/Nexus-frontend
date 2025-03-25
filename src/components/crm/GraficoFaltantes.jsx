import { useEffect, useState } from "react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid
} from "recharts";
import clienteAxios from "../../config/axios";

export default function GraficoFaltantes() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioId, setUsuarioId] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [entregas, setEntregas] = useState([]);
    const [faltantes, setFaltantes] = useState([]);
    const fetchData = () => {
        const token = localStorage.getItem("token");
        clienteAxios
          .get("/api/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              usuario_id: usuarioId,
              fecha_inicio: fechaInicio,
              fecha_fin: fechaFin,
            },
          })
          .then((res) => {
            setEntregas(res.data.entregas);
            setFaltantes(res.data.faltantes);
          })
          .catch((err) => console.error("Error al cargar datos filtrados", err));
      };
    
      useEffect(() => {
        const token = localStorage.getItem("token");
        clienteAxios
          .get("/api/usuarios", { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => setUsuarios(res.data))
          .catch((err) => console.error("Error al cargar usuarios", err));
      }, []);
  return (
    <div className="bg-white mt-10 p-6 rounded shadow-md">
    <h2 className="text-lg font-bold mb-4 text-center">📊 Seguimiento con Filtros</h2>

    <div className="flex flex-wrap gap-4 mb-4">
      <select
        value={usuarioId}
        onChange={(e) => setUsuarioId(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Todos los usuarios</option>
        {usuarios.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="date"
        value={fechaFin}
        onChange={(e) => setFechaFin(e.target.value)}
        className="border p-2 rounded"
      />

      <button
        onClick={fetchData}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Filtrar
      </button>
    </div>

    {/* Gráfico de entregas */}
    {entregas.length > 0 && (
      <div className="mb-10">
        <h3 className="text-center font-semibold mb-2">📦 Entregas por Usuario</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={entregas} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="creador" type="category" />
            <Tooltip />
            <Bar dataKey="total_entregas" fill="#3b82f6">
              <LabelList dataKey="total_entregas" position="insideRight" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}

    {/* Gráfico de faltantes */}
    {faltantes.length > 0 && (
      <div>
        <h3 className="text-center font-semibold mb-2">🚨 Órdenes con Faltantes</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={faltantes} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="creador" type="category" />
            <Tooltip />
            <Bar dataKey="faltantes">
              <LabelList dataKey="estado" position="insideRight" fill="#fff" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
  )
}
