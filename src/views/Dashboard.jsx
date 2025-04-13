// import{ useEffect, useState } from 'react';
// import ApexChart from 'react-apexcharts';

// import clienteAxios from '../config/axios';

// const Dashboard = () => {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//    try {
//     const token = localStorage.getItem('token');
//     const response = await clienteAxios.get('/api/dashboard', {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     setData(response.data);
    
//    } catch (error) {
//     console.error('Ocurrió un error al obtener los datos:', error);
//    }
//     };

//     fetchData();
//   }, []);

//   if (!data) return <p>Cargando datos...</p>;

//   const estados = [
//     {
//       name: 'Registradas',
//       value: data.registradas,
//       clientes: [],
//     },
//     {
//       name: 'En orden trabajo',
//       value: data.en_orden_trabajo,
//       clientes: data.en_orden_trabajo_detalle || [],
//     },
//     {
//       name: 'Listas',
//       value: data.listas,
//       clientes: data.listas_detalle || [],
//     },
//     {
//       name: 'Con faltantes',
//       value: data.faltantes,
//       clientes: data.faltantes_detalle || [],
//     },
//     {
//       name: 'Vencidas',
//       value: data.vencidas,
//       clientes: data.vencidas_detalle || [],
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 w-full px-4">
//     <div className="p-6 grid gap-6 col-span-1">
  
//       {/* Tarjetas resumen */}
//       <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//         {[
//           ['Órdenes', data.registradas],
//           ['En orden de trabajo', data.en_orden_trabajo],
//           ['Listas', data.listas],
//           ['Con faltantes', data.faltantes],
//           ['Vencidas', data.vencidas],
//           ['A entregar hoy', data.hoy],
//         ].map(([title, value], i) => (
//           <div key={i} className="bg-white p-4 rounded shadow text-center">
//             <h4 className="text-sm font-semibold">{title}</h4>
//             <p className="text-xl font-bold">{value}</p>
//           </div>
//         ))}
//       </div>
  
//       {/* Flujo de estados */}
//       <div className="bg-white p-4 rounded shadow w-full overflow-x-auto mb-6">
//         <h3 className="font-semibold mb-4">Flujo de estados</h3>
//         <div className="min-w-[300px]">
//           <ApexChart
//             type="bar"
//             height={300}
//             series={[
//               {
//                 name: 'Órdenes',
//                 data: estados.map((estado) => estado.value),
//               },
//             ]}
//             options={{
//               chart: { toolbar: { show: false } },
//               xaxis: {
//                 categories: estados.map((estado) => estado.name),
//               },
//               tooltip: {
//                 custom: function ({ series, seriesIndex, dataPointIndex }) {
//                   const estado = estados[dataPointIndex];
//                   const clientes = estado.clientes || [];
  
//                   return `
//                     <div style="padding: 8px; max-width: 250px;">
//                       <strong>${estado.name}</strong><br/>
//                       Total: ${estado.value}<br/>
//                       Clientes:<br/>
//                       <ul style="margin-left:10px; padding-left:10px;">
//                         ${clientes.map((c) => `<li>${c}</li>`).join('')}
//                       </ul>
//                     </div>
//                   `;
//                 },
//               },
//               colors: ['#3b82f6'],
//               responsive: [
//                 {
//                   breakpoint: 768,
//                   options: {
//                     chart: { height: 250 },
//                     xaxis: {
//                       labels: { rotate: -45, style: { fontSize: '10px' } },
//                     },
//                   },
//                 },
//               ],
//             }}
//           />
//         </div>
//       </div>
  
//       {/* Distribución por cliente */}
//       <div className="bg-white p-4 rounded shadow w-full overflow-x-auto mb-6">
//         <h3 className="font-semibold mb-4">Distribución por cliente</h3>
//         <div className="min-w-[300px]">
//           <ApexChart
//             type="pie"
//             height={300}
//             series={Object.values(data.por_cliente)}
//             options={{
//               labels: Object.keys(data.por_cliente),
//               legend: { position: 'bottom' },
//               tooltip: {
//                 y: {
//                   formatter: (val) => `${val} órdenes`,
//                 },
//               },
//             }}
//           />
//         </div>
//       </div>
  
//       {/* Órdenes por usuario */}
//       <div className="bg-white p-4 rounded shadow w-full overflow-x-auto mb-6">
//         <h3 className="font-semibold mb-4">Órdenes por usuario</h3>
//         <div className="min-w-[300px]">
//           <ApexChart
//             type="bar"
//             height={300}
//             series={[
//               {
//                 name: 'Órdenes',
//                 data: Object.values(data.por_usuario),
//               },
//             ]}
//             options={{
//               chart: { toolbar: { show: false } },
//               xaxis: { categories: Object.keys(data.por_usuario) },
//               colors: ['#10b981'],
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   </div>
  

//   );
// };

// export default Dashboard;
import ApexChart from 'react-apexcharts';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
  const { data, error, isLoading } = useDashboard();

  if (isLoading) return <p>Cargando datos...</p>;
  if (error) return <p>Error al obtener los datos.</p>;

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
  ];

  return (
    <div className="grid grid-cols-1 w-full px-4">
      <div className="p-6 grid gap-6 col-span-1">
        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            ['Órdenes', data.registradas],
            ['En orden de trabajo', data.en_orden_trabajo],
            ['Listas', data.listas],
            ['Con faltantes', data.faltantes],
            ['Vencidas', data.vencidas],
            ['A entregar hoy', data.hoy],
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
                colors: ['#3b82f6'],
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

        {/* Distribución por cliente */}
        <div className="bg-white p-4 rounded shadow w-full overflow-x-auto mb-6">
          <h3 className="font-semibold mb-4">Distribución por cliente</h3>
          <div className="min-w-[300px]">
            <ApexChart
              type="pie"
              height={300}
              series={Object.values(data.por_cliente)}
              options={{
                labels: Object.keys(data.por_cliente),
                legend: { position: 'bottom' },
                tooltip: {
                  y: {
                    formatter: (val) => `${val} órdenes`,
                  },
                },
              }}
            />
          </div>
        </div>

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
