
import Select from "react-select"
import { useProducts } from "../../hooks/useProducts";
import { useGetPuck } from "../../hooks/contabilidad/useGetPuck";
import { productsApi } from "../../services/api";
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

export default function DetallesFacturaCompras({
  detalles = [],
  addDetalle,
  updateDetalle,
  removeDetalle,
  error = {},
  impuestos = [],
}) {
 // console.log("🚀 ~ file: DetallesFacturaCompras.jsx:5 ~ DetallesFacturaCompras ~ impuestos:", impuestos)
  const { pucks } = useGetPuck();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { products,isLoading, isEmpty, isFetching } = useProducts({ search: searchTerm });
  const calcularTotalDetalle = (detalle) => {
    const base = Number(detalle.cantidad || 0) * Number(detalle.precio_unitario || 0);
    const efectoImpuestos = (detalle.impuestos || []).reduce((total, impuestoSeleccionado) => {
      const impuesto = impuestos.find(
        (item) => Number(item.id) === Number(impuestoSeleccionado.impuesto_id)
      );
      const monto = base * (Number(impuesto?.porcentaje || 0) / 100);

      return total + (impuesto?.operacion === "resta" ? -monto : monto);
    }, 0);

    return base + efectoImpuestos;
  };
  const formatCOP = (value) =>
    Number(value || 0).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const safeProducts = useMemo(
    () =>
      Array.isArray(products?.data)
        ? products.data
        : Array.isArray(products)
          ? products
          : [],
    [products]
  );
  const allProducts = useMemo(
    () =>
      [...safeProducts, ...selectedProducts].filter(
        (product, index, array) =>
          product?.id && array.findIndex((item) => String(item?.id) === String(product.id)) === index
      ),
    [safeProducts, selectedProducts]
  );
  const productOptions = useMemo(
    () =>
      allProducts.map((product) => ({
        value: product.id,
        label: `${product.code || product.code_id || "Sin código"} - ${product.name || "Sin nombre"}`,
        product,
      })),
    [allProducts]
  );
  const detalleProductIds = useMemo(
    () => detalles.map((detalle) => detalle.producto_id).filter(Boolean).map(String).join(","),
    [detalles]
  );

  useEffect(() => {
    const ids = detalleProductIds ? detalleProductIds.split(",") : [];
    const missingIds = ids.filter(
      (productId) => !allProducts.some((product) => String(product.id) === productId)
    );
    if (missingIds.length === 0) return;

    let active = true;
    Promise.all(
      missingIds.map((productId) =>
        productsApi
          .getById(productId)
          .then((response) => response.data?.data ?? response.data)
          .catch(() => null)
      )
    ).then((loadedProducts) => {
      if (!active) return;
      setSelectedProducts((previous) =>
        [...previous, ...loadedProducts.filter(Boolean)].filter(
          (product, index, array) =>
            product?.id && array.findIndex((item) => String(item?.id) === String(product.id)) === index
        )
      );
    });

    return () => {
      active = false;
    };
  }, [allProducts, detalleProductIds]);
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
              <th className="px-3 py-2 w-20">Item</th>
              <th className="px-3 py-2 w-32">Puc </th>
              <th className="px-3 py-2 w-56">Producto </th>
              <th className="px-3 py-2 w-48">Impuestos </th>
              <th className="px-3 py-2 w-24">Cantidad</th>
              {/*   <th className="px-3 py-2">Bodega Destino</th>*/}
            
              <th className="px-3 py-2 w-40">Precio Unitario</th>
              <th className="px-3 py-2 w-40 text-right">Total línea</th>
              <th className="px-3 py-2 w-10 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {detalles.map((det, index) => (
              <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-2 py-2">
                  {index + 1}
                </td>
                  <td className="px-2 py-2">
                    <Select
                      placeholder="Puc..."
                      className="text-xs"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={selectStyles}
                      options={pucks?.map(p => ({ value: p.id, label: `${p.numero} - ${p.nombre}` }))}
                      value={pucks?.map(p => ({ value: p.id, label: `${p.numero} - ${p.nombre}` })).find(o => o.value === det.puck_id) || null}
                      onChange={(s) => updateDetalle(index, "puck_id", s?.value || null)}
                    />
                    {error?.[`detalles.${index}.puck_id`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {error[`detalles.${index}.puck_id`]}
                      </p>
                    )}
                  </td>

                <td className="px-2 py-2">
                   <Select
                    placeholder="Buscar producto..."
                    className="text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={selectStyles}
                    isLoading={isLoading || isFetching}
                    options={productOptions}
                    value={productOptions.find(o => String(o.value) === String(det.producto_id)) || null}
                    onChange={(option) => {
                      if (option?.product) {
                        setSelectedProducts((previous) =>
                          previous.some((product) => String(product.id) === String(option.product.id))
                            ? previous
                            : [...previous, option.product]
                        );
                      }
                      updateDetalle(index, "producto_id", option?.value || null);
                    }}
                    onInputChange={(value) => setSearchTerm(value)}
                    noOptionsMessage={() =>
                      isLoading || isFetching
                        ? "Buscando productos..."
                        : isEmpty
                          ? "Sin resultados"
                          : "Escribe para buscar"
                    }
                  />
                  {error?.[`detalles.${index}.producto_id`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {error[`detalles.${index}.producto_id`]}
                    </p>
                  )}
                </td>
                <td className="px-2 py-2">
  <Select
    isMulti
    placeholder="Impuestos..."
    className="text-xs"
    menuPortalTarget={document.body}
    menuPosition="fixed"
    styles={selectStyles}
    options={impuestos?.map(i => ({
      value: i.id,
      label: `${i.nombre} (${i.operacion === "resta" ? "−" : "+"}${i.porcentaje}%)`
    }))}

    value={det.impuestos?.map(i => {
      const imp = impuestos.find(x => x.id === i.impuesto_id);
      return imp
        ? { value: imp.id, label: `${imp.nombre} (${imp.operacion === "resta" ? "−" : "+"}${imp.porcentaje}%)` }
        : null;
    }).filter(Boolean) || []}

    onChange={(selected) =>
      updateDetalle(
        index,
        "impuestos",
        selected ? selected.map(s => ({ impuesto_id: s.value })) : []
      )
    }
  />

  {error?.[`detalles.${index}.impuestos`] && (
    <p className="text-red-500 text-xs mt-1">
      {error[`detalles.${index}.impuestos`]}
    </p>
  )}

  {error?.[`detalles.${index}.impuestos`]?.length > 0 && (
    <p className="text-red-500 text-xs mt-1">
      {error[`detalles.${index}.impuestos`].join(", ")}
    </p>
  )}
</td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    className="w-full px-2 py-1 text-xs border rounded border-gray-300"
                    value={det.cantidad}
                    onChange={(e) => updateDetalle(index, "cantidad", e.target.value)}
                  />
                  {error?.[`detalles.${index}.cantidad`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {error[`detalles.${index}.cantidad`]}
                    </p>
                  )}
                </td>

                {/* <td className="px-2 py-2">
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
                  {error?.[`detalles.${index}.bodega_id`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {error[`detalles.${index}.bodega_id`]}
                    </p>
                  )}
                </td>*/}
                <td className="px-2 py-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-gray-400 text-xs">$</span>
                    <input
                      type="number"
                      className="w-full pl-5 pr-2 py-1 text-xs border rounded border-gray-300"
                      value={det.precio_unitario}
                      onChange={(e) => updateDetalle(index, "precio_unitario", e.target.value)}
                    />
                    {error?.[`detalles.${index}.precio_unitario`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {error[`detalles.${index}.precio_unitario`]}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 text-right text-xs font-semibold text-gray-700">
                  {formatCOP(calcularTotalDetalle(det))}
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

DetallesFacturaCompras.propTypes = {
  detalles: PropTypes.arrayOf(PropTypes.object),
  addDetalle: PropTypes.func.isRequired,
  updateDetalle: PropTypes.func.isRequired,
  removeDetalle: PropTypes.func.isRequired,
  error: PropTypes.object,
  impuestos: PropTypes.arrayOf(PropTypes.object),
};
