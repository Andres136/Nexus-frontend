import { formatCurrency } from "../../helpers";
import { Trash2, Plus, Package } from "lucide-react";
import useOrdenCompraItems from "../../hooks/useOrdenCompraItems";
import { useProducts } from "../../hooks/useProducts";
import Select from "react-select";
import { useState } from "react";

export default function OrdenCompraMultiItem({ onDetallesChange, errores = {}, value = [] }) {
  const { rows, handleInputChange, addRow, removeRow } = useOrdenCompraItems({
    errores,
    onChange: onDetallesChange,
    initialItems: value,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { products, isLoading, isEmpty, isFetching } = useProducts({ search: searchTerm });





  return (
    <div className="space-y-4">
      {/* Header */}
  

      {/* Cards para móvil y tabla para desktop */}
      <div className="block lg:hidden space-y-4">
        {/* Vista móvil - Cards */}
        {rows.map((row) => (
          <div key={row._uuid} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900">Item #{row.observaciones}</span>
              <button
                onClick={() => removeRow(row._uuid)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Producto */}
              <div>
            
                        <Select
  isLoading={isLoading || isFetching}
  options={products.map((p) => ({
    value: p.id,
    label: `${p.code || p.code_id || "Sin código"} - ${p.name || "Sin nombre"}`,
    code: p.code,
    name: p.name,
  }))}
  value={
    row.product_id && products.length > 0
      ? (() => {
          const product = products.find((p) => p.id === row.product_id);
          if (product) {
            return {
              value: product.id,
              label: `${product.code || product.code_id || "Sin código"} - ${product.name || "Sin nombre"}`,
            };
          } 
        })()
      : null
  }
  onChange={(selectedOption) => {
    handleInputChange(row._uuid, "product_id", selectedOption ? selectedOption.value : "");
  }}
  onInputChange={(inputValue) => setSearchTerm(inputValue)}
  placeholder="Buscar producto por código o nombre..."
  noOptionsMessage={() =>
    isLoading
      ? "Cargando productos..."
      : isEmpty
      ? "No se encontraron productos"
      : "Escribe para buscar"
  }
  className="min-w-[250px]"
  menuPortalTarget={document.body}
  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base, { data }) => ({
      ...base,
      minHeight: "32px",
      fontSize: "14px",
      borderColor: data?.isInvalid ? "#dc2626" : base.borderColor,
    }),
    singleValue: (base, { data }) => ({
      ...base,
      color: data?.isInvalid ? "#dc2626" : base.color,
    }),
  }}
/>
              </div>

              {/* Dimensiones */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ancho (cm)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                    value={row.ancho_cm}
                    onChange={(e) => handleInputChange(row._uuid, "ancho_cm", e.target.value)}
                  />
                {errores[rows.indexOf(row)]?.ancho_cm && (
                  <span className="text-xs text-red-500">
                    {errores[rows.indexOf(row)].ancho_cm}
                  </span>
                )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Largo (cm)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                    value={row.largo_cm}
                    onChange={(e) => handleInputChange(row._uuid, "largo_cm", e.target.value)}
                  />
                {errores[rows.indexOf(row)]?.largo_cm && (
                  <span className="text-xs text-red-500">
                    {errores[rows.indexOf(row)].largo_cm}
                  </span>
                )}
                </div>
              </div>

              {/* Calibre y Cliente */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calibre</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                    value={row.calibre}
                    onChange={(e) => handleInputChange(row._uuid, "calibre", e.target.value)}
                  />
                  {errores[rows.indexOf(row)]?.calibre && (
                    <span className="text-xs text-red-500">
                      {errores[rows.indexOf(row)].calibre}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                    value={row.cliente_clb}
                    onChange={(e) => handleInputChange(row._uuid, "cliente_clb", e.target.value)}
                  />
                </div>
              </div>

              {/* Información calculada */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Peso Bolsa</div>
                  <div className="text-lg font-semibold text-gray-900">{row.peso_bolsa.toFixed(2)} kg</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Nº Bolsas</div>
                  <div className="text-lg font-semibold text-gray-900">{row.numero_bolsas.toFixed(0)}</div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm uppercase"
                  value={row.descripcion}
                  onChange={(e) => handleInputChange(row._uuid, "descripcion", e.target.value)}
                />

                {errores[rows.indexOf(row)]?.descripcion && (
                    <span className="text-xs text-red-500">
                      {errores[rows.indexOf(row)].descripcion}
                    </span>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Embalaje</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                    checked={row.tipo_embalaje === "paquete"}
                    onChange={(e) =>
                      handleInputChange(
                        row._uuid,
                        "tipo_embalaje",
                        e.target.checked ? "paquete" : "unidad"
                      )
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {row.tipo_embalaje === "paquete" ? "Paquete" : "Unidad"}
                  </span>
                </div>
              </div>

              {/* Cantidad y Precios */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                    value={row.cantidad}
                    onChange={(e) => handleInputChange(row._uuid, "cantidad", e.target.value)}
                  />
               {errores[rows.indexOf(row)]?.cantidad && (
                  <span className="text-xs text-red-500">
                    {errores[rows.indexOf(row)].cantidad}
                  </span>
                )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unit.</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
                    value={row.valor_unitario}
                    onChange={(e) => handleInputChange(row._uuid, "valor_unitario", e.target.value)}
                  />
                </div>
              </div>

              {/* Total */}
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-sm font-medium text-green-700">Total</div>
                <div className="text-xl font-bold text-green-900">{formatCurrency(row.valor_total)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">Producto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensiones</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calibre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info Bolsas</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Embalaje</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row._uuid} className="hover:bg-gray-50 transition-colors">
                {/* Acciones */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeRow(row._uuid)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>

                {/* Item */}
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  #{row.observaciones}
                </td>

                {/* Producto */}
                <td className="px-4 py-3">
           <Select
  isLoading={isLoading || isFetching}
  options={products.map((p) => ({
    value: p.id,
    label: `${p.code || p.code_id || "Sin código"} - ${p.name || "Sin nombre"}`,
    code: p.code,
    name: p.name,
  }))}
  value={
    row.product_id && products.length > 0
      ? (() => {
          const product = products.find((p) => p.id === row.product_id);
          if (product) {
            return {
              value: product.id,
              label: `${product.code || product.code_id || "Sin código"} - ${product.name || "Sin nombre"}`,
            };
          } 
        })()
      : null
  }
  onChange={(selectedOption) => {
    handleInputChange(row._uuid, "product_id", selectedOption ? selectedOption.value : "");
  }}
  onInputChange={(inputValue) => setSearchTerm(inputValue)}
  placeholder="Buscar producto por código o nombre..."
  noOptionsMessage={() =>
    isLoading
      ? "Cargando productos..."
      : isEmpty
      ? "No se encontraron productos"
      : "Escribe para buscar"
  }
  className="min-w-[250px]"
  menuPortalTarget={document.body}
  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base, { data }) => ({
      ...base,
      minHeight: "32px",
      fontSize: "14px",
      borderColor: data?.isInvalid ? "#dc2626" : base.borderColor,
    }),
    singleValue: (base, { data }) => ({
      ...base,
      color: data?.isInvalid ? "#dc2626" : base.color,
    }),
  }}
/>

                </td>

                {/* Dimensiones */}
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Ancho cm"
                      className="w-full border border-gray-300 px-2 py-1 rounded text-xs"
                      value={row.ancho_cm}
                      onChange={(e) => handleInputChange(row._uuid, "ancho_cm", e.target.value)}
                    />
                    {errores[rows.indexOf(row)]?.ancho_cm && (
                      <span className="text-xs text-red-500">
                        {errores[rows.indexOf(row)].ancho_cm}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    <input
                      type="text"
                      placeholder="Largo cm"
                      className="w-full border border-gray-300 px-2 py-1 rounded text-xs"
                      value={row.largo_cm}
                      onChange={(e) => handleInputChange(row._uuid, "largo_cm", e.target.value)}
                    />
                    {errores[rows.indexOf(row)]?.largo_cm && (
                      <span className="text-xs text-red-500">
                        {errores[rows.indexOf(row)].largo_cm}
                      </span>
                    )}
                  </div>
                </td>

                {/* Calibre */}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    className="w-20 border border-gray-300 px-2 py-1 rounded text-center text-sm"
                    value={row.calibre}
                    onChange={(e) => handleInputChange(row._uuid, "calibre", e.target.value)}
                  />
                </td>

                {/* Info Bolsas */}
                <td className="px-4 py-3">
                  <div className="text-xs space-y-1">
                    <div><strong>Peso:</strong> {row.peso_bolsa.toFixed(2)} kg</div>
                    <div><strong>Bolsas:</strong> {row.numero_bolsas.toFixed(0)}</div>
                    <div><strong>Total:</strong> {row.cantidad_requerida_kg.toFixed(2)} kg</div>
                  </div>
                </td>

                {/* Cliente */}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    className="w-24 border border-gray-300 px-2 py-1 rounded text-center text-sm"
                    value={row.cliente_clb}
                    onChange={(e) => handleInputChange(row._uuid, "cliente_clb", e.target.value)}
                  />
                </td>

                {/* Descripción */}
                <td className="px-4 py-3">
                  <textarea
                    type="text"
                    className="w-32 border border-gray-300 px-2 py-1 rounded text-sm uppercase"
                    value={row.descripcion}
                    onChange={(e) => handleInputChange(row._uuid, "descripcion", e.target.value)}
                  />

                  {errores[rows.indexOf(row)]?.descripcion && (
                    <span className="text-xs text-red-500">
                      {errores[rows.indexOf(row)].descripcion}
                    </span>
                  )}
                </td>

                {/* Tipo de Embalaje checkbox */}
    <td className="px-4 py-3">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
      checked={row.tipo_embalaje === "paquete"}
      onChange={(e) =>
        handleInputChange(
          row._uuid,
          "tipo_embalaje",
          e.target.checked ? "paquete" : "unidad"
        )
      }
    />
    <span className="text-sm text-gray-700">
      {row.tipo_embalaje === "paquete" ? "Paquete" : "Unidad"}
    </span>
  </label>
</td>


                {/* Cantidad */}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    className="w-20 border border-gray-300 px-2 py-1 rounded text-center text-sm"
                    value={row.cantidad}
                    onChange={(e) => handleInputChange(row._uuid, "cantidad", e.target.value)}
                  />
                      {errores[rows.indexOf(row)]?.cantidad && (
                  <span className="text-xs text-red-500">
                    {errores[rows.indexOf(row)].cantidad}
                  </span>
                )}
                </td>

                {/* Precio */}
                <td className="px-4 py-3">
                  <input
                    type="number"
                    className="w-24 border border-gray-300 px-2 py-1 rounded text-center text-sm"
                    value={row.valor_unitario}
                    onChange={(e) => handleInputChange(row._uuid, "valor_unitario", e.target.value)}
                  />
                </td>

                {/* Total */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(row.valor_total)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

     
      </div>
       <div className="flex items-center justify-between">
 
        <button
          onClick={addRow}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Item
        </button>
      </div>
      {/* Resumen */}
      {rows.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Total de items: <span className="font-semibold text-gray-900">{rows.length}</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              Total General: {formatCurrency(rows.reduce((sum, row) => sum + row.valor_total, 0))}
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {rows.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay items agregados</h3>
          <p className="text-gray-500 mb-4">Comienza agregando un producto a tu orden</p>
          <button
            onClick={addRow}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar primer item
          </button>
        </div>
      )}
    </div>
  );
}