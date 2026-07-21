import { useEffect, useState } from 'react';
import { 
  Package, ShoppingCart, ClipboardCheck, Truck, 
  CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, Beaker 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useGetDashboardOperativo } from '../../hooks/calidad/useGetDasboardOperativo';
import { gestionOperativaService } from '../../services/calidaService';
import {useSedes} from "../../hooks/useSedes";
import MantenimientoCalendar from '../../components/tic/MantenimientoCalendar';
import  {RevisarOtApi} from "../../services/api";
import { showToast } from '../../helpers/utils/showToast';
import { useClientes } from '../../hooks/useClientes';
import  NexusLoader from '../../components/NexusLoader';
import { useRegisterOcComprasHistorial } from '../../hooks/crm/useRegisterOcComprasHistorial';
import Select from 'react-select';


const VSMCard = ({ orden, formData, handleChange, handleSubmit  }) => {
  const [showProducts, setShowProducts] = useState(false);
  const [prioridadesKg, setPrioridadesKg] = useState({});
  const [prioridadesPrioridad, setPrioridadesPrioridad] = useState({});
  const [productoCompraModal, setProductoCompraModal] = useState(null);
  const [localRevisada, setLocalRevisada] = useState(orden.revisada);
const queryClient = useQueryClient();

  const getStatusConfig = (estado) => {
    const configs = {
      'ENTREGADO': { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Entregado' },
      'EN_RUTA': { color: 'bg-blue-100 text-blue-800', icon: Truck, label: 'En Ruta' },
      'LISTO_PARA_DESPACHO': { color: 'bg-indigo-100 text-indigo-800', icon: ClipboardCheck, label: 'Listo Despacho' },
      'EN_ALISTAMIENTO': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Alistando' },
      'LISTO_PARA_ALISTAR': { color: 'bg-teal-100 text-teal-800', icon: ClipboardCheck, label: 'Listo Alistar' },
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
    showToast('success', response.data.message);
    setLocalRevisada(true);
    queryClient.invalidateQueries(['dashboardOperativo']);
  } catch (error) {
    console.error("Error revisando documento", error);
    showToast('error', 'Error al marcar como revisada');
  }
};
  const config = getStatusConfig(orden.estado_vsm);
  const StatusIcon = config.icon;
  const prioridadKey = (producto) => `${orden.orden_id}-${producto.detalle_id}`;
  const cantidadSugeridaPrioridad = (producto) => {
    const faltante = Number(producto.faltante ?? 0);
    const requerido = Number(producto.requerido ?? 0);
    const entregado = Number(producto.entregado ?? 0);

    return faltante > 0 ? faltante : Math.max(requerido - entregado, 0);
  };

  const buildDetallePrioridad = (producto, { soloPrioridad = false } = {}) => {
    const key = prioridadKey(producto);
    const cantidadManual = Number(prioridadesKg[key] ?? 0);
    const prioridadManual = Number(prioridadesPrioridad[key] ?? 0);
    const cantidad = soloPrioridad
      ? prioridadManual
      : (cantidadManual > 0 ? cantidadManual : cantidadSugeridaPrioridad(producto));

    if (cantidad <= 0) {
      return null;
    }

    const cantidadPrioridad = prioridadManual > 0
      ? Math.min(prioridadManual, cantidad)
      : cantidad;

    return {
      uid: `${orden.orden_id}-${producto.detalle_id}`,
      orden_id: orden.orden_id,
      codigo: orden.numero || `OC #${orden.orden_id}`,
      cliente: orden.cliente || 'Sin cliente',
      fecha_entrega: orden.fecha_entrega,
      detalle: {
        descripcion: producto.producto || `Producto ${producto.producto_id}`,
        cantidad_solicitada: cantidad,
        cantidad_entregada: 0,
        code: producto.codigo || '',
        producto_id: producto.producto_id,
        origenes: [
          {
            orden_compra_id: orden.orden_id,
            orden_compra_detalle_id: producto.detalle_id,
            producto_id: producto.producto_id,
            sede_id: orden.sede_id || null,
            bodega_id: null,
            cantidad_solicitada: cantidad,
            cantidad_prioridad: cantidadPrioridad,
            prioridad_snapshot: {
              prioridad: 'manual',
              prioridad_label: 'Manual',
              fecha_entrega: orden.fecha_entrega,
              faltante_kg: producto.faltante,
              stock_disponible_kg: producto.stock,
              cliente: orden.cliente,
              orden_codigo: orden.numero || `OC #${orden.orden_id}`,
              orden_trabajo_id: orden.orden_trabajo_id,
            },
          },
        ],
      },
    };
  };

  const actualizarPrioridadDirecta = async (origenId, producto) => {
    const key = prioridadKey(producto);
    const cantidad = Number(prioridadesPrioridad[key] ?? 0);
    if (cantidad <= 0) {
      showToast('error', 'Indica cuántos kg quieres dejar como urgentes');
      return;
    }
    try {
      await gestionOperativaService.actualizarPrioridadOrigen(origenId, cantidad);
      showToast('success', `Prioridad actualizada: ${cantidad} kg`);
      queryClient.invalidateQueries(['dashboardOperativo']);
    } catch {
      showToast('error', 'Error al actualizar la prioridad');
    }
  };

  const agregarPrioridadLocal = (producto) => {
    const item = buildDetallePrioridad(producto);

    if (!item) {
      showToast('error', 'Indica una prioridad mayor a 0 kg');
      return;
    }

    const storageKey = 'crm_prioridades_compra';
    const actuales = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const sinDuplicado = actuales.filter((actual) => actual.uid !== item.uid);
    const nuevos = [...sinDuplicado, item];
    localStorage.setItem(storageKey, JSON.stringify(nuevos));
    window.dispatchEvent(new Event('prioridades-compra-updated'));
    showToast('success', `Nueva OC: prioridad agregada (${nuevos.length})`);
  };

  const agregarPrioridadExistente = (producto, oc) => {
    if (!oc.detalle_id) {
      showToast('error', 'No se encontró el item exacto en la OC proveedor');
      return;
    }

    const item = buildDetallePrioridad(producto, { soloPrioridad: true });
    if (!item) {
      showToast('error', 'Indica cuántos kg quieres priorizar en la OC existente');
      return;
    }
    const taggedItem = {
      ...item,
      uid: `oc-det${oc.detalle_id}-${item.uid}`,
      target_oc_id: oc.id,
      target_oc_detalle_id: oc.detalle_id,
      target_oc_numero: oc.numero_orden || `OC-${oc.id}`,
    };
    const storageKey = 'crm_prioridades_compra';
    const actuales = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const sinDuplicado = actuales.filter((a) => a.uid !== taggedItem.uid);
    const nuevos = [...sinDuplicado, taggedItem];
    localStorage.setItem(storageKey, JSON.stringify(nuevos));
    window.dispatchEvent(new Event('prioridades-compra-updated'));
    showToast('success', `Prioridad agregada a ${taggedItem.target_oc_numero} (${nuevos.length})`);
  };

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
        localRevisada
          ? 'bg-green-100 text-green-700'
          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      }`}
  >
    {localRevisada
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
                  <th className="px-3 py-2 text-left">COMPRA</th>
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
                    <td className="px-3 py-2">
                      <div className="space-y-2">
                        {prod.compra_proveedor?.pendiente > 0 ? (
                          <>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <div className="font-mono font-bold text-blue-700">
                              {parseFloat(prod.compra_proveedor.pendiente).toFixed(1)} kg
                            </div>
                            <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              prod.compra_proveedor.trazabilidad === 'exacta'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {prod.compra_proveedor.trazabilidad}
                            </span>
                          </div>
                          {prod.compra_proveedor.ordenes?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {prod.compra_proveedor.ordenes.map((op) => (
                                <span key={op.detalle_id ?? op.id} className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">
                                  {op.numero_orden || `OP-${op.id}`}
                                </span>
                              ))}
                            </div>
                          )}
                          {prod.compra_proveedor.prioridades?.length > 0 && (
                            <div className="space-y-1">
                              {prod.compra_proveedor.prioridades.map((prioridad) => (
                                <div
                                  key={`${prioridad.origen_id ?? prioridad.orden_compra_detalle_id}-${prioridad.cantidad_prioridad}`}
                                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                                    prioridad.completa
                                      ? "bg-green-100 text-green-700"
                                      : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  <span>
                                    Prioridad {Number(prioridad.cantidad_recibida ?? 0).toFixed(1)}
                                    {" / "}
                                    {Number(prioridad.cantidad_prioridad ?? 0).toFixed(1)} kg
                                  </span>
                                  {prioridad.origen_id && !prioridad.completa && (
                                    <button
                                      type="button"
                                      onClick={() => actualizarPrioridadDirecta(prioridad.origen_id, prod)}
                                      className="ml-1.5 rounded bg-orange-500 px-1 py-0.5 text-[8px] font-bold text-white hover:bg-orange-600"
                                    >
                                      Actualizar
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-400">Sin compra</span>
                        )}
                        {prod.faltante > 0 && (
                          <button
                            type="button"
                            onClick={() => setProductoCompraModal(prod)}
                            className="w-full rounded border border-blue-200 bg-blue-50 px-2 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Compra / prioridad
                          </button>
                        )}
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
{productoCompraModal && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
    <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase text-gray-400">Compra / prioridad</p>
          <h3 className="text-base font-bold text-gray-900">
            {productoCompraModal.producto || `Producto ${productoCompraModal.producto_id}`}
          </h3>
          <p className="text-sm text-gray-500">
            Faltante: {Number(productoCompraModal.faltante ?? 0).toFixed(1)} kg · Stock: {Number(productoCompraModal.stock ?? 0).toFixed(1)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setProductoCompraModal(null)}
          className="rounded border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Cerrar
        </button>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        {productoCompraModal.compra_proveedor?.ordenes?.length > 0 && (
          <section className="rounded-md border border-green-200 bg-green-50 p-4">
            <h4 className="text-sm font-bold text-green-800">Priorizar cantidad ya pedida</h4>
            <p className="mt-1 text-xs text-green-700">
              Registra solo los kg urgentes sobre un item existente. No crea otro item en la OC.
            </p>

            <label className="mt-4 block text-xs font-bold uppercase text-green-800">
              Kg urgentes
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={prioridadesPrioridad[prioridadKey(productoCompraModal)] ?? ''}
              onChange={(event) =>
                setPrioridadesPrioridad((prev) => ({
                  ...prev,
                  [prioridadKey(productoCompraModal)]: event.target.value,
                }))
              }
              placeholder="Ej: 5.00"
              className="mt-1 w-full rounded border border-green-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />

            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold uppercase text-green-800">OC proveedor</p>
              {productoCompraModal.compra_proveedor.ordenes.map((oc) => (
                <button
                  key={oc.detalle_id ?? oc.id}
                  type="button"
                  onClick={() => {
                    agregarPrioridadExistente(productoCompraModal, oc);
                    setProductoCompraModal(null);
                  }}
                  disabled={!oc.detalle_id}
                  className="flex w-full items-center justify-between gap-3 rounded border border-green-300 bg-white px-3 py-2 text-left text-sm font-semibold text-green-800 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    {oc.numero_orden || `OC-${oc.id}`}
                    {oc.proveedor ? ` · ${oc.proveedor}` : ''}
                  </span>
                  <span className="font-mono text-xs">
                    {Number(oc.pendiente ?? 0).toFixed(1)} kg pend.
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <h4 className="text-sm font-bold text-blue-800">Crear OC proveedor nueva</h4>
          <p className="mt-1 text-xs text-blue-700">
            Usa esta opción si todavía no hay un pedido proveedor adecuado para este producto.
          </p>

          <label className="mt-4 block text-xs font-bold uppercase text-blue-800">
            Kg a comprar
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={prioridadesKg[prioridadKey(productoCompraModal)] ?? ''}
            onChange={(event) =>
              setPrioridadesKg((prev) => ({
                ...prev,
                [prioridadKey(productoCompraModal)]: event.target.value,
              }))
            }
            placeholder={cantidadSugeridaPrioridad(productoCompraModal).toFixed(1)}
            className="mt-1 w-full rounded border border-blue-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={() => {
              agregarPrioridadLocal(productoCompraModal);
              setProductoCompraModal(null);
            }}
            className="mt-4 w-full rounded bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Agregar para nueva OC
          </button>
        </section>
      </div>
    </div>
  </div>
)}
{/* 🔥 FORMULARIO DE REPROGRAMACIÓN */}
<div className="border-t p-4 space-y-3">
  <h4 className="text-sm font-bold text-gray-600">
    Reprogramar fecha
  </h4>

  <input
    type="date"
    name="fecha_nueva"
    value={formData.fecha_nueva}
    onChange={handleChange}
    className="w-full border rounded-lg px-3 py-2 text-sm"
  />

  <textarea
    name="observacion"
    value={formData.observacion}
    onChange={handleChange}
    placeholder="Motivo de reprogramación..."
    className="w-full border rounded-lg px-3 py-2 text-sm"
  />

  <button
    onClick={handleSubmit}
    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
  >
    Guardar cambios
  </button>
</div>

{orden.historial && orden.historial.length > 0 && (
  <div className="border-t mt-4 pt-4">
    <h4 className="text-sm font-bold text-gray-600 mb-3">
      Historial de cambios
    </h4>

    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
      {orden.historial.map((h, index) => (
        <div key={index} className="flex items-start gap-3">

          {/* 🔵 Punto timeline */}
          <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>

          {/* 📦 Contenido */}
          <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs shadow-sm">

            {/* 📅 Fecha cambio */}
            <p className="text-[10px] text-gray-400">
              {new Date(h.fecha_cambio).toLocaleDateString()}
            </p>

            {/* 🔄 Cambio */}
            <p className="font-semibold text-gray-700">
              {h.fecha_anterior} → {h.fecha_nueva}
            </p>

            {/* 💬 Observación */}
            {h.observacion && (
              <p className="text-gray-500 italic">
                "{h.observacion}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      
    </div>
  );
};

// ... (Resto del DashboardOperativo se mantiene igual)

export default function DashboardOperativo() {
  // Supongamos que aquí vienen los datos de tu hook

  const navigate = useNavigate();
  const { sedes } = useSedes();
  const [sedeId, setSedeId] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [estadoVsm, setEstadoVsm] = useState("");
  const [revisada, setRevisada] = useState(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
const [searchInput, setSearchInput] = useState("");
const [search, setSearch] = useState("");
  const [prioridadCounts, setPrioridadCounts] = useState(() => {
    const all = JSON.parse(localStorage.getItem('crm_prioridades_compra') || '[]');
    return {
      nuevas: all.filter(p => !p.target_oc_id).length,
      existentes: all.filter(p => p.target_oc_id).length,
      total: all.length,
    };
  });
  const { data, isLoading } = useGetDashboardOperativo({ sede_id: sedeId ,
    estado_vsm: estadoVsm,
     cliente: clienteId,
     revisada: revisada,
      search: search
    });
  const {clientesTodos} = useClientes();
const {

  setOrden,
  formData,
  handleChange,
  handleSubmit
} = useRegisterOcComprasHistorial();

  useEffect(() => {
    const actualizarContador = () => {
      const all = JSON.parse(localStorage.getItem('crm_prioridades_compra') || '[]');
      setPrioridadCounts({
        nuevas: all.filter(p => !p.target_oc_id).length,
        existentes: all.filter(p => p.target_oc_id).length,
        total: all.length,
      });
    };

    window.addEventListener('prioridades-compra-updated', actualizarContador);
    window.addEventListener('storage', actualizarContador);

    return () => {
      window.removeEventListener('prioridades-compra-updated', actualizarContador);
      window.removeEventListener('storage', actualizarContador);
    };
  }, []);

  const getPrioridadesStorage = () =>
    JSON.parse(localStorage.getItem('crm_prioridades_compra') || '[]');

  const crearOrdenProveedorDesdePrioridades = () => {
    const prioridades = getPrioridadesStorage().filter(p => !p.target_oc_id);

    if (prioridades.length === 0) {
      showToast('error', 'No hay prioridades para nueva OC');
      return;
    }

    navigate('/auth/crm/proveedores-ordenes-compra', {
      state: {
        trazabilidadCompra: {
          orden_id: prioridades[0]?.orden_id,
          codigo: prioridades.length === 1
            ? prioridades[0]?.codigo
            : `${prioridades.length} prioridades`,
          cliente: prioridades.length === 1
            ? prioridades[0]?.cliente
            : 'Múltiples órdenes',
          detalles: prioridades.map((prioridad) => prioridad.detalle),
        },
      },
    });
  };

  const procesarPrioridadesExistentes = async () => {
    const prioridades = getPrioridadesStorage().filter(p => p.target_oc_id);
    if (prioridades.length === 0) {
      showToast('error', 'No hay prioridades para OC existentes');
      return;
    }
    let exitosos = 0;
    let fallidos = 0;
    for (const item of prioridades) {
      try {
        const origen = item.detalle.origenes?.[0] || {};
        await gestionOperativaService.agregarPrioridadDetalleExistente({
          orden_compra_proveedor_detalle_id: item.target_oc_detalle_id,
          orden_compra_id: origen.orden_compra_id,
          orden_compra_detalle_id: origen.orden_compra_detalle_id,
          producto_id: origen.producto_id,
          sede_id: origen.sede_id,
          bodega_id: origen.bodega_id,
          cantidad_solicitada: origen.cantidad_solicitada,
          cantidad_prioridad: origen.cantidad_prioridad,
          prioridad_snapshot: origen.prioridad_snapshot,
        });
        exitosos++;
      } catch {
        fallidos++;
      }
    }
    if (exitosos > 0) {
      const restantes = getPrioridadesStorage().filter(p => !p.target_oc_id);
      localStorage.setItem('crm_prioridades_compra', JSON.stringify(restantes));
      window.dispatchEvent(new Event('prioridades-compra-updated'));
      showToast('success', `${exitosos} prioridad(es) agregada(s) a OC existentes`);
    }
    if (fallidos > 0) {
      showToast('error', `${fallidos} prioridad(es) con error al procesar`);
    }
  };

  const descargarPrioridades = () => {
    const prioridades = getPrioridadesStorage();

    if (prioridades.length === 0) {
      showToast('error', 'No hay prioridades para descargar');
      return;
    }

    const headers = [
      'OC',
      'Cliente',
      'Fecha entrega',
      'Codigo producto',
      'Producto',
      'Cantidad compra kg',
      'Prioridad kg',
      'OT',
    ];
    const filas = prioridades.map((prioridad) => {
      const origen = prioridad.detalle?.origenes?.[0] || {};
      const snapshot = origen.prioridad_snapshot || {};

      return [
        prioridad.codigo || '',
        prioridad.cliente || '',
        prioridad.fecha_entrega || snapshot.fecha_entrega || '',
        prioridad.detalle?.code || '',
        prioridad.detalle?.descripcion || '',
        prioridad.detalle?.cantidad_solicitada || '',
        origen.cantidad_prioridad || '',
        snapshot.orden_trabajo_id || '',
      ];
    });
    const csv = [headers, ...filas]
      .map((fila) => fila.map((valor) => `"${String(valor ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prioridades-compra-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const limpiarPrioridades = () => {
    localStorage.removeItem('crm_prioridades_compra');
    window.dispatchEvent(new Event('prioridades-compra-updated'));
    showToast('success', 'Prioridades limpiadas');
  };



  
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
<div className="flex flex-col w-48">
  <label className="text-xs font-semibold text-gray-500 mb-1">
    Buscar OT
  </label>
<input
  type="text"
  placeholder="Buscar por OT..."
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      setSearch(searchInput.trim());
    }
  }}
  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
/>
</div>
</div>
<div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
  <div className="mr-auto space-y-0.5">
    <p className="text-xs font-bold uppercase text-gray-500">Prioridades acumuladas</p>
    {prioridadCounts.nuevas > 0 && (
      <p className="text-sm font-bold text-blue-700">{prioridadCounts.nuevas} para nueva OC</p>
    )}
    {prioridadCounts.existentes > 0 && (
      <p className="text-sm font-bold text-green-700">{prioridadCounts.existentes} para OC existente(s)</p>
    )}
    {prioridadCounts.total === 0 && (
      <p className="text-sm text-gray-400">Sin prioridades</p>
    )}
  </div>
  <button
    type="button"
    onClick={() => navigate('/auth/crm/control-operativo/trazabilidad-prioridades')}
    className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100"
  >
    Trazabilidad de prioridades →
  </button>
  {prioridadCounts.nuevas > 0 && (
    <button
      type="button"
      onClick={crearOrdenProveedorDesdePrioridades}
      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
    >
      Crear nueva OC ({prioridadCounts.nuevas})
    </button>
  )}
  {prioridadCounts.existentes > 0 && (
    <button
      type="button"
      onClick={procesarPrioridadesExistentes}
      className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
    >
      Agregar a OC existentes ({prioridadCounts.existentes})
    </button>
  )}
  <button
    type="button"
    onClick={limpiarPrioridades}
    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
  >
    Limpiar todo
  </button>
</div>

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
  onEventClick={(orden) => {
    setOrdenSeleccionada(orden);
    setOrden(orden);
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

    <VSMCard 
  orden={ordenSeleccionada}
  formData={formData}
  handleChange={handleChange}
  handleSubmit={handleSubmit}
/>
    </div>

  </div>
)}
    </div>
  );
}
