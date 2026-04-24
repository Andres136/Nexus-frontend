
import { useSedes } from "../../hooks/useSedes"
import { useGetFormasPago } from "../../hooks/contabilidad/useGetFormasPago"
import { useGetImpuesto } from "../../hooks/contabilidad/useGetImpuesto"
import { useGetPuck } from "../../hooks/contabilidad/useGetPuck"
import { useRegisterFacturaCompras } from "../../hooks/contabilidad/useRegisterFacturaCompras"


import Select from "react-select"
import DetallesFacturaCompras from "./DetallesFacturaCompras"
import { useGetAllProveedores } from "../../hooks/crm/useGetAllProveedores"

export default function FacturaCompras() {
  const { proveedores } = useGetAllProveedores();
  const { sedes, bodegasAll } = useSedes();
  const { formasPago } = useGetFormasPago();
  const { impuestos } = useGetImpuesto();
  const { pucks } = useGetPuck();
  const { factura, handleFacturaChange, addDetalle, updateDetalle, removeDetalle, handleSubmitFactura } = useRegisterFacturaCompras();

  // Estilo común para inputs
  const inputClass = "w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 outline-none border-gray-300";
  const labelClass = "block text-[11px] font-semibold text-gray-600 uppercase mb-1";

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Nueva Factura de Compra</h1>
          <button 
            onClick={handleSubmitFactura}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition shadow-sm"
          >
            Guardar Factura
          </button>
        </header>

        <form className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-3">
            
            {/* PROVEEDOR */}
            <div>
              <label className={labelClass}>Proveedor</label>
              <Select
                className="text-sm"
                options={proveedores?.map(p => ({ value: p.id, label: p.nombre }))}
                onChange={(s) => handleFacturaChange({ target: { name: "proveedor_id", value: s.value } })}
              />
            </div>

            {/* SEDE */}
            <div>
              <label className={labelClass}>Sede Destino</label>
              <Select
                className="text-sm"
                options={sedes?.map(s => ({ value: s.id, label: s.nombre }))}
                onChange={(s) => handleFacturaChange({ target: { name: "sede_id", value: s.value } })}
              />
            </div>
    

            <div>
              <label className={labelClass}>N° Factura Proveedor</label>
              <input type="text" name="numero_factura_proveedor" className={inputClass} value={factura.factura.numero_factura_proveedor} onChange={handleFacturaChange} />
            </div>

            <div>
              <label className={labelClass}>Fecha Emisión</label>
              <input type="date" name="fecha_emision" className={inputClass} value={factura.factura.fecha_emision} onChange={handleFacturaChange} />
            </div>

            <div>
              <label className={labelClass}>Vencimiento</label>
              <input type="date" name="fecha_vencimiento" className={inputClass} value={factura.factura.fecha_vencimiento} onChange={handleFacturaChange} />
            </div>

            <div>
              <label className={labelClass}>Forma de Pago</label>
              <Select
                className="text-sm"
                options={formasPago?.map(fp => ({ value: fp.id, label: fp.nombre }))}
                onChange={(s) => handleFacturaChange({ target: { name: "forma_pago_id", value: s.value } })}
              />
            </div>

            <div>
              <label className={labelClass}>Impuesto General</label>
              <Select
                className="text-sm"
                options={impuestos?.map(i => ({ value: i.id, label: i.nombre }))}
                onChange={(s) => handleFacturaChange({ target: { name: "impuesto_id", value: s.value } })}
              />
            </div>
          </div>

          {/* Footer del Form (Observaciones y Totales) */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
            <div className="md:col-span-2">
              <label className={labelClass}>Observaciones</label>
              <textarea 
                name="observaciones" 
                className={`${inputClass} h-12 resize-none`}
                value={factura.factura.observaciones} 
                onChange={handleFacturaChange}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded flex flex-col justify-center space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-semibold text-gray-700">${factura.factura.subtotal}</span>
              </div>
              <div className="flex justify-between text-base border-t pt-1">
                <span className="font-bold text-gray-800">Total:</span>
                <span className="font-bold text-blue-700">${factura.factura.total}</span>
              </div>
            </div>
          </div>
        </form>

        <DetallesFacturaCompras
          detalles={factura.detalles}
          addDetalle={addDetalle}
          updateDetalle={updateDetalle}
          removeDetalle={removeDetalle}
          bodegasAll={bodegasAll}
        />
      </div>
    </div>
  );
}
