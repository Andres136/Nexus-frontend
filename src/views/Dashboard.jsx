import ApexChart from 'react-apexcharts';
import { useDashboard } from '../hooks/useDashboard';
import { useDashboardMonthly } from '../hooks/useDashboardMonthly';
import { useEffect, useState } from 'react';
import clienteAxios from '../config/axios';

import { Link } from 'react-router-dom';
import NexusLoader from '../components/NexusLoader';









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
    const x = clamp(event.clientX + 16, 12, vw - 380);
    const y = clamp(event.clientY + 16, 12, vh - 220);
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
      <NexusLoader text='Cargando datos del dashboard...' />
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

  const { total_despachadas = 0, vencidas = 0, pendientes = 0 } = monthly || {};

  return (
    <>
      <div className="grid grid-cols-1 w-full px-4">
        <div className="p-6 grid gap-6 col-span-1">
          {/* Botón PDF y control de sonido */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={descargarpdf}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
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

          {/* Resto del código del dashboard... */}
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
                  tooltip: { enabled: false },
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
                Total: <span className="font-semibold">{tipEstado.value}</span>
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

          {/* Selección de mes/año y gráfico mensual */}
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
              {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded shadow w-full overflow-x-auto mb-6">
            <h3 className="font-semibold mb-4">Estadísticas {month}/{year}</h3>
            <Link
              to="/auth/crm/ordenes-compra-auditor"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Ver detalles
            </Link>
            <ApexChart
              type="donut"
              height={300}
              series={[total_despachadas, vencidas, pendientes]}
              options={{
                labels: ['Despachadas', 'Vencidas', 'Pendientes'],
                legend: { position: 'bottom' },
                colors: ['#16a34a', '#dc2626', '#f59e0b'],
                plotOptions: {
                  pie: {
                    donut: {
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: 'Órdenes',
                          formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
                        },
                      },
                    },
                  },
                },
              }}
            />
          </div>

        </div>
      </div>




    </>
  );
};

export default Dashboard;