import ApexChart from 'react-apexcharts';
import { useDashboard } from '../hooks/useDashboard';
import { useDashboardMonthly } from '../hooks/useDashboardMonthly';
import { useEffect, useState } from 'react';
import clienteAxios from '../config/axios';
import TopClientes from '../components/calidad/TopClientes';
import { Link } from 'react-router-dom';
import AlertStock from '../components/crm/AlertStock';
import { X, Volume2, VolumeX } from 'lucide-react';


const Dashboard = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const { data, error, isLoading } = useDashboard();
  const { data: monthly, isLoading: loading2, error: error2 } = useDashboardMonthly(month, year);

  // ✅ Estados para AlertStock
  const [showAlertStock, setShowAlertStock] = useState(false);
  const [alertAnimating, setAlertAnimating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  // ✅ NUEVO: Estado para controlar si ya se mostró en esta sesión
  const [alertDismissed, setAlertDismissed] = useState(false);

  // ✅ Función para reproducir sonido
  const playAlertSound = () => {
    if (!soundEnabled || hasPlayedSound) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      setHasPlayedSound(true);
    } catch (error) {
      console.warn('No se pudo reproducir el sonido:', error);
    }
  };

  // ✅ MODIFICADO: Mostrar AlertStock solo si no se ha cerrado antes
  useEffect(() => {
    if (data && !isLoading && !showAlertStock && !alertDismissed) {
      // Verificar si hay faltantes que requieren alerta
      if (data.faltantes > 0) {
        setTimeout(() => {
          setShowAlertStock(true);
          setAlertAnimating(true);
          playAlertSound();
        }, 1000);
      }
    }
  }, [data, isLoading, showAlertStock, alertDismissed]);

  // ✅ MODIFICADO: Cerrar AlertStock y marcar como cerrado
  const closeAlertStock = () => {
    setAlertAnimating(false);
    setAlertDismissed(true); // ✅ Marcar como cerrado en esta sesión
    setTimeout(() => {
      setShowAlertStock(false);
    }, 300);
  };

  // ✅ NUEVO: Función para mostrar alertas manualmente (resetea el estado)
  const showAlertManually = () => {
    setAlertDismissed(false); // ✅ Permite mostrar de nuevo
    setHasPlayedSound(false); // ✅ Permite reproducir sonido de nuevo
    setShowAlertStock(true);
    setAlertAnimating(true);
    playAlertSound();
  };

  // ✅ Toggle sonido
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

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
            
            {/* ✅ Control de sonido */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className={`p-2 rounded-lg transition ${
                  soundEnabled 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              {/* ✅ MODIFICADO: Botón para mostrar AlertStock manualmente */}
              {!showAlertStock && data?.faltantes > 0 && (
                <button
                  onClick={showAlertManually}
                  className={`px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm flex items-center gap-2 ${
                    alertDismissed 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {alertDismissed && (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  )}
                  Ver Alertas de Stock
                </button>
              )}
            </div>
          </div>

          {/* ✅ NUEVO: Indicador visual de alertas cerradas */}
          {alertDismissed && data?.faltantes > 0 && !showAlertStock && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-orange-700">
                      <strong>Alertas de stock ocultas.</strong> Hay {data.faltantes} órdenes con faltantes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={showAlertManually}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition"
                >
                  Mostrar
                </button>
              </div>
            </div>
          )}

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

          <TopClientes />
        </div>
      </div>

      {/* ✅ Modal AlertStock con animación y sonido */}
      {showAlertStock && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
          alertAnimating ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className={`bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden transition-all duration-300 ${
            alertAnimating 
              ? 'transform translate-y-0 scale-100 opacity-100' 
              : 'transform translate-y-8 scale-95 opacity-0'
          }`}>
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg animate-pulse">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">⚠️ Alerta de Stock Crítico</h2>
                  <p className="text-red-100 text-sm">Se han detectado faltantes de inventario</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {soundEnabled && (
                  <div className="bg-white/20 p-1 rounded animate-bounce">
                    <Volume2 className="w-4 h-4" />
                  </div>
                )}
                <button
                  onClick={closeAlertStock}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <AlertStock />
              
              {/* Botones de acción */}
              <div className="mt-6 flex flex-wrap gap-3 justify-end border-t pt-4">
                <Link
                  to="/auth/crm/ordenes-faltantes"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={closeAlertStock}
                >
                  Ver Órdenes Completas
                </Link>
                <button
                  onClick={closeAlertStock}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </>
  );
};

export default Dashboard;