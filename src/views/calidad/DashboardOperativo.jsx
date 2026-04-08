import { useState, useMemo } from "react";
import { useGetDashboardOperativo } from "../../hooks/calidad/useGetDasboardOperativo";
import { useProducts } from "../../hooks/useProducts";
import { useClientes } from "../../hooks/useClientes";
import Select from "react-select";

export default function DashboardOperativo() {
  // --- ESTADOS Y LOGICA ---
  const [filtros, setFiltros] = useState({ estado: "", pendientes: "", cliente_id: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [productoId, setProductoId] = useState(null);
  const [expandedId, setExpandedId] = useState(null); // Control de acordeón

  const { products, isLoading: isLoadingProducts } = useProducts({ search: searchTerm });
  const { data, isLoading } = useGetDashboardOperativo(productoId, filtros);
  const { clientesTodos } = useClientes();

  // Memorizamos el cálculo de órdenes para optimizar si la lista es gigante
  const ordenes = useMemo(() => {
    return data?.ordenes?.sort((a, b) => b.faltante - a.faltante) || [];
  }, [data]);

  const totalOrdenes = ordenes.length;
  const atrasadas = ordenes.filter(o => o.atrasado).length;
  const enRuta = ordenes.filter(o => o.en_ruta).length;

  const toggleOrden = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- HEADER COMPACTO --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Control Operativo</h2>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Trazabilidad de ordenes</p>
          </div>
          
          <div className="flex gap-2">
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
                <span className="text-lg font-black">{totalOrdenes}</span>
             </div>
             <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] text-red-400 font-bold uppercase">Atraso</span>
                <span className="text-lg font-black text-red-600">{atrasadas}</span>
             </div>
             <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] text-green-400 font-bold uppercase">Ruta</span>
                <span className="text-lg font-black text-green-600">{enRuta}</span>
             </div>
          </div>
        </div>

        {/* --- BARRA DE FILTROS --- */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <select 
              className="text-xs font-bold border-none bg-slate-100 rounded-md p-2 outline-none focus:ring-2 ring-blue-500 cursor-pointer"
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            >
              <option value="">Todos los Estados</option>
              <option value="EN_COMPRA">🛒 Compra</option>
              <option value="EN_PRODUCCION">⚙️ Prod.</option>
              <option value="ALISTAMIENTO_EN_PROCESO">📦 Alist.</option>
              <option value="EN_RUTA">🚚 Ruta</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <select 
              className="text-xs font-bold border-none bg-slate-100 rounded-md p-2 outline-none focus:ring-2 ring-blue-500 cursor-pointer"
              onChange={(e) => setFiltros(prev => ({ ...prev, pendientes: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="1">Solo Pendientes</option>
            </select>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 hidden md:block mx-1" />

          <div className="flex-1 min-w-[200px]">
            <Select
              styles={{ control: (b) => ({ ...b, backgroundColor: '#f1f5f9', border: 'none', fontSize: '12px', fontWeight: 'bold' }) }}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
              onInputChange={(v) => setSearchTerm(v)}
              onChange={(s) => setProductoId(s?.value || null)}
              isLoading={isLoadingProducts}
              isClearable
              placeholder="Filtrar Producto..."
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Select
              styles={{ control: (b) => ({ ...b, backgroundColor: '#f1f5f9', border: 'none', fontSize: '12px', fontWeight: 'bold' }) }}
              options={clientesTodos.map((c) => ({ value: c.id, label: c.nombre }))}
              onChange={(s) => setFiltros(prev => ({ ...prev, cliente_id: s?.value || null }))}
              isClearable
              placeholder="Filtrar Cliente..."
            />
          </div>
        </div>

        {/* --- LISTADO DE ÓRDENES (GRID 2 COLUMNAS) --- */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center p-20 text-slate-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="font-bold uppercase text-xs tracking-widest">Sincronizando datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ordenes.map((orden) => {
              const isExpanded = expandedId === orden.orden_compra_id;
              
              return (
                <div 
                  key={orden.orden_compra_id} 
                  className={`bg-white rounded-xl border transition-all duration-200 ${
                    isExpanded 
                    ? 'lg:col-span-2 shadow-lg border-blue-400 ring-1 ring-blue-100' 
                    : 'shadow-sm border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* CABECERA DE CARD (CLICKABLE) */}
                  <div 
                    onClick={() => toggleOrden(orden.orden_compra_id)}
                    className="p-3 cursor-pointer flex items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-1.5 h-10 rounded-full shrink-0 ${orden.atrasado ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-green-500'}`} />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-800 truncate uppercase tracking-tight">
                          {orden.cliente}
                        </h4>
                        <div className="flex gap-2 items-center mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            OC-{orden.numero_orden ?? orden.orden_compra_id}
                          </span>
                          {orden.orden_trabajo_id && (
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                              OT-{orden.orden_trabajo_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* KPI RÁPIDO VISTA CERRADA */}
                    {!isExpanded && (
                      <div className="hidden sm:flex items-center gap-6 shrink-0">
                         <div className="text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Faltante</p>
                            <p className="text-xs font-black text-red-500">{orden.faltante}</p>
                         </div>
                         <div className="w-16">
                            <p className="text-[9px] font-bold text-slate-400 uppercase text-center mb-1">{orden.porcentaje_avance}%</p>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full">
                               <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min(orden.porcentaje_avance, 100)}%` }} />
                            </div>
                         </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 shrink-0">
                       <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${
                         orden.atrasado ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                       }`}>
                          {orden.estado?.replace(/_/g, ' ')}
                       </span>
                       <span className="text-slate-300 text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* CONTENIDO EXPANDIDO (DETALLES) */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
                      
                      {/* STATS DE SEGUNDO NIVEL */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                         <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Stock Disponible</p>
                            <p className="text-sm font-black text-slate-700">{orden.stock_disponible} <span className="text-[10px] font-normal text-slate-400 uppercase tracking-tighter">unidades</span></p>
                         </div>
                         {/* 🏬 STOCK POR BODEGA */}
{orden.bodegas?.length > 0 && (
  <div className="mb-5">
    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
      🏬 Stock por Bodega
      <span className="h-[1px] bg-slate-200 flex-1"></span>
    </p>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {orden.bodegas.map((b, i) => (
        <div
          key={i}
          className="bg-white p-2 rounded border border-slate-200 text-xs flex justify-between items-center shadow-sm"
        >
          <span className="font-bold text-slate-600">{b.bodega}</span>

          <span
            className={`font-black ${
              b.stock > 0 ? "text-green-600" : "text-red-400"
            }`}
          >
            {b.stock}
          </span>
        </div>
      ))}
    </div>
  </div>
)}
                         <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Compras Pendientes</p>
                            <p className="text-sm font-black text-slate-700">{orden.compras_pendientes}</p>
                         </div>
                         <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Progreso Global</p>
                            <p className="text-sm font-black text-green-600">{orden.porcentaje_avance}%</p>
                         </div>
                         <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Estado Entrega</p>
                            <p className={`text-xs font-black uppercase ${orden.atrasado ? 'text-red-500' : 'text-green-600'}`}>
                               {orden.atrasado ? '⚠ Retrasado' : '✓ En fecha'}
                            </p>
                         </div>
                      </div>

                      {/* COMPRAS A PROVEEDOR (SI EXISTEN) */}
                      {orden.compras?.length > 0 && (
                        <div className="mb-5">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                            🛒 Compras a Proveedor
                            <span className="h-[1px] bg-slate-200 flex-1"></span>
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {orden.compras.map((c, i) => (
                              <div key={i} className="bg-white p-2 rounded border border-slate-200 text-[11px] flex justify-between items-center shadow-sm">
                                <div>
                                  <span className="font-bold text-slate-700">{c.proveedor}</span>
                                  <p className="text-slate-400 text-[9px]">{new Date(c.fecha_oc).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-slate-500">Pendiente: <span className="text-red-500 font-bold">{c.pendiente}</span></p>
                                  <p className="text-[9px] text-slate-400 italic">Recibido {c.cantidad_entregada}/{c.cantidad_solicitada}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* DESGLOSE DE PRODUCTOS (TABLA) */}
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                          📦 Desglose de Productos
                          <span className="h-[1px] bg-slate-200 flex-1"></span>
                        </p>
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px]">
                              <tr>
                                <th className="p-2.5">Descripción del Producto</th>
                                <th className="p-2.5">Cumplimiento</th>
                                <th className="p-2.5 text-center">Cant.</th>
                                <th className="p-2.5 text-right">Faltante</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {orden.productos.map(prod => (
                                <tr key={prod.detalle_id} className="hover:bg-blue-50/30 transition-colors">
                                  <td className="p-2.5 font-bold text-slate-700">{prod.nombre}</td>
                                  <td className="p-2.5 w-32">
                                    <div className="flex items-center gap-2">
                                      <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                        <div 
                                          className={`h-full rounded-full ${prod.porcentaje < 40 ? 'bg-red-400' : prod.porcentaje < 80 ? 'bg-yellow-400' : 'bg-green-500'}`} 
                                          style={{ width: `${prod.porcentaje}%` }} 
                                        />
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400 min-w-[25px]">{prod.porcentaje}%</span>
                                    </div>
                                  </td>
                                  <td className="p-2.5 text-center font-bold text-slate-600">
                                    {prod.cantidad_alistada} <span className="text-slate-300 font-normal">/</span> {prod.cantidad_pedida}
                                  </td>
                                  <td className="p-2.5 text-right font-black text-red-500 bg-red-50/20">
                                    -{prod.faltante}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* --- ESTADO VACÍO --- */}
        {!isLoading && ordenes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">No se encontraron órdenes con los filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
}