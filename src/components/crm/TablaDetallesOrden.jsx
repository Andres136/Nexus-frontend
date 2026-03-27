import { formatCurrency } from "../../helpers";

import Select from "react-select";
import { productsApi } from "../../services/api";


import {
  Package,
  AlertCircle,
  X,
  MapPin,
  Building2,
  Box,
  Search,
  Eye,
  Loader2,

  ClipboardList,
  Save,
} from "lucide-react";

import { useTablaDetallesOrden } from "../../hooks/crm/useTablaDetallesOrden";

export default function TablaDetallesOrden({
  orden,
  detalles,
  entregas,
  errores,
  handleChangeDetalle,
  valorTotal = 0,
}) {
  const{
 
        setSearch,
        products,
        isLoading,
        isFetching,
        isEmpty,
        bodegasDisponibles,
        
        loadingStock,
        modalOpen,
        setModalOpen,
        detalleActivo,
        setDetalleActivo,
        errors,
        setErrors,
        pdfUrl,
    
        stockErrors,
        setStockErrors,
        ensureProductLoaded,
        handleDescontarStockMasivo,
        formatNumber,
        stockCache,
        fetchStockForProduct,
        setProductStock,
        setBodegasDisponibles,
        setLoadingStock,
        productCache,
        enviarInstruccionesAlistamiento,
        configuracionesDescuento,
        guardarConfiguracionDescuento,

        alistamientosPorDetalle

  }=useTablaDetallesOrden(detalles, orden);


  // ✅ Componente customizado para opciones de bodega
  const BodegaOption = ({
    innerRef,
    innerProps,
    data,
    isSelected,
    isFocused,
  }) => (
    <div
      ref={innerRef}
      {...innerProps}
      className={`p-3 cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-100 border-l-4 border-blue-500"
          : isFocused
          ? "bg-gray-100"
          : "bg-white"
      } hover:bg-gray-50`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isSelected ? "bg-blue-200" : "bg-gray-100"
            }`}
          >
            <Building2 className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {data.bodega_nombre}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              {data.sede_nombre}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-lg font-bold ${
              data.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {formatNumber(data.stock)}
          </div>
          <div className="text-xs text-gray-500">unidades</div>
        </div>
      </div>
    </div>
  );

  // ✅ Componente customizado para opciones de producto
  const ProductOption = ({
    innerRef,
    innerProps,
    data,
    isSelected,
    isFocused,
  }) => (
    <div
      ref={innerRef}
      {...innerProps}
      className={`p-3 cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-100 border-l-4 border-blue-500"
          : isFocused
          ? "bg-gray-100"
          : "bg-white"
      } hover:bg-gray-50`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isSelected ? "bg-blue-200" : "bg-gray-100"
          }`}
        >
          <Box className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{data.name}</div>
          <div className="text-sm text-gray-500">{data.code}</div>
          {data.description && (
            <div className="text-xs text-gray-400 mt-1 truncate">
              {data.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ✅ Estilos personalizados para react-select
  // ✅ Estilos personalizados para react-select CON Z-INDEX CORREGIDO
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.5rem",
      minHeight: "44px",
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        borderColor: "#3B82F6",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      border: "1px solid #E5E7EB",
      overflow: "hidden",
      zIndex: 9999, // ✅ Z-index alto para que aparezca sobre el modal
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999, // ✅ Z-index para el portal
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
      maxHeight: "200px",
    }),
    option: () => ({
      // Removemos los estilos default porque usamos componentes custom
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#EBF4FF",
      borderRadius: "0.375rem",
      border: "1px solid #BFDBFE",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1E40AF",
      fontWeight: "500",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#1E40AF",
      "&:hover": {
        backgroundColor: "#BFDBFE",
        color: "#1E40AF",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
      fontWeight: "400",
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "#6B7280",
      fontStyle: "italic",
    }),
  };

  return (
    <div className="space-y-4">
      {/* Header simple */}
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Detalles de la Orden
        </h3>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
          {detalles?.length || 0} items
        </span>
      </div>

      {/* ...existing code... tabla */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 text-white">
            <tr>
              {[
                "Item",
                "Referencia",
                "Stock",
                "Medidas",
                 "Descripción",
                "Clb Cl",
                "Peso (Kg)",
       
                "Cantidad",
                "Enviada",
                "Faltantes",
                "Entregas",
                'Alistamiento',
                "Valor Unit.",
                "Total",
              ].map((head) => (
                <th
                  key={head}
                  className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(detalles || []).map((detalle, index) => (
              <tr
                key={detalle.id ?? `new-${index}`}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Item */}
                <td className="px-3 py-3 text-sm font-medium text-gray-900">
                  #{detalle.observaciones}
                </td>

                {/* Referencia */}
                <td className="px-3 py-3">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {detalle.product?.name || "Sin producto"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {detalle.product?.code}
                    </div>
                  </div>
                </td>

                {/* 🆕 COLUMNA "Bodegas" tipo DetalleTraslado */}
                <td
                  className={`px-3 py-3 align-top transition-colors ${
                    detalle.producto_equivalentes &&
                    detalle.producto_equivalentes.length > 0
                      ? "bg-blue-50 border-l-4 border-red-400 shadow-sm"
                      : ""
                  }`}
                >
                  {(() => {
                    const productId = detalle.product_id || detalle.product?.id;
                    const base = stockCache[productId]?.producto_base;
                    const bodegasBase = base?.resumen_por_bodega || [];

                    // Si no hay stock en ninguna bodega, mostramos aviso y salimos

                    return (
                      <>
                        {/* Stock total disponible */}
                        {(() => {
                          const totalStock = bodegasBase.reduce(
                            (sum, b) => sum + (b.stock_total || 0),
                            0
                          );
                          return (
                            <div className="text-[11px] text-gray-500 mb-1">
                              Stock total:{" "}
                              <span className="font-medium text-gray-700">
                                {totalStock}
                              </span>{" "}
                              u
                            </div>
                          );
                        })()}

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Select
                              isMulti
                              placeholder="Seleccionar bodegas..."
                              options={bodegasBase
                                .filter((b) => (b.stock_total || 0) > 0)
                                .map((b) => ({
                                  value: b.bodega_id,
                                  label: `${b.bodega_nombre} -  (${b.stock_total} u)`,
                                  stock: b.stock_total,
                                  nombre: b.bodega_nombre,
                                  sede: b.sede_nombre,
                                }))}
                              onChange={(selected) => {
                                const bodegas = (selected || []).map((sel) => ({
                                  bodega_id: sel.value,
                                  bodega_nombre: sel.nombre,
                                  sede_nombre: sel.sede,
                                  stock: sel.stock,
                                  cantidad: 0,
                                }));
                                // guarda la selección a nivel de detalle
                                handleChangeDetalle(index, "bodegas", bodegas);

                                setErrors((prev) => ({
                                  ...prev,
                                  [`items.${index}.bodegas`]: [],
                                }));
                              }}
                              value={(detalle.bodegas || []).map((b) => ({
                                value: b.bodega_id,
                                label: `${b.bodega_nombre} - ${
                                  b.sede_nombre || ""
                                } (${b.stock || 0} u)`,
                                stock: b.stock,
                                nombre: b.bodega_nombre,
                                sede: b.sede_nombre,
                              }))}
                              className="text-xs"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: "32px",
                                  fontSize: "12px",
                                }),
                                multiValue: (base) => ({
                                  ...base,
                                  fontSize: "11px",
                                }),
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                              }}
                              menuPortalTarget={document.body}
                              noOptionsMessage={() =>
                                "No hay bodegas con stock"
                              }
                            />
                          </div>

                          <button
                            onClick={async () => {
                              const productId =
                                detalle.product_id || detalle.product?.id;
                              const cacheData = stockCache[productId];

                              const sugerencias =
                                cacheData?.sugerencias?.map((sug) => ({
                                  id: sug.id,
                                  nombre: sug.nombre,
                                  stock_total: sug.stock_total,
                                  resumen_por_bodega:
                                    sug.resumen_por_bodega || [],
                                })) || [];

                              // ✅ Carga stock específico para este producto
                              const stockData = await fetchStockForProduct(
                                detalle
                              );

                              setDetalleActivo({
                                index,
                                ...detalle,
                                producto_sugerencias: sugerencias,
                                cantidad_total: detalle.cantidad_requerida_kg, // 🔹 Usamos cantidad requerida para sugerencias
                                stock_local: stockData, // 🔹 Guardamos stock local
                              });

                              // ✅ Ahora ya no dependemos del stockInfo global
                              setProductStock(stockData);
                              setBodegasDisponibles(
                                stockData?.resumen_por_bodega || []
                              );
                              setErrors({});
                              setModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition p-1"
                            title="Buscar equivalentes"
                          >
                            <Search className="w-5 h-5" />
                          </button>
                        </div>

                        {errors?.[`items.${index}.bodegas`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`items.${index}.bodegas`][0]}
                          </p>
                        )}

                        {errors?.[`items.${index}.cantidad`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`items.${index}.cantidad`][0]}
                          </p>
                        )}

                        {/* Cantidades por bodega seleccionada */}
                        {(detalle.bodegas || []).map((b, i) => {
                          const info = bodegasBase.find(
                            (x) => x.bodega_id === b.bodega_id
                          );
                          const max = info?.stock_total ?? b.stock ?? 0;
                          return (
                            <div
                              key={`${b.bodega_id}-${i}`}
                              className="mt-1 flex items-center gap-2 bg-gray-50 border rounded p-2 text-xs"
                            >
                              <div className="flex-1 truncate">
                                <div className="font-medium text-gray-700">
                                  {b.bodega_nombre}
                                </div>
                                <div className="text-gray-500">
                                  Stock: {max} u
                                </div>
                              </div>

                              <input
                                type="number"
                                className="border rounded px-2 py-1 w-24 text-right"
                                step="0.01"
                                min="0"
                                max={max}
                                placeholder="0.00"
                                value={b.cantidad === 0 ? "" : b.cantidad ?? ""}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const nueva = [...(detalle.bodegas || [])];
                                  nueva[i].cantidad = val;

                                  // 1) actualiza bodegas
                                  handleChangeDetalle(index, "bodegas", nueva);
                                }}
                              />
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </td>
{/* Medidas (Ancho x Largo x Calibre) - Solo lectura */}
<td className="px-3 py-3 text-sm text-gray-900">
  <div className="flex flex-col gap-0.5">
    <span className="font-medium">
      ancho {parseInt(detalle.ancho_cm) || 0} * Largo {parseInt(detalle.largo_cm) || 0}
    </span>
    <span className="text-xs text-gray-500">
      Calibre: {parseInt(detalle.calibre) || 0}
    </span>
  </div>
</td>
             
    <td className="px-3 py-3 text-sm text-gray-900 max-w-32 truncate">
                  <textarea 
                  readOnly
                  value={detalle.descripcion}
                  name="descripcion" id="" className="w-full border rounded-lg px-2 py-1 text-sm transition-colors">
                    {detalle.descripcion}
                  </textarea>
                </td>
                <td className="px-3 py-3 text-sm text-gray-900">
                  {detalle.cliente_clb}
                </td>

                <td className="px-3 py-3 text-center text-sm font-medium">
                  {detalle.cantidad_requerida_kg?.toFixed(2) || 0}
                </td>

            

                <td className="px-3 py-3">
                  <input
                    type="number"
                    className={`w-20 border rounded-lg px-2 py-1 text-sm transition-colors ${
                      errores?.[index]?.cantidad
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    } focus:outline-none`}
                    value={detalle.cantidad}
                    readOnly={true}
               
                    placeholder="0"
                  />
                  {errores?.[index]?.cantidad && (
                    <p className="text-red-500 text-xs mt-1">
                      {errores[index].cantidad[0]}
                    </p>
                  )}
                </td>
                {/* 🔹 Columna ENVIADA (total acumulado + nueva entrega) */}
                <td className="px-3 py-3 text-sm text-gray-900">
                  <div className="flex flex-col gap-1">
                    {/* 🔸 Mostrar acumulado total entregado */}
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>Enviado total:</span>
                      <span
                        className={`font-semibold ${
                          (detalle.cantidadEnviada || 0) > 0
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        {detalle.cantidadEnviada || 0} u
                      </span>
                    </div>

                    {/* 🔸 Input para registrar nueva entrega */}
                    <input
                      type="number"
                      className={`w-full border rounded-lg px-2 py-1 text-sm text-right transition-colors ${
                        errores?.[index]?.nuevaCantidad
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      } focus:outline-none`}
                      value={detalle.nuevaCantidad || ""}
                      onChange={(e) =>
                        handleChangeDetalle(
                          index,
                          "nuevaCantidad",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Nueva entrega"
                      min="0"
                      step="0.01"
                    />

                    {/* 🔸 Mensaje de error si aplica */}
                    {errores?.[index]?.nuevaCantidad && (
                      <p className="text-red-500 text-xs mt-1">
                        {errores[index].nuevaCantidad[0]}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-3 py-3 text-center">
                  <span
                    className={`font-medium ${
                      (detalle.faltantesTemporal !== undefined
                        ? detalle.faltantesTemporal
                        : detalle.faltantes) > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {detalle.faltantesTemporal !== undefined
                      ? detalle.faltantesTemporal
                      : detalle.faltantes}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <div className="max-h-20 overflow-y-auto">
                    {(() => {
                      const entregasDetalle = entregas.filter(
                        (e) => e.detalle_id === detalle.id
                      );

                      if (entregasDetalle.length === 0) {
                        return (
                          <span className="text-gray-400 text-xs italic">
                            Sin entregas
                          </span>
                        );
                      }

                      return entregasDetalle.map((e) => (
                        <div
                          key={e.id}
                          className="text-xs border-b border-gray-100 py-1"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{e.cantidad}u.</span>
                            <span className="text-gray-500">
                              {e.usuario?.name}
                            </span>
                          </div>
                          <div className="text-gray-400">{e.fecha_entrega}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </td>

  <td className="px-3 py-3 text-xs">
  {(() => {
    const lista = alistamientosPorDetalle(detalle.id);

    if (lista.length === 0) {
      return <span className="text-gray-400">Sin alistar</span>;
    }

    // 🔥 AGRUPAR (CLAVE)
    const agrupado = Object.values(
      lista.reduce((acc, item) => {
        const key = `${item.producto_id}-${item.bodega_id}`;

        if (!acc[key]) {
          acc[key] = { ...item, cantidad: 0 };
        }

        acc[key].cantidad += parseFloat(item.cantidad);
        return acc;
      }, {})
    );

    return (
      <div className="max-h-20 overflow-y-auto space-y-1">
        {agrupado.map((a, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-xs border-b last:border-0 pb-1"
          >
            {/* 🔹 Producto + ubicación */}
            <div className="flex flex-col truncate">
              <span className="font-medium text-gray-800 truncate">
                {a.producto?.name}
              </span>
           <span className="text-gray-400 truncate">
  {a.bodega?.nombre}
  {a.bodega?.sede?.nombre && ` - ${a.bodega.sede.nombre}`}
</span>
            </div>

            {/* 🔹 Cantidad */}
            <span className="text-green-600 font-semibold ml-2">
              {a.cantidad}
            </span>
          </div>
        ))}
      </div>
    );
  })()}
</td>

                <td className="px-3 py-3 text-right text-sm">
                  {formatCurrency(detalle.valor_unitario)}
                </td>

                <td className="px-3 py-3 text-right text-sm font-semibold">
                  {formatCurrency(detalle.valor_total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pdfUrl && (
        <div className="mt-4 text-center">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <Eye className="w-4 h-4" />
            Ver Movimiento de Stock (PDF)
          </a>
        </div>
      )}
      <div className="flex justify-end mt-4 gap-3">
        <button
          onClick={handleDescontarStockMasivo}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          disabled={loadingStock}
        >
          {loadingStock ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
            </>
          ) : (
            <>
              Descontar Masivamente
            </>
          )}
        </button>


        {/* Junto al botón "Descontar Masivamente" */}
<button
  onClick={enviarInstruccionesAlistamiento}
  className="bg-amber-600 text-white px-5 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 transition-colors"
  disabled={loadingStock || Object.keys(configuracionesDescuento).length === 0}
>
  {loadingStock ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
    </>
  ) : (
    <>
      <ClipboardList className="w-4 h-4" />
      Enviar a Alistamiento ({Object.keys(configuracionesDescuento).length})
    </>
  )}
</button>
        {/* Debajo del botón "Descontar Masivamente"
<pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
  {JSON.stringify(configuracionesDescuento, null, 2)}
</pre> */}
      </div>

      {/* Total simple */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Valor Total:</span>
          <span className="text-xl font-bold text-green-600">
            {formatCurrency(valorTotal)}
          </span>
        </div>
      </div>

      {/* Modal mejorado pero simple */}
      {modalOpen && detalleActivo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">
                  {detalleActivo.product?.name}
                </h3>
                <p className="text-blue-100 text-sm">
                  {detalleActivo.product?.code}
                </p>
              </div>
              <button
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                onClick={() => {
                  setModalOpen(false);
                  setProductStock(null);
                  setErrors({});
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              {/* Stock disponible */}

              {/* Errores globales */}
              {errors.producto_equivalentes && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 text-sm">
                      {Array.isArray(errors.producto_equivalentes)
                        ? errors.producto_equivalentes.join(", ")
                        : errors.producto_equivalentes}
                    </span>
                  </div>
                </div>
              )}

              {errors.message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 text-sm">
                      {errors.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Cantidad requerida */}

              {/* Cantidad requerida */}
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Cantidad total requerida
                </label>
                <input
                  type="number"
                  className={`w-full border rounded-lg px-4 py-3 text-lg ${
                    errors.cantidad ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={detalleActivo.cantidad_total ?? 0}
                  onChange={(e) =>
                    setDetalleActivo({
                      ...detalleActivo,
                      cantidad_total: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="Ingrese cantidad"
                />
                {errors.cantidad && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {Array.isArray(errors.cantidad)
                      ? errors.cantidad[0]
                      : errors.cantidad}
                  </p>
                )}
              </div>

              {/* ✅ CAMBIAR: Bodegas del producto original usando resumen_por_bodega */}
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Bodegas del producto original
                </label>
                <Select
                  isMulti
                  // ✅ CAMBIAR: Usar bodegasDisponibles (resumen_por_bodega) con filtro
                  options={bodegasDisponibles
                    .filter((bd) => (bd.stock_total || 0) > 0) // ✅ Solo con stock disponible
                    .map((bd) => ({
                      value: bd.bodega_id,
                      label: `${bd.bodega_nombre} - ${
                        bd.sede_nombre
                      } (${formatNumber(bd.stock_total)} unidades)`,
                      bodega_nombre: bd.bodega_nombre,
                      sede_nombre: bd.sede_nombre,
                      stock: bd.stock_total, // ✅ CAMBIAR: stock_total en lugar de stock
                    }))}
                  components={{
                    Option: BodegaOption,
                  }}
                  onChange={(selected) => {
                    const bodegas = selected.map((sel) => ({
                      bodega_id: sel.value,
                      bodega_nombre: sel.bodega_nombre, // ✅ AGREGAR: nombre de bodega
                      sede_nombre: sel.sede_nombre, // ✅ AGREGAR: nombre de sede
                      cantidad: 0,
                    }));
                    setDetalleActivo({ ...detalleActivo, bodegas });
                  }}
                  // ✅ CAMBIAR: Value usando bodegasDisponibles
                  value={
                    detalleActivo.bodegas
                      ?.map((b) => {
                        const bodegaInfo = bodegasDisponibles.find(
                          (bd) =>
                            bd.bodega_id === b.bodega_id &&
                            (bd.stock_total || 0) > 0
                        );
                        return bodegaInfo
                          ? {
                              value: b.bodega_id,
                              label: `${
                                bodegaInfo.bodega_nombre
                              } -  (${formatNumber(
                                bodegaInfo.stock_total
                              )} unidades)`,
                              bodega_nombre: bodegaInfo.bodega_nombre,
                              sede_nombre: bodegaInfo.sede_nombre,
                              stock: bodegaInfo.stock_total,
                            }
                          : null;
                      })
                      .filter(Boolean) || []
                  }
                  placeholder="🏢 Seleccione una o más bodegas..."
                  className={
                    errors.bodegas ? "border border-red-500 rounded-lg" : ""
                  }
                  styles={customSelectStyles}
                  noOptionsMessage={() => "No hay bodegas con stock disponible"}
                  menuPortalTarget={document.body}
                />

                {/* ✅ AGREGAR: Mensaje si no hay bodegas con stock */}
                {bodegasDisponibles.filter((bd) => (bd.stock_total || 0) > 0)
                  .length === 0 && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-700 text-sm">
                        Este producto no tiene stock disponible en ninguna
                        bodega.
                      </span>
                    </div>
                  </div>
                )}

                {errors.bodegas && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {Array.isArray(errors.bodegas)
                      ? errors.bodegas[0]
                      : errors.bodegas}
                  </p>
                )}

                {/* ✅ CAMBIAR: Cantidades por bodega usando bodegasDisponibles */}
                {detalleActivo.bodegas?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="font-medium text-gray-700">
                      Cantidades por bodega:
                    </h4>
                    {detalleActivo.bodegas.map((b, idx) => {
                      // ✅ CAMBIAR: Buscar en bodegasDisponibles (resumen_por_bodega)
                      const bodegaInfo = bodegasDisponibles.find(
                        (bd) => bd.bodega_id === b.bodega_id
                      );
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <div>
                              <span className="font-medium text-gray-900">
                                {b.bodega_nombre ||
                                  bodegaInfo?.bodega_nombre ||
                                  "Bodega no encontrada"}
                              </span>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {b.sede_nombre ||
                                  bodegaInfo?.sede_nombre ||
                                  "Sin sede"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              Stock:{" "}
                              {formatNumber(bodegaInfo?.stock_total || 0)}
                            </div>
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className={`w-full border rounded-lg px-3 py-2 text-center ${
                                errors[`bodegas.${idx}.cantidad`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              value={b.cantidad || ""}
                              onChange={(e) => {
                                const newBodegas = [...detalleActivo.bodegas];
                                newBodegas[idx].cantidad =
                                  parseFloat(e.target.value) || 0;
                                setDetalleActivo({
                                  ...detalleActivo,
                                  bodegas: newBodegas,
                                });
                              }}
                              placeholder="0.00"
                              max={bodegaInfo?.stock_total || 999999}
                            />
                            {errors[`bodegas.${idx}.cantidad`] && (
                              <span className="text-red-500 text-xs mt-1 block">
                                {Array.isArray(
                                  errors[`bodegas.${idx}.cantidad`]
                                )
                                  ? errors[`bodegas.${idx}.cantidad`][0]
                                  : errors[`bodegas.${idx}.cantidad`]}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ✅ Productos equivalentes MEJORADO */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Productos Equivalentes
                </h4>

                {/*Mostrar sugerencias  */}
                {detalleActivo.producto_sugerencias?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-blue-800 flex items-center gap-1">
                        Productos sugeridos con stock
                      </h5>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {detalleActivo.producto_sugerencias.length}
                      </span>
                    </div>

                    {/* 🔹 Scroll interno con altura limitada */}
                    <ul className="space-y-1 text-sm max-h-40 overflow-y-auto pr-1">
                      {detalleActivo.producto_sugerencias.map((sug, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center bg-white border border-blue-100 p-2 rounded-md hover:bg-blue-50 transition"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {sug.nombre}
                            </p>
                            <p className="text-xs text-gray-500">
                              Stock total:{" "}
                              <span className="font-medium text-green-600">
                                {sug.stock_total ?? 0}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const nuevosEquivalentes = [
                                ...(detalleActivo.producto_equivalentes || []),
                                {
                                  id: sug.id,
                                  razon: "Sugerencia automática",
                                  resumen_por_bodega:
                                    sug.resumen_por_bodega || [],
                                  bodegas: [],
                                  cantidad: 0,
                                },
                              ];
                              setDetalleActivo({
                                ...detalleActivo,
                                producto_equivalentes: nuevosEquivalentes,
                              });
                            }}
                            className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md hover:bg-blue-700 flex-shrink-0"
                          >
                            Agregar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

            <Select
  isMulti
  isLoading={isLoading || isFetching}
  options={products.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
    code: p.code,
    name: p.name,
    description: p.description || "",
  }))}
  components={{ Option: ProductOption }}
  onInputChange={(value) => setSearch(value)}
  
  onChange={async (selectedOptions) => {
    setLoadingStock(true);

    const idsSeleccionados = selectedOptions.map(s => s.value);

    // Aseguramos que todos los productos estén cargados en cache
    await Promise.all(idsSeleccionados.map(id => ensureProductLoaded(id)));

    // Mantener los equivalentes ya existentes
    const existentes =
      detalleActivo.producto_equivalentes?.filter(eq =>
        idsSeleccionados.includes(eq.id)
      ) || [];

    // Nuevos equivalentes seleccionados
    const nuevosIds = idsSeleccionados.filter(
      id => !existentes.some(eq => eq.id === id)
    );

    const nuevos = await Promise.all(
      nuevosIds.map(async (id) => {
        try {
          const res = await productsApi.getStock(id, {
  sede_id: orden?.orden_compra?.sede?.id
});
          const stock = res?.data?.stock;

          return {
            id,
            razon: "",
            cantidad: 0,
            resumen_por_bodega: stock?.resumen_por_bodega || [],
            bodegas: [],
          };
        } catch (e) {
          console.error("Error cargando stock:", e);
          return {
            id,
            razon: "",
            cantidad: 0,
            resumen_por_bodega: [],
            bodegas: [],
          };
        }
      })
    );

    setDetalleActivo({
      ...detalleActivo,
      producto_equivalentes: [...existentes, ...nuevos],
    });

    setLoadingStock(false);
  }}

  value={detalleActivo.producto_equivalentes?.map((eq) => {
    const product = productCache[eq.id];

    return {
      value: eq.id,
      label: product
        ? `${product.code} - ${product.name}`
        : `Producto #${eq.id}`, // fallback elegante
      code: product?.code,
      name: product?.name,
      description: product?.description,
    };
  }) || []}

  placeholder="🔍 Buscar productos equivalentes..."
  noOptionsMessage={() => (isEmpty ? "No se encontraron productos" : "Escribe para buscar")}
  styles={customSelectStyles}
  menuPortalTarget={document.body}
/>


                {/* Lista de equivalentes mejorada */}
                {detalleActivo.producto_equivalentes?.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {loadingStock && (
                      <div className="text-blue-600 text-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Cargando
                        stock disponible...
                      </div>
                    )}

                    {detalleActivo.producto_equivalentes.map((eq, idx) => {
                      const product = productCache[eq.id];
                      return (
                        <div
                          key={eq.id}
                          className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-blue-50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <Box className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {product?.name || `Producto #${eq.id}`}
                                </h5>
                                <p className="text-sm text-gray-500">
                                  {product?.code}
                                </p>
                                {product?.description && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {product.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            {/* ✅ CAMBIAR: Stock total usando resumen_por_bodega */}
                            <div className="text-right">
                              <div
                                className={`text-xl font-bold ${
                                  eq.resumen_por_bodega?.filter(
                                    (bd) => (bd.stock_total || 0) > 0
                                  ).length > 0
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              >
                                {formatNumber(
                                  eq.resumen_por_bodega?.reduce(
                                    (acc, bd) =>
                                      acc + Number(bd.stock_total || 0),
                                    0
                                  ) || 0
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                disponibles
                              </div>

                              {/* ✅ AGREGAR: Indicador si no hay stock */}
                              {eq.resumen_por_bodega?.filter(
                                (bd) => (bd.stock_total || 0) > 0
                              ).length === 0 && (
                                <div className="text-xs text-red-600 mt-1">
                                  Sin stock
                                </div>
                              )}
                            </div>
                          </div>
                          {/* ✅ CAMBIAR: Bodegas del equivalente usando resumen_por_bodega */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bodegas disponibles
                            </label>
                            <Select
                              isMulti
                              // ✅ CAMBIAR: Usar resumen_por_bodega con filtro de stock > 0
                              options={
                                eq.resumen_por_bodega
                                  ?.filter((bd) => (bd.stock_total || 0) > 0) // ✅ Solo con stock disponible
                                  ?.map((bd) => ({
                                    value: bd.bodega_id,
                                    label: `${bd.bodega_nombre} - ${
                                      bd.sede_nombre
                                    } (${formatNumber(
                                      bd.stock_total
                                    )} unidades)`,
                                    bodega_nombre: bd.bodega_nombre,
                                    sede_nombre: bd.sede_nombre,
                                    stock: bd.stock_total,
                                  })) || []
                              }
                              components={{
                                Option: BodegaOption,
                              }}
                              onChange={(selected) => {
                                const bodegas = selected.map((sel) => ({
                                  bodega_id: sel.value,
                                  bodega_nombre: sel.bodega_nombre, // ✅ AGREGAR
                                  sede_nombre: sel.sede_nombre, // ✅ AGREGAR
                                  cantidad: 0,
                                }));
                                const nuevosEq = [
                                  ...detalleActivo.producto_equivalentes,
                                ];
                                nuevosEq[idx].bodegas = bodegas;
                                setDetalleActivo({
                                  ...detalleActivo,
                                  producto_equivalentes: nuevosEq,
                                });
                              }}
                              // ✅ CAMBIAR: Value usando resumen_por_bodega
                              value={
                                eq.bodegas
                                  ?.map((b) => {
                                    const bodega = eq.resumen_por_bodega?.find(
                                      (bd) =>
                                        bd.bodega_id === b.bodega_id &&
                                        (bd.stock_total || 0) > 0
                                    );
                                    return bodega
                                      ? {
                                          value: b.bodega_id,
                                          label: `${bodega.bodega_nombre}  (${formatNumber(
                                            bodega.stock_total
                                          )} Kg)`,
                                          bodega_nombre: bodega.bodega_nombre,
                                          sede_nombre: bodega.sede_nombre,
                                          stock: bodega.stock_total,
                                        }
                                      : null;
                                  })
                                  .filter(Boolean) || []
                              }
                              placeholder=" Seleccione bodegas con stock..."
                              noOptionsMessage={() =>
                                "No hay bodegas con stock disponible"
                              }
                              styles={customSelectStyles}
                              menuPortalTarget={document.body}
                            />

                            {/*  CAMBIAR: Mensaje si no hay stock usando resumen_por_bodega */}
                            {eq.resumen_por_bodega?.filter(
                              (bd) => (bd.stock_total || 0) > 0
                            ).length === 0 && (
                              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                                  <span className="text-yellow-700 text-sm">
                                    Este producto no tiene stock disponible en
                                    ninguna bodega.
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* CAMBIAR: Cantidades por bodega usando resumen_por_bodega */}
                          {eq.bodegas?.length > 0 && (
                            <div className="mb-3 space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Cantidades por bodega
                              </label>
                              {eq.bodegas.map((b, bidx) => {
                                //  CAMBIAR: Buscar en resumen_por_bodega
                                const bodegaInfo = eq.resumen_por_bodega?.find(
                                  (bd) => bd.bodega_id === b.bodega_id
                                );
                                return (
                                  <div
                                    key={bidx}
                                    className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <Building2 className="w-3 h-3 text-gray-500" />
                                      <div>
                                        <span className="text-sm font-medium">
                                          {b.bodega_nombre ||
                                            bodegaInfo?.bodega_nombre ||
                                            "Bodega"}
                                        </span>
                                  
                                        <span className="text-xs text-gray-500 gap-2 flex items-center">
                                          Stock:{" "}
                                          {formatNumber(
                                            bodegaInfo?.stock_total || 0
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="w-20">
                                   <input
  type="number"
  step="0.01"
  min="0"
  className={`w-full border rounded-lg px-2 py-1 text-center text-sm ${
    stockErrors[
      `eq.${idx}.bodega.${bidx}`
    ]
      ? "border-red-500"
      : "border-gray-300"
  }`}
  value={b.cantidad || ""}
  onChange={(e) => {
    const value = parseFloat(e.target.value) || 0;
    const stockDisponible = bodegaInfo?.stock_total || 0;
    const errorKey = `eq.${idx}.bodega.${bidx}`;

    // ❌ STOCK INSUFICIENTE
    if (value > stockDisponible) {
      setStockErrors((prev) => ({
        ...prev,
        [errorKey]: `Stock insuficiente. Disponible ${stockDisponible}`,
      }));
      return; // ⛔ NO actualiza el estado
    }

    // ✅ LIMPIAR ERROR SI YA ES VÁLIDO
    setStockErrors((prev) => {
      const copy = { ...prev };
      delete copy[errorKey];
      return copy;
    });

    // ✅ ACTUALIZAR CANTIDAD
    const nuevosEq = [...detalleActivo.producto_equivalentes];
    nuevosEq[idx].bodegas[bidx].cantidad = value;

    setDetalleActivo({
      ...detalleActivo,
      producto_equivalentes: nuevosEq,
    });
  }}
  placeholder="0.00"
/>
{stockErrors[`eq.${idx}.bodega.${bidx}`] && (
  <p className="text-red-600 text-xs mt-1">
    {stockErrors[`eq.${idx}.bodega.${bidx}`]}
  </p>
)}

                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Razón mejorada */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Razón del cambio
                            </label>
                            <input
                              type="text"
                              className={`w-full border rounded-lg px-3 py-2 ${
                                errors[`producto_equivalentes.${idx}.razon`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              value={eq.razon}
                              onChange={(e) => {
                                const nuevosEq = [
                                  ...detalleActivo.producto_equivalentes,
                                ];
                                nuevosEq[idx].razon = e.target.value;
                                setDetalleActivo({
                                  ...detalleActivo,
                                  producto_equivalentes: nuevosEq,
                                });
                              }}
                              placeholder="💭 Especifique por qué cambió este producto..."
                            />
                            {errors[`producto_equivalentes.${idx}.razon`] && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {Array.isArray(
                                  errors[`producto_equivalentes.${idx}.razon`]
                                )
                                  ? errors[
                                      `producto_equivalentes.${idx}.razon`
                                    ][0]
                                  : errors[
                                      `producto_equivalentes.${idx}.razon`
                                    ]}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
        {/* Footer del modal */}
{/* Footer del modal */}
<div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
  {/* Botón para guardar en estado de alistamiento */}
  <button
    onClick={() => {
      guardarConfiguracionDescuento(detalleActivo.index, detalleActivo);
      handleChangeDetalle(detalleActivo.index, "bodegas", detalleActivo.bodegas);
      handleChangeDetalle(detalleActivo.index, "producto_equivalentes", detalleActivo.producto_equivalentes);
      setModalOpen(false);
      setProductStock(null);
      setErrors({});
    }}
    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 shadow-sm"
  >
    <ClipboardList className="w-4 h-4" />
    Guardar para Alistamiento
  </button>

  {/* Botón Guardar mejorado */}
  <button
    onClick={() => {
      handleChangeDetalle(detalleActivo.index, "bodegas", detalleActivo.bodegas);
      handleChangeDetalle(detalleActivo.index, "producto_equivalentes", detalleActivo.producto_equivalentes);
      setModalOpen(false);
      setProductStock(null);
      setErrors({});
    }}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
  >
    <Save className="w-4 h-4" />
    Guardar
  </button>
</div>
          </div>
        </div>
      )}
    </div>
  );
}




