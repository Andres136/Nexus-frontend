import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import clienteAxios from '../../config/axios';

export default function TopClientes() {
  const [data, setData] = useState([]);
  const [mes, setMes] = useState('');

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Enero = 0, por eso sumamos 1

    const fetchTopClientes = async () => {
      try {
        const response = await clienteAxios.get(`/api/top-clients?year=${year}&month=${month}`);
        setData(response.data.clientes_top);
        setMes(response.data.mes);
      } catch (error) {
        console.error("Error al cargar el reporte de clientes:", error);
      }
    };

    fetchTopClientes();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Top Clientes – {mes}</h2>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" tick={{ fontSize: 12 }} angle={-15} interval={0} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="cantidad_ordenes" name="Órdenes de Compra" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
