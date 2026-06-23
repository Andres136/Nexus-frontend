import { useState } from "react";
import { useProducts } from "../../../hooks/useProducts";
import Select from "react-select";

import useDetallesOs from "../../../hooks/crm/useDetallesOs";

export default function DetallesOs({
  productosbyId,
  obtenerProductosPorId,
  formData,
  setFormData,
  handleChange,
  detallesEditados,
  error


}) {
  const [search, setSearch] = useState("");
  const { products, isLoading, isFetching, isEmpty } = useProducts({ search });
  const {
  cantidadInput,
  setCantidadInput,
  productoSeleccionado,
  setProductoSeleccionado,
  agregarDetalle,
  eliminarDetalle,
  estaAgregado,
  selectStyles
} = useDetallesOs(formData, setFormData);

  const actualizarCantidadDetalle = (detalleId, value) => {
    handleChange(detalleId, "cantidad", value);
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map(detalle =>
        detalle.orden_compra_detalle_id === detalleId
          ? { ...detalle, cantidad: value }
          : detalle
      )
    }));
  };

  return (
    <div className="space-y-4">
      {/* Título y Buscador */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-gray-800">Detalles de la Orden</h2>
        <div className="flex-1 max-w-md">
       <Select
  placeholder="Buscar producto..."
  styles={selectStyles}
  value={productoSeleccionado}
  options={products.map((product) => ({
    value: product.id,
    label: product.name,
  }))}
  isLoading={isLoading || isFetching}
  isDisabled={isEmpty}
  onInputChange={(value) => setSearch(value)}
  onChange={(selectedOption) => {
    setProductoSeleccionado(selectedOption);

    if (selectedOption) {
      obtenerProductosPorId(selectedOption.value);
    }
  }}
  isClearable
/>
        </div>
      </div>

      {/* Tabla de productos encontrados */}
      {error?.detalles && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.detalles[0]}
        </div>
      )}

      {productosbyId.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b">
            <span className="text-sm font-medium text-gray-700">Productos Disponibles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-600">Orden</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-600">Producto</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Cantidades</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-600">Observaciones</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 w-20">Cant.</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 w-16">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosbyId.map((item) => (
                  <tr 
                    key={item.detalle_id} 
                    className={estaAgregado(item.detalle_id) ? "bg-green-50" : "hover:bg-gray-50"}
                  >
                    <td className="px-2 py-2 text-gray-700 text-xs">
                      #{item.numero_orden}
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-xs font-medium text-gray-800">{item.producto.nombre}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[150px]">
                        {item.producto.descripcion}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px]">
                        <span className="bg-red-100 text-red-700 px-1 py-0.5 rounded font-medium">
                          F:{item.cantidad_faltante}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                          E:{item.cantidad_entregada}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                          S:{item.cantidad_solicitada}
                        </span>
                      </div>
                    </td>
                    {/* Observaciones compactas en el TD */}
                    <td className="px-2 py-2">
                      {item.observaciones?.length > 0 ? (
                        <div className="max-h-16 overflow-y-auto space-y-1">
                          {item.observaciones.map((obs) => (
                            <div key={obs.id} className="bg-yellow-50 border border-yellow-200 rounded px-1.5 py-1 text-[10px]">
                              <span className="font-medium text-yellow-800">{obs.proceso?.nombre || "Sin proceso"}:</span>
                              <span className="text-gray-600 ml-1">{obs.observacion}</span>
                              <span className={`ml-1 px-1 rounded text-[9px] ${
                                obs.estado === 'pendiente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {obs.estado}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Sin obs.</span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="1"
                        max={item.cantidad_faltante}
                        placeholder="0"
                        value={cantidadInput[item.detalle_id] || ""}
                        onChange={(e) =>
                          setCantidadInput(prev => ({
                            ...prev,
                            [item.detalle_id]: e.target.value
                          }))
                        }
                        disabled={estaAgregado(item.detalle_id)}
                        className="w-full border border-gray-300 rounded px-1 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      {estaAgregado(item.detalle_id) ? (
                        <button
                          type="button"
                          onClick={() => eliminarDetalle(item.detalle_id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-[10px] transition-colors"
                        >
                          Quitar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => agregarDetalle(item)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-[10px] transition-colors"
                        >
                          Agregar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla de detalles agregados */}
      {formData.detalles.length > 0 && (
        <div className="border rounded-lg overflow-hidden border-green-300">
          <div className="bg-green-50 px-3 py-2 border-b border-green-300">
            <span className="text-sm font-medium text-green-800">
              Detalles Agregados ({formData.detalles.length})
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-green-800">Orden</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-green-800">Producto</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-green-800">Observaciones</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-green-800">Cantidad</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-green-800 w-20">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-200">
                {formData.detalles.map((detalle, index) => (
                  <tr key={detalle.orden_compra_detalle_id} className="bg-white">
                    <td className="px-3 py-2 text-gray-700 text-xs">
                      #{detalle._info?.numero_orden || detalle.orden_compra_detalle_id}
                    </td>
                    <td className="px-3 py-2 text-xs font-medium text-gray-800">
                      {detalle._info?.producto_nombre || "Producto"}
                      <div className="text-[10px] text-gray-500">
                        {detalle._info?.producto_descripcion || ""}
                      </div>
                    </td>

                <td className="px-3 py-2">
  {detalle._info?.observaciones?.length > 0 ? (
    <div className="max-h-16 overflow-y-auto space-y-1">
      {detalle._info.observaciones.map((obs) => (
        <div 
          key={obs.id} 
          className="bg-yellow-50 border border-yellow-200 rounded px-1.5 py-1 text-[10px]"
        >
          <span className="font-medium text-yellow-800">
            {obs.proceso?.nombre}:
          </span>

          <span className="text-gray-600 ml-1">
            {obs.observacion}
          </span>

          <span
            className={`ml-1 px-1 rounded text-[9px] ${
              obs.estado === "pendiente"
                ? "bg-orange-100 text-orange-600"
                : obs.estado === "en_proceso"
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {obs.estado}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <span className="text-gray-400 text-[10px]">
      Sin obs.
    </span>
  )}
</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={detalle.cantidad ?? ""}
                        onChange={(e) =>
                          actualizarCantidadDetalle(
                            detalle.orden_compra_detalle_id,
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded px-1 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {error?.[`detalles.${index}.cantidad`] && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {error[`detalles.${index}.cantidad`][0]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => eliminarDetalle(detalle.orden_compra_detalle_id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
     
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {productosbyId.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Busque un producto para ver los detalles disponibles
        </div>
      )}
    </div>
  );
}
