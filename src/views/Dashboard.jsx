import ApexChart from 'react-apexcharts';
import { useDashboard } from '../hooks/useDashboard';
import { useDashboardMonthly } from '../hooks/useDashboardMonthly';
import { useEffect, useState } from 'react';
import clienteAxios from '../config/axios';
import TopClientes from '../components/calidad/TopClientes';

const Dashboard = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const { data, error, isLoading } = useDashboard();
  const { data: monthly, isLoading: loading2, error: error2 } = useDashboardMonthly(month, year);

  // Tooltip externo
  const [tipOpen, setTipOpen] = useState(false);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const [tipEstado, setTipEstado] = useState(null);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const updateTipPos = (event) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = clamp(event.clientX + 16, 12, vw - 380); // ancho aprox 360px
    const y = clamp(event.clientY + 16, 12, vh - 220); // alto aprox 200px
    setTipPos({ x, y });
  };

  const generarNotificaciones = async () => {
    const token = localStorage.getItem('token');
    try {
      await clienteAxios.get('api/notificar-ordenes', {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error al generar notificaciones:', error);
    }
  };

  const descargarpdf = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await clienteAxios.get('api/dashboard/ordenespdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ordenes_criticas.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
    }
  };

  useEffect(() => {
    generarNotificaciones();
  }, []);

  if (isLoading || loading2)
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg
          className="animate-spin h-8 w-8 text-blue-600 mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        <span className="text-blue-700 font-semibold">
          Cargando datos del dashboard...
        </span>
      </div>
    );

  if (error || error2) return <p>Error al obtener los datos.</p>;

  const estados = [
    { name: 'Registradas', value: data.registradas, clientes: data.registradas_detalle || [] },
    { name: 'En orden trabajo', value: data.en_orden_trabajo, clientes: data.en_orden_trabajo_detalle || [] },
    { name: 'Listas', value: data.listas, clientes: data.listas_detalle || [] },
    { name: 'Con faltantes', value: data.faltantes, clientes: data.faltantes_detalle || [] },
    { name: 'Vencidas', value: data.vencidas, clientes: data.vencidas_detalle || [] },
    { name: 'Entrega Parcial', value: data.entrega_parcial, clientes: data.entrega_parcial_detalle || [] },
  ];

  const { despachadas, vencidas, pendientes } = monthly;

  return (
    <div className="grid grid-cols-1 w-full px-4">
      <div className="p-6 grid gap-6 col-span-1">
        {/* Botón PDF */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={descargarpdf}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {[
            ['Órdenes', data.registradas],
            ['En orden de trabajo', data.en_orden_trabajo],
            ['Listas', data.listas],
            ['Con faltantes', data.faltantes],
            ['Vencidas', data.vencidas],
            ['A entregar hoy', data.hoy],
            ['Entrega Parcial', data.entrega_parcial],
          ].map(([title, value], i) => (
            <div key={i} className="bg-white p-4 rounded shadow text-center">
              <h4 className="text-sm font-semibold">{title}</h4>
              <p className="text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Flujo de estados */}
        <div className="bg-white p-4 rounded shadow w-full overflow-x-auto mb-6">
          <h3 className="font-semibold mb-4">Flujo de estados</h3>
          <div style={{ minWidth: `${estados.length * 130}px` }}>
            <ApexChart
              type="bar"
              height={300}
              series={[{ name: 'Órdenes', data: estados.map((e) => e.value) }]}
              options={{
                chart: {
                  toolbar: { show: false },
                  events: {
                    dataPointMouseEnter: (event, chartCtx, { dataPointIndex }) => {
                      const estado = estados[dataPointIndex];
                      setTipEstado(estado);
                      setTipOpen(true);
                      updateTipPos(event);
                    },
                    mouseMove: (event) => {
                      if (tipOpen) updateTipPos(event);
                    },
                  },
                },
                xaxis: { categories: estados.map((e) => e.name) },
                tooltip: { enabled: false }, // 🔴 tooltip nativo desactivado
                colors: ['#3b82f6'],
              }}
            />
          </div>
        </div>

        {/* Tooltip externo */}
        {tipOpen && tipEstado && (
          <div
            className="fixed z-50 bg-white shadow-xl rounded-lg border border-gray-200 p-3"
            style={{
              top: tipPos.y,
              left: tipPos.x,
              maxWidth: 360,
              width: 'max-content',
            }}
            onMouseLeave={() => setTipOpen(false)}
          >
            <div className="flex justify-between items-center gap-6 mb-2">
              <div className="font-semibold">{tipEstado.name}</div>
              <button
                className="text-gray-400 hover:text-gray-700"
                onClick={() => setTipOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="text-sm mb-2">
              Total:{' '}
              <span className="font-semibold">{tipEstado.value}</span>
            </div>

            <div className="max-h-40 overflow-y-auto pr-2">
              <ul className="list-disc pl-5 text-sm leading-snug">
                {(tipEstado.clientes || []).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Selección de mes/año */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>
        </div>

        {/* Gráfico mensual */}
        <div className="bg-white p-4 rounded shadow w-full overflow-x-auto mb-6">
          <h3 className="font-semibold mb-4">
            Estadísticas {month}/{year}
          </h3>
          <ApexChart
            type="pie"
            height={300}
            series={[despachadas, vencidas, pendientes]}
            options={{
              labels: ['Despachadas', 'Vencidas', 'Pendientes'],
              legend: { position: 'bottom' },
            }}
          />
        </div>

        <TopClientes />
      </div>
    </div>
  );
};

export default Dashboard;
