import { useState } from 'react';
import { 
  Package, ShoppingCart, ClipboardCheck, Truck, 
  CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, Beaker 
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetDashboardOperativo } from '../../hooks/calidad/useGetDasboardOperativo';
import {useSedes} from "../../hooks/useSedes";
import MantenimientoCalendar from '../../components/tic/MantenimientoCalendar';
import  {RevisarOtApi} from "../../services/api";
import { showToast } from '../../helpers/utils/showToast';
import { useClientes } from '../../hooks/useClientes';
import  NexusLoader from '../../components/NexusLoader';
import Select from 'react-select';


const VSMCard = ({ orden }) => {
  const [showProducts, setShowProducts] = useState(false);
const queryClient = useQueryClient();
  const getStatusConfig = (estado) => {
    const configs = {
      'ENTREGADO': { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Entregado' },
      'EN_RUTA': { color: 'bg-blue-100 text-blue-800', icon: Truck, label: 'En Ruta' },
      'LISTO_PARA_DESPACHO': { color: 'bg-indigo-100 text-indigo-800', icon: ClipboardCheck, label: 'Listo Despacho' },
      'EN_ALISTAMIENTO': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Alistando' },
      'REQUIERE_HOMOLOGACION': { color: 'bg-purple-100 text-purple-800', icon: Beaker, label: 'Homologar' },
      'STOCK_INSUFICIENTE': { color: 'bg-orange-100 text-orange-800', icon: Package, label: 'Stock Parcial' },
      'ESPERANDO_PROVEEDOR': { color: 'bg-pink-100 text-pink-800', icon: ShoppingCart, label: 'En Compra' },
      'SIN_STOCK': { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Sin Existencias' },
    };
    return configs[estado] || { color: 'bg-gray-100 text-gray-800', icon: Package, label: estado };
  };

  const getProductStatusColor = (estado) => {
    switch (estado) {
      case 'OK': return 'bg-green-500';            
      case 'HOMOLOGABLE': return 'bg-purple-500';
      case 'SIN_STOCK': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };
const marcarDocumentoRevisado = async () => {
  try {
   const response = await RevisarOtApi.revisar(orden.orden_trabajo_id);
   showToast('success',response.data.message );
    queryClient.invalidateQueries(['dashboardOperativo']); // Refresca el dashboard
    // 🔥 actualización visual inmediata
    orden.documento_revisado_at = new Date();

  } catch (error) {
    console.error("Error revisando documento", error);
  }
};
  const config = getStatusConfig(orden.estado_vsm);
  const StatusIcon = config.icon;

  return (
    <div className={`bg-white border rounded-xl shadow-sm transition-all duration-200 ${showProducts ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
<div className="mb-3">
  <button
    onClick={marcarDocumentoRevisado}
    className={`px-3 py-1 text-xs font-bold rounded-lg transition
      ${
        orden.revisada
          ? 'bg-green-100 text-green-700'
          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      }`}
  >
    {orden.revisada 
      ? '✔ OT Revisada' 
      : 'Marcar como Revisada'}
  </button>
</div>
          
     <div>
  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
    {orden.numero || `OC #${orden.orden_id}`}
  </h3>

  <p className="text-sm text-gray-500">
    OT #{orden.orden_trabajo_id || 'N/A'}
  </p>

  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
    {orden.cliente}
  </p>
</div>
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${config.color}`}>
            <StatusIcon size={12} />
            {config.label}
          </span>
        </div>

        {/* 🔹 NUEVO: SEMÁFORO DE PRODUCTOS (CONTROL VISUAL RÁPIDO) */}
        <div className="flex gap-1 mb-5 h-1.5 w-full rounded-full overflow-hidden bg-gray-100">
          {orden.productos.map((prod, idx) => (
            <div 
              key={idx} 
              className={`h-full flex-1 ${getProductStatusColor(prod.estado)}`}
              title={`Producto: ${prod.producto} - ${prod.estado}`}
            />
          ))}
        </div>

        {/* VSM Flow Visualizer */}
        <div className="relative flex justify-between items-center mb-6 px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          
          <div className={`z-10 p-2 rounded-full border-2 bg-white ${orden.inventario.estado === 'STOCK_OK' ? 'border-green-500 text-green-600' : 'border-gray-200 text-gray-300'}`}>
            <Package size={18} />
          </div>
          <div className={`z-10 p-2 rounded-full border-2 bg-white ${orden.alistamiento.estado === 'ALISTADO' ? 'border-green-500 text-green-600' : (orden.alistamiento.estado === 'EN_ALISTAMIENTO' ? 'border-yellow-500 text-yellow-600' : 'border-gray-200 text-gray-300')}`}>
            <ClipboardCheck size={18} />
          </div>
          <div className={`z-10 p-2 rounded-full border-2 bg-white ${orden.despacho.estado === 'ENTREGADO' ? 'border-green-500 text-green-600' : (orden.despacho.estado === 'EN_RUTA' ? 'border-blue-500 text-blue-600' : 'border-gray-200 text-gray-300')}`}>
            <Truck size={18} />
          </div>
        </div>

        {/* Botón de Control de Producto */}
        <button 
          onClick={() => setShowProducts(!showProducts)}
          className="w-full py-2 mb-3 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300 transition-colors"
        >
          {showProducts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showProducts ? "OCULTAR PRODUCTOS" : `VER ${orden.productos.length} PRODUCTOS`}
        </button>

        {/* Metadatos Rápidos */}
        <div className="grid grid-cols-3 gap-2 text-center border-t pt-3">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Req.</p>
            <p className="text-sm font-bold text-gray-700">{orden.total_requerido}kg</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Stock</p>
            <p className={`text-sm font-bold ${orden.inventario.stock_disponible < orden.total_requerido ? 'text-red-500' : 'text-green-600'}`}>
              {orden.inventario.stock_disponible}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Alis.</p>
            <p className="text-sm font-bold text-blue-600">{orden.alistamiento.total_alistado}kg</p>
          </div>
        </div>
      </div>

      {/* 🔹 NUEVO: PANEL DE CONTROL DE PRODUCTOS (DETALLE TÉCNICO) */}
      {showProducts && (
        <div className="bg-gray-50 border-t rounded-b-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-gray-100 text-gray-500 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">PRODUCTO</th>
                  <th className="px-3 py-2 text-right">ENTREGA</th>
                  <th className="px-3 py-2 text-center">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orden.productos.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="px-3 py-2 font-medium">
                       {prod.producto || `ID: ${prod.producto_id}`}
                       {prod.tiene_equivalente && <span className="ml-2 text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-bold">EQ</span>}
                    </td>
                 <td className="px-3 py-2 text-right font-mono">
  <span className="text-green-600 font-bold">
    {parseFloat(prod.entregado).toFixed(1)}
  </span>
  {" / "}
  <span className="text-gray-700">
    {parseFloat(prod.requerido).toFixed(1)}
  </span>

  <div className={`text-[10px] font-bold ${
    prod.faltante > 0 ? 'text-red-500' : 'text-green-600'
  }`}>
    Faltante: {parseFloat(prod.faltante).toFixed(1)}
  </div>
</td>
                    <td className="px-3 py-2 text-center">
                      <div className={`w-2 h-2 rounded-full mx-auto ${getProductStatusColor(prod.estado)}`}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
    </div>
  );
};

// ... (Resto del DashboardOperativo se mantiene igual)

export default function DashboardOperativo() {
  // Supongamos que aquí vienen los datos de tu hook

  const { sedes } = useSedes();
  const [sedeId, setSedeId] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [estadoVsm, setEstadoVsm] = useState("");
  const [revisada, setRevisada] = useState(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const { data, isLoading } = useGetDashboardOperativo({ sede_id: sedeId , estado_vsm: estadoVsm, cliente: clienteId, revisada: revisada }); // Puedes pasar filtros si tu hook los soporta
  const {clientesTodos} = useClientes();
  
//console.log("Datos del Dashboard Operativo:", data);
  if (isLoading) return <div className="p-10 text-center"><NexusLoader /></div>;
const events = data?.map((orden) => {
  const hoy = new Date();
  const fechaEntrega = new Date(orden.fecha_entrega);

  const vencido = fechaEntrega < hoy && orden.estado_vsm !== 'ENTREGADO';

  return {
    id: orden.orden_id,
      title: `${orden.revisada ? "✔️ " : ""}OC #${orden.orden_id} / OT #${orden.orden_trabajo_id || 'N/A'} - ${orden.sede} - ${orden.cliente}`,
    start: orden.fecha_entrega,
    allDay: true,

    extendedProps: {
      ...orden,
      revisada: orden.revisada, // para control visual de revisión
      vencido // 
    }
  };
});
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Torre de Control VSM</h1>
        <p className="text-gray-600">Monitoreo de flujo de valor en tiempo real</p>
      </header>
<div className="flex flex-wrap gap-4 mb-6">


  {/* CLIENTE */}
  <div className="flex flex-col w-56">
    <label className="text-xs font-semibold text-gray-500 mb-1">
      Cliente
    </label>
    <Select
      options={clientesTodos?.map(cliente => ({ value: cliente.id, label: cliente.nombre }))}
    value={
  clientesTodos
    ?.map(cliente => ({ value: cliente.id, label: cliente.nombre }))
    .find(option => option.value === clienteId) || null
}
      onChange={(selected) => setClienteId(selected?.value || null)}
      className="text-sm"
    />
  </div>

<div className="flex flex-col w-40">
  <label className="text-xs font-semibold text-gray-500 mb-1">
    Revisión
  </label>
  <select
    className="border rounded-lg px-3 py-2 text-sm"
    value={revisada ?? ''}
    onChange={(e) => setRevisada(
      e.target.value === '' ? null : e.target.value === 'true'
    )}
  >
    <option value="">Todas</option>
    <option value="true">Revisadas</option>
    <option value="false">No revisadas</option>
  </select>
</div>
  {/* SEDE */}
  <div className="flex flex-col w-48">
    <label className="text-xs font-semibold text-gray-500 mb-1">
      Sede
    </label>
    <select
      className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
      value={sedeId || ''}
      onChange={(e) => setSedeId(e.target.value)}
    >
      <option value="">Todas</option>
      {sedes?.map((sede) => (
        <option key={sede.id} value={sede.id}>
          {sede.nombre}
        </option>
      ))}
    </select>
  </div>

  {/* ESTADO */}
  <div className="flex flex-col w-56">
    <label className="text-xs font-semibold text-gray-500 mb-1">
      Estado VSM
    </label>
    <select
      className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
      value={estadoVsm}
      onChange={(e) => setEstadoVsm(e.target.value)}
    >
      <option value="">Todos</option>
      <option value="SIN_STOCK">Sin stock</option>
      <option value="ESPERANDO_PROVEEDOR">En compra</option>
      <option value="EN_ALISTAMIENTO">Alistando</option>
      <option value="LISTO_PARA_DESPACHO">Listo despacho</option>
      <option value="EN_RUTA">En ruta</option>
      <option value="ENTREGADO">Entregado</option>
    </select>
  </div>

</div>
      {/* Grid de Órdenes 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.map(orden => (
          <VSMCard key={orden.orden_id} orden={orden} />
        ))}
      </div>*/}

<MantenimientoCalendar
  events={events}
eventClassNames={(arg) => {
  const { vencido, estado_vsm, revisada } = arg.event.extendedProps;

  let classes = [];

  //  colores normales
  if (vencido) classes.push('bg-red-500', 'text-white');
  else if (estado_vsm === 'ENTREGADO') classes.push('bg-green-500', 'text-white');
  else if (estado_vsm === 'EN_RUTA') classes.push('bg-blue-500', 'text-white');
  else classes.push('bg-yellow-400');

  //  CLASE PERSONALIZADA
  if (revisada) classes.push('revisado'); // Agrega clase para órdenes revisadas

  return classes;
}}
  onEventClick={(event) => {
    console.log("Evento clickeado:", event);
    setOrdenSeleccionada(event); // <--- aquí el cambio

  
  }}

      title="Dashboard Operativo"
        subtitle="Monitoreo en tiempo real de órdenes de trabajo y su flujo de valor"

/>
{ordenSeleccionada && (
  <div className="fixed inset-0 z-50 flex">
    
    {/* overlay */}
    <div
      className="flex-1 bg-black/40"
      onClick={() => setOrdenSeleccionada(null)}
    />

    {/* drawer */}
    <div className="w-[500px] bg-white h-full shadow-xl overflow-y-auto p-4">
      
      <button
        onClick={() => setOrdenSeleccionada(null)}
        className="mb-4 text-gray-500"
      >
        ✕ Cerrar
      </button>

      <VSMCard orden={ordenSeleccionada} />
    </div>

  </div>
)}
    </div>
  );
}