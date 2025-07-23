
import ApexChart from 'react-apexcharts';
import { useDashboard } from '../hooks/useDashboard';
import { useDashboardMonthly } from '../hooks/useDashboardMonthly';
import { useEffect, useState } from 'react';
import clienteAxios from '../config/axios';
import TopClientes from '../components/calidad/TopClientes';

const Dashboard = () => {

    // — Mes/año para la vista mensual —
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year,  setYear]  = useState(today.getFullYear());
  const { data, error, isLoading } = useDashboard();

   // — Hook para estadísticas mensuales —
   const { data: monthly, isLoading: loading2, error: error2 } =
   useDashboardMonthly(month, year);
  // Función para enviar notificaciones de tareas vencidas
  const generarNotificaciones = async () => {
    const token = localStorage.getItem("token");
    try {
      await clienteAxios.get("api/notificar-ordenes", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error al generar notificaciones:", error);
    }
  }
const descargarpdf = async ()=>{
  try {
    const token = localStorage.getItem("token");
    const response = await clienteAxios.get("api/dashboard/ordenespdf", {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob', // Importante para descargar archivos
    });

    // Crear un enlace temporal para descargar el PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ordenes_criticas.pdf'); // Nombre del archivo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Liberar memoria
  } catch (error) {
    console.error("Error al descargar PDF:", error);
  }
}

  // useEffect para cargar tareas y generar notificaciones
  useEffect(() => {
    generarNotificaciones();
  }, []);


  if (isLoading || loading2) return <p>Cargando datos...</p>;
  if (error || error2) return <p>Error al obtener los datos.</p>;

  const estados = [
    {
      name: 'Registradas',
      value: data.registradas,
      clientes: [],
    },
    {
      name: 'En orden trabajo',
      value: data.en_orden_trabajo,
      clientes: data.en_orden_trabajo_detalle || [],
    },
    {
      name: 'Listas',
      value: data.listas,
      clientes: data.listas_detalle || [],
    },
    {
      name: 'Con faltantes',
      value: data.faltantes,
      clientes: data.faltantes_detalle || [],
    },
    {
      name: 'Vencidas',
      value: data.vencidas,
      clientes: data.vencidas_detalle || [],
    },
    {
      name: 'Entrega Parcial',
      value: data.entrega_parcial,
      clientes: data.entrega_parcial_detalle || [],
    },
  ];



  const { despachadas, vencidas, pendientes } = monthly;

  return (
    <div className="grid grid-cols-1 w-full px-4">

      
      <div className="p-6 grid gap-6 col-span-1">


        <div className="flex justify-between items-center mb-6">
          <button onClick={descargarpdf} className="bg-blue-500 text-white px-4 py-2 rounded">
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
            ['Entrega Parcial', data.entrega_parcial], // ✅ NUEVA TARJETA
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
          <div className="min-w-[300px]">
            <ApexChart
              type="bar"
              height={300}
              series={[
                {
                  name: 'Órdenes',
                  data: estados.map((estado) => estado.value),
                },
              ]}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: {
                  categories: estados.map((estado) => estado.name),
                },
                tooltip: {
                  custom: function ({ series, seriesIndex, dataPointIndex }) {
                    const estado = estados[dataPointIndex];
                    const clientes = estado.clientes || [];

                    return `
                      <div style="padding: 8px; max-width: 250px;">
                        <strong>${estado.name}</strong><br/>
                        Total: ${estado.value}<br/>
                        Clientes:<br/>
                        <ul style="margin-left:10px; padding-left:10px;">
                          ${clientes.map((c) => `<li>${c}</li>`).join('')}
                        </ul>
                      </div>
                    `;
                  },
                },
                colors: ['#3b82f6']
                ,
                responsive: [
                  {
                    breakpoint: 768,
                    options: {
                      chart: { height: 250 },
                      xaxis: {
                        labels: { rotate: -45, style: { fontSize: '10px' } },
                      },
                    },
                  },
                ],
              }}
            />
          </div>
        </div>

     {/* — Selección de mes/año — */}
     <div className="flex items-center gap-4 mb-6">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* — Gráfico mensual — */}
        <div className="bg-white p-4 rounded shadow w-full overflow-x-auto mb-6">
          <h3 className="font-semibold mb-4">
            Estadísticas {month}/{year}
          </h3>
          <ApexChart
        type="pie"
        height={300}
        series={[despachadas, vencidas, pendientes]}
        options={{
          labels: ["Despachadas", "Vencidas", "Pendientes"],
          legend: { position: "bottom" },
        }}
      />
        </div>

        <TopClientes/>

        {/* Órdenes por usuario */}
        <div className="bg-white p-4 rounded shadow w-full overflow-x-auto mb-6">
          <h3 className="font-semibold mb-4">Órdenes por usuario</h3>
          <div className="min-w-[300px]">
            <ApexChart
              type="bar"
              height={300}
              series={[
                {
                  name: 'Órdenes',
                  data: Object.values(data.por_usuario),
                },
              ]}
              options={{
                chart: { toolbar: { show: false } },
                xaxis: { categories: Object.keys(data.por_usuario) },
                colors: ['#10b981'],
              }}
            />
          </div>
        </div>
      </div>
   
    </div>
  );
  
};

export default Dashboard;
