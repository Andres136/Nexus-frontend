import { formatCurrency } from "../../helpers";
import { Trash2, Plus, Package, PackageSearch } from "lucide-react";
import useOrdenCompraItems from "../../hooks/useOrdenCompraItems";
import { useProducts } from "../../hooks/useProducts";
import { productsApi } from "../../services/api";
import Select from "react-select";
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const inputCls = "w-full border border-gray-300 px-1.5 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400";
const errSpan = (msg) => msg ? <span className="text-xs text-red-500 block">{msg}</span> : null;

export default function OrdenCompraMultiItem({ onDetallesChange, errores = {}, value = [] }) {
  const { rows, handleInputChange, addRow, removeRow } = useOrdenCompraItems({
    errores,
    onChange: onDetallesChange,
    initialItems: value,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingProductUuid, setEditingProductUuid] = useState(null);
  const { products, isLoading, isEmpty, isFetching } = useProducts({ search: searchTerm });
  const safeProducts = useMemo(
    () =>
      Array.isArray(products?.data)
        ? products.data
        : Array.isArray(products)
          ? products
          : [],
    [products]
  );

  const rowProducts = useMemo(() => rows.map((row) => row.product).filter(Boolean), [rows]);
  const allProducts = useMemo(
    () =>
      [...safeProducts, ...rowProducts, ...selectedProducts].filter(
        (product, index, array) =>
          product?.id && array.findIndex((item) => String(item?.id) === String(product.id)) === index
      ),
    [safeProducts, rowProducts, selectedProducts]
  );

  const selectedProductIds = useMemo(
    () =>
      rows
        .map((row) => row.product_id)
        .filter(Boolean)
        .map(String)
        .join(","),
    [rows]
  );

  useEffect(() => {
    const ids = selectedProductIds ? selectedProductIds.split(",") : [];
    const missingIds = ids.filter(
      (productId) => !allProducts.some((product) => String(product.id) === productId)
    );

    if (missingIds.length === 0) return;

    let isMounted = true;

    Promise.all(
      missingIds.map((productId) =>
        productsApi
          .getById(productId)
          .then((response) => response.data?.data ?? response.data)
          .catch(() => null)
      )
    ).then((loadedProducts) => {
      if (!isMounted) return;

      const validProducts = loadedProducts.filter(Boolean);
      if (validProducts.length === 0) return;

      setSelectedProducts((prev) => {
        const merged = [...prev, ...validProducts];
        return merged.filter(
          (product, index, array) =>
            product?.id && array.findIndex((item) => String(item?.id) === String(product.id)) === index
        );
      });
    });

    return () => {
      isMounted = false;
    };
  }, [selectedProductIds, allProducts]);
 
  const productOptions = allProducts.map((p) => ({
    value: p.id,
    label: `${p.code || p.code_id || "Sin código"} - ${p.name || "Sin nombre"}`,
    product: p,
  }));

  const getProductValue = (row) => {
    if (!row.product_id) return null;

    const product = allProducts.find((p) => String(p.id) === String(row.product_id));
    if (product) {
      return {
        value: product.id,
        label: `${product.code || product.code_id || "Sin código"} - ${product.name || "Sin nombre"}`,
      };
    }

    if (row.product && String(row.product.id) === String(row.product_id)) {
      return {
        value: row.product.id || row.product_id,
        label: `${row.product.code || row.product.code_id || "Sin código"} - ${row.product.name || "Sin nombre"}`,
      };
    }

    return null;
  };

  const getProductDisplayName = (row) => {
    if (!row.product_id) return row.descripcion || "";

    const product = allProducts.find((p) => String(p.id) === String(row.product_id));
    return product?.name || row.product?.name || row.descripcion || "";
  };

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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingProductUuid(row._uuid)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                  title="Buscar producto"
                >
                  <PackageSearch className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  readOnly
                  value={getProductDisplayName(row)}
                  onClick={() => setEditingProductUuid(row._uuid)}
                  placeholder="Sin producto seleccionado"
                  className="flex-1 cursor-pointer rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 hover:border-blue-400"
                />
              </div>

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
              <th className="px-1 py-2 w-8"></th>
              <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase min-w-[160px]">Referencia</th>
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
                <td className="px-1 py-1.5 text-center">
                  <button
                    onClick={() => setEditingProductUuid(row._uuid)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                    title="Buscar producto"
                  >
                    <PackageSearch className="w-3.5 h-3.5" />
                  </button>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    readOnly
                    value={getProductDisplayName(row)}
                    onClick={() => setEditingProductUuid(row._uuid)}
                    placeholder="Sin producto"
                    className="w-full min-w-[140px] cursor-pointer rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 hover:border-blue-400"
                    title="Clic para cambiar"
                  />
                </td>
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

      {editingProductUuid !== null && (() => {
        const editingRow = rows.find((r) => r._uuid === editingProductUuid);
        if (!editingRow) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setEditingProductUuid(null)}
          >
            <div
              className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageSearch className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Seleccionar producto — Ítem #{editingRow.observaciones}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingProductUuid(null)}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-lg leading-none"
                >
                  ✕
                </button>
              </div>
              <Select
                isLoading={isLoading || isFetching}
                options={productOptions}
                value={getProductValue(editingRow)}
                onChange={(opt) => {
                  handleInputChange(editingRow._uuid, "product_id", opt ? opt.value : "", {
                    product: opt?.product || null,
                  });
                  setEditingProductUuid(null);
                }}
                onInputChange={(v) => setSearchTerm(v)}
                placeholder="Buscar por código o nombre..."
                noOptionsMessage={() => isLoading ? "Cargando..." : isEmpty ? "Sin resultados" : "Escribe para buscar"}
                autoFocus
                menuIsOpen
                styles={{
                  control: (base) => ({ ...base, minHeight: "36px", fontSize: "13px", boxShadow: "none" }),
                  menu: (base) => ({ ...base, position: "relative", boxShadow: "none", border: "1px solid #e5e7eb", marginTop: "8px" }),
                }}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}

OrdenCompraMultiItem.propTypes = {
  onDetallesChange: PropTypes.func,
  errores: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  value: PropTypes.array,
};
