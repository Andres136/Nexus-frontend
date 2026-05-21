import { formatCurrency } from "../../helpers";
import { Trash2, Plus, Package } from "lucide-react";
import useOrdenCompraItems from "../../hooks/useOrdenCompraItems";
import { useProducts } from "../../hooks/useProducts";
import Select from "react-select";
import { useState } from "react";

const inputCls = "w-full border border-gray-300 px-1.5 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400";
const errSpan = (msg) => msg ? <span className="text-xs text-red-500 block">{msg}</span> : null;

const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control: (base) => ({ ...base, minHeight: "28px", fontSize: "12px" }),
  dropdownIndicator: (base) => ({ ...base, padding: "2px" }),
  clearIndicator: (base) => ({ ...base, padding: "2px" }),
  valueContainer: (base) => ({ ...base, padding: "0 6px" }),
};

export default function OrdenCompraMultiItem({ onDetallesChange, errores = {}, value = [] }) {
  const { rows, handleInputChange, addRow, removeRow } = useOrdenCompraItems({
    errores,
    onChange: onDetallesChange,
    initialItems: value,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { products, isLoading, isEmpty, isFetching } = useProducts({ search: searchTerm });
  console.log("Productos para select:", products);

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.code || p.code_id || "Sin código"} - ${p.name || "Sin nombre"}`,
  }));

  const renderProductSelect = (row) => (
    <Select
      isLoading={isLoading || isFetching}
      options={productOptions}
   value={row.product || null}
      onChange={(opt) => {
  handleInputChange(row._uuid, "product_id", opt ? opt.value : "");
  handleInputChange(row._uuid, "product", opt || null);
}}
      onInputChange={(v) => setSearchTerm(v)}
      placeholder="Buscar producto..."
      noOptionsMessage={() => isLoading ? "Cargando..." : isEmpty ? "Sin resultados" : "Escribe para buscar"}
      menuPortalTarget={document.body}
      styles={selectStyles}
    />
  );

  const subtotal = rows.reduce((s, r) => s + (r.valor_paquete || 0), 0);
  const ivaTotal = rows.reduce((s, r) => s + ((r.valor_total || 0) - (r.valor_paquete || 0)), 0);
  const total = subtotal + ivaTotal;

  return (
    <div className="space-y-3">

      {/* Vista móvil */}
      <div className="block lg:hidden space-y-3">
        {rows.map((row, idx) => (
          <div key={row._uuid} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Item #{row.observaciones}</span>
              <button onClick={() => removeRow(row._uuid)} className="text-red-500 hover:text-red-700 p-0.5">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {renderProductSelect(row)}

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Ancho cm</label>
                  <input type="text" className={inputCls} value={row.ancho_cm}
                    onChange={(e) => handleInputChange(row._uuid, "ancho_cm", e.target.value)} />
                  {errSpan(errores[idx]?.ancho_cm)}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Largo cm</label>
                  <input type="text" className={inputCls} value={row.largo_cm}
                    onChange={(e) => handleInputChange(row._uuid, "largo_cm", e.target.value)} />
                  {errSpan(errores[idx]?.largo_cm)}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Calibre</label>
                  <input type="text" className={inputCls} value={row.calibre}
                    onChange={(e) => handleInputChange(row._uuid, "calibre", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 bg-gray-50 p-2 rounded text-center text-xs">
                <div><div className="text-gray-500">Peso bolsa</div><div className="font-medium">{row.peso_bolsa.toFixed(2)} kg</div></div>
                <div><div className="text-gray-500">Bolsas</div><div className="font-medium">{row.numero_bolsas.toFixed(0)}</div></div>
                <div><div className="text-gray-500">Total kg</div><div className="font-medium">{row.cantidad_requerida_kg.toFixed(2)}</div></div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Descripción</label>
                  <input type="text" className={`${inputCls} uppercase`} value={row.descripcion}
                    onChange={(e) => handleInputChange(row._uuid, "descripcion", e.target.value)} />
                  {errSpan(errores[idx]?.descripcion)}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Cliente</label>
                  <input type="text" className={inputCls} value={row.cliente_clb}
                    onChange={(e) => handleInputChange(row._uuid, "cliente_clb", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Cantidad</label>
                  <input type="text" className={inputCls} value={row.cantidad}
                    onChange={(e) => handleInputChange(row._uuid, "cantidad", e.target.value)} />
                  {errSpan(errores[idx]?.cantidad)}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Precio unit.</label>
                  <input type="number" className={inputCls} value={row.valor_unitario}
                    onChange={(e) => handleInputChange(row._uuid, "valor_unitario", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">IVA %</label>
                  <input type="number" min="0" max="100" className={inputCls} value={row.iva_porcentaje}
                    onChange={(e) => handleInputChange(row._uuid, "iva_porcentaje", e.target.value)} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-1 text-xs text-gray-600 pb-1">
                    <input type="checkbox" className="rounded border-gray-300"
                      checked={row.tipo_embalaje === "paquete"}
                      onChange={(e) => handleInputChange(row._uuid, "tipo_embalaje", e.target.checked ? "paquete" : "unidad")} />
                    {row.tipo_embalaje === "paquete" ? "Paq." : "Und."}
                  </label>
                </div>
              </div>

              <div className="bg-green-50 p-2 rounded text-center">
                <div className="text-xs text-green-600">Subtotal: {formatCurrency(row.valor_paquete)}</div>
                <div className="text-sm font-bold text-green-800">+ IVA({row.iva_porcentaje}%): {formatCurrency(row.valor_total)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase w-8">#</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase w-6"></th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase min-w-[220px]">Producto</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Dim. cm</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Cal.</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Bolsas</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Clte</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase">Emb.</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Cant.</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">P.Unit</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase w-14">IVA%</th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <tr key={row._uuid} className="hover:bg-gray-50">
                <td className="px-2 py-1.5 font-medium text-gray-700">#{row.observaciones}</td>
                <td className="px-2 py-1.5">
                  <button onClick={() => removeRow(row._uuid)}
                    className="text-red-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
                <td className="px-2 py-1.5">{renderProductSelect(row)}</td>
                <td className="px-2 py-1.5">
                  <div className="space-y-1">
                    <input type="text" placeholder="Ancho" className="w-16 border border-gray-300 px-1.5 py-0.5 rounded text-xs"
                      value={row.ancho_cm} onChange={(e) => handleInputChange(row._uuid, "ancho_cm", e.target.value)} />
                    {errSpan(errores[idx]?.ancho_cm)}
                    <input type="text" placeholder="Largo" className="w-16 border border-gray-300 px-1.5 py-0.5 rounded text-xs"
                      value={row.largo_cm} onChange={(e) => handleInputChange(row._uuid, "largo_cm", e.target.value)} />
                    {errSpan(errores[idx]?.largo_cm)}
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <input type="text" className="w-14 border border-gray-300 px-1.5 py-0.5 rounded text-center text-xs"
                    value={row.calibre} onChange={(e) => handleInputChange(row._uuid, "calibre", e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <div>{row.peso_bolsa.toFixed(2)} kg</div>
                    <div>{row.numero_bolsas.toFixed(0)} und</div>
                    <div>{row.cantidad_requerida_kg.toFixed(2)} kg</div>
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <input type="text" className="w-16 border border-gray-300 px-1.5 py-0.5 rounded text-center text-xs"
                    value={row.cliente_clb} onChange={(e) => handleInputChange(row._uuid, "cliente_clb", e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <textarea className="w-28 border border-gray-300 px-1.5 py-0.5 rounded text-xs uppercase resize-none"
                    rows={2} value={row.descripcion}
                    onChange={(e) => handleInputChange(row._uuid, "descripcion", e.target.value)} />
                  {errSpan(errores[idx]?.descripcion)}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600"
                    checked={row.tipo_embalaje === "paquete"}
                    onChange={(e) => handleInputChange(row._uuid, "tipo_embalaje", e.target.checked ? "paquete" : "unidad")} />
                  <div className="text-xs text-gray-400 mt-0.5">{row.tipo_embalaje === "paquete" ? "Paq" : "Und"}</div>
                </td>
                <td className="px-2 py-1.5">
                  <input type="text" className="w-16 border border-gray-300 px-1.5 py-0.5 rounded text-center text-xs"
                    value={row.cantidad} onChange={(e) => handleInputChange(row._uuid, "cantidad", e.target.value)} />
                  {errSpan(errores[idx]?.cantidad)}
                </td>
                <td className="px-2 py-1.5">
                  <input type="number" className="w-20 border border-gray-300 px-1.5 py-0.5 rounded text-center text-xs"
                    value={row.valor_unitario} onChange={(e) => handleInputChange(row._uuid, "valor_unitario", e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <input type="number" min="0" max="100" step="0.1"
                    className="w-14 border border-gray-300 px-1.5 py-0.5 rounded text-center text-xs"
                    value={row.iva_porcentaje}
                    onChange={(e) => handleInputChange(row._uuid, "iva_porcentaje", e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <div className="text-xs text-gray-500">{formatCurrency(row.valor_paquete)}</div>
                  <div className="text-xs font-semibold text-green-600">{formatCurrency(row.valor_total)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={addRow}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
          <Plus className="w-3.5 h-3.5" />
          Agregar Item
        </button>
      </div>

      {/* Resumen */}
      {rows.length > 0 && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs text-gray-500">
              {rows.length} item{rows.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Subtotal: <strong>{formatCurrency(subtotal)}</strong></span>
              <span className="text-gray-600">IVA: <strong>{formatCurrency(ivaTotal)}</strong></span>
              <span className="text-base font-bold text-green-600">Total: {formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}

      {rows.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">No hay items agregados</p>
          <button onClick={addRow}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Agregar primer item
          </button>
        </div>
      )}
    </div>
  );
}
