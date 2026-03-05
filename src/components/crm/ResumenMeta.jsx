import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line, CartesianGrid, LabelList } from 'recharts';
import clienteAxios from '../../config/axios';
import { toast } from 'react-toastify';

export default function ResumenMeta() {
  const currentDate = new Date();
  const [anio, setAnio] = useState(currentDate.getFullYear());
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [meta, setMeta] = useState('');
  const [errores, setErrors] = useState(null);
  const [datosGrafico, setDatosGrafico] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await clienteAxios.post(
        '/api/meta-mensual',
        {
          anio,
          mes,
          valor_meta: parseFloat(meta) || 0
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message);
      setErrors(null);
      setMeta('');
      obtenerDatosGrafico(); // Refrescar gráfico
    } catch (error) {
      console.error('Error al registrar la meta:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data.errors || error.response.data.message);
      } else {
        setErrors('Error inesperado. Intenta más tarde.');
      }
    }
  };

  const obtenerDatosGrafico = async (userId = null, mesFiltro = null) => {
    const token = localStorage.getItem('token');

    try {
      const response = await clienteAxios.get('/api/meta-mensual/resumen', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          user_id: userId,
          mes: mesFiltro
        }
      });

      const data = response.data.data.map(item => ({
        mes: item.mes,
        meta: item.meta_millones,
        ordenes: item.ordenes_millones,
        cumplimiento: item.cumplimiento
      }));

      setDatosGrafico(data);
    } catch (error) {
      console.error('Error al obtener datos del gráfico:', error);
    }
  };

  // Dentro de tu componente, antes del return:
  const periodo = `${anio}-${String(mes).padStart(2, '0')}`;
  useEffect(() => {
    obtenerDatosGrafico(null, periodo);
  }, [periodo]);

// ...existing code...
  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
            Gestión de Meta Mensual
          </h2>
          <p className="text-blue-100 text-sm text-center mt-1">
            Registra y visualiza el cumplimiento por periodo
          </p>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                min="2020"
                max="2100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mes</label>
              <select
                value={mes}
                onChange={e => setMes(Number(e.target.value))}
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg bg-white capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('es-CO', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta en millones</label>
              <input
                type="number"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                step="0.01"
                min="0"
                required
              />
            </div>

            {errores && (
              <div className="col-span-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {typeof errores === 'string' ? errores : Object.values(errores).flat().join(', ')}
              </div>
            )}

            <div className="col-span-full">
              <button
                type="submit"
                className="w-full md:w-auto md:px-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition shadow-sm"
              >
                Guardar Meta
              </button>
            </div>
          </form>

          <section className="mt-6 bg-gray-50 border border-gray-100 p-4 md:p-6 rounded-xl shadow-inner">
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-center text-gray-700">
              Resumen Anual
            </h3>

            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fill: '#374151', fontSize: 12 }} />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 'dataMax + 1']}
                    tick={{ fill: '#374151', fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fill: '#374151', fontSize: 12 }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'Cumplimiento %') {
                        return [`${value.toFixed(2)}%`, name];
                      }
                      return [`$${value.toLocaleString('es-CO')} M`, name];
                    }}
                  />

                  <Legend wrapperStyle={{ fontSize: 13 }} />

                  <Bar yAxisId="left" dataKey="meta" fill="#6366f1" name="Meta mensual" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="left" dataKey="ordenes" fill="#10b981" name="Total órdenes" radius={[8, 8, 0, 0]}>
                    <LabelList
                      dataKey="cumplimiento"
                      position="insideTop"
                      formatter={(value) => (value > 1000 ? '+1000%' : `${value.toFixed(1)}%`)}
                      fill="#111827"
                      fontSize={12}
                      fontWeight="bold"
                    />
                  </Bar>

                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumplimiento"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Cumplimiento %"
                  >
                    <LabelList
                      dataKey="cumplimiento"
                      position="top"
                      formatter={(v) => `${v.toFixed(1)}%`}
                    />
                  </Line>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

}
