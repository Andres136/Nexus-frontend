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


  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Gestión de Meta Mensual</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block font-semibold">Año</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            min="2020"
            max="2100"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Mes</label>
       <select
  value={mes}
  onChange={e => setMes(Number(e.target.value))}
  className="w-full border px-3 py-2 rounded"
>
  {[...Array(12)].map((_, i) => (
    <option key={i+1} value={i+1}>
      {new Date(0,i).toLocaleString('es-CO',{month:'long'})}
    </option>
  ))}
</select>

        </div>

        <div>
          <label className="block font-semibold">Meta en millones</label>
          <input
            type="number"
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            step="0.01"
            min="0"
            required
          />
        </div>

        {errores && (
          <div className="col-span-full bg-red-100 text-red-800 px-3 py-2 rounded text-sm mt-2">
            {typeof errores === 'string' ? errores : Object.values(errores).flat().join(', ')}
          </div>
        )}

        <div className="col-span-full">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mt-2"
          >
            Guardar Meta
          </button>
        </div>
      </form>

      <section className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Resumen Anual</h3>
 <ResponsiveContainer width="100%" height={400}>
  <BarChart data={datosGrafico}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="mes" />

 <YAxis yAxisId="left" 
       domain={[0, 'dataMax + 1']}       // margen superior dinámico  
/>
<YAxis yAxisId="right"
       orientation="right"
       domain={[0, 100]}                 // siempre 0 a 100%
       tickFormatter={v => `${v}%`}     
/>


  <Tooltip
  formatter={(value, name) => {
    if (name === 'Cumplimiento %') {
      return [`${value.toFixed(2)}%`, name];
    }
    // Meta y órdenes están en millones
    return [`$${value.toLocaleString('es-CO')} M`, name];
  }}
/>

    <Legend />

    {/* Barras de Meta y Órdenes */}
    <Bar yAxisId="left" dataKey="meta" fill="#8884d8" name="Meta mensual" />
    
    <Bar yAxisId="left" dataKey="ordenes" fill="#82ca9d" name="Total órdenes">
      <LabelList
        dataKey="cumplimiento"
        position="insideTop"
        formatter={(value) =>
          value > 1000 ? '+1000%' : `${value.toFixed(1)}%`
        }
        fill="#111827"
        fontSize={12}
        fontWeight="bold"
      />
    </Bar>

    {/* Línea de cumplimiento */}
  <Line
  yAxisId="right"
  type="monotone"
  dataKey="cumplimiento"
  stroke="#f59e0b"
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



      </section>
    </div>
  );
}
