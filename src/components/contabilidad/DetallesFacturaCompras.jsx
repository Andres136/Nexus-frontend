import { useState } from "react";
import Select from "react-select"
import { useProducts } from "../../hooks/useProducts";
import { label } from "yet-another-react-lightbox";
export default function DetallesFacturaCompras({ detalles, addDetalle, updateDetalle, removeDetalle, bodegasAll }) {
  const { products } = useProducts({ search: "" });
 const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-bottom flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Líneas de Producto</h3>
        <button 
          type="button" 
          onClick={addDetalle}
          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded shadow-sm transition"
        >
          + Agregar Fila
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-[11px] uppercase text-gray-600 border-b">
              <th className="px-3 py-2 w-1/3">Producto / Servicio</th>
              <th className="px-3 py-2 w-32">Cantidad</th>
              <th className="px-3 py-2">Bodega Destino</th>
              <th className="px-3 py-2 w-40">Precio Unitario</th>
              <th className="px-3 py-2 w-10 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {detalles.map((det, index) => (
              <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-2 py-2">
                   <Select
                    placeholder="Buscar producto..."
                    className="text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={selectStyles}
                    options={products?.map(p => ({ value: p.id, label: `${p.name} - ${p.description || ''}` }))}
                    value={products?.map(p => ({ value: p.id, label: p.name })).find(o => o.value === det.producto_id) || null}
                    onChange={(s) => updateDetalle(index, "producto_id", s?.value || null)}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    className="w-full px-2 py-1 text-xs border rounded border-gray-300"
                    value={det.cantidad}
                    onChange={(e) => updateDetalle(index, "cantidad", e.target.value)}
                  />
                </td>
                <td className="px-2 py-2">
                 <Select
                    placeholder="Bodega..."
                    className="text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={selectStyles}
                    options={bodegasAll?.map(b => ({ value: b.id, label: `${b.nombre} - ${b.sede?.nombre || "Sin sede"}` }))}
                    value={bodegasAll?.map(b => ({ value: b.id, label: `${b.nombre} - ${b.sede?.nombre || "Sin sede"}` })).find(o => o.value === det.bodega_id) || null}
                    onChange={(s) => updateDetalle(index, "bodega_id", s?.value || null)}
                  />
                </td>
                <td className="px-2 py-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-xs">$</span>
                    <input
                      type="number"
                      className="w-full pl-5 pr-2 py-1 text-xs border rounded border-gray-300"
                      value={det.precio_unitario}
                      onChange={(e) => updateDetalle(index, "precio_unitario", e.target.value)}
                    />
                  </div>
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeDetalle(index)}
                    className="text-red-400 hover:text-red-600 p-1 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {detalles.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm italic">
            No hay productos agregados a esta factura.
          </div>
        )}
      </div>
    </div>
  );
}
