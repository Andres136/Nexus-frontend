import { useEffect, useState } from "react";
import { Trash2, Search, Plus } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import Select from "react-select";
import RegisterObservacionOcProveedorDetalles from "./RegisterObservacionOcProveedorDetalles";

export default function DetallesOrdenCompraProveedores({
  onChange,
  errores = {},
}) {
 const createDetalle = (itemNumber) => ({
  uid: crypto.randomUUID(),
  item: itemNumber,
  descripcion: "",
  cantidad_solicitada: 0,
  cantidad_entregada: 0,
  code: "",
  producto_id: null,
  campo_seleccionado: "name",
  procesos: [],
});

  const [detalles, setDetalles] = useState([createDetalle(1)]);
  const [search, setSearch] = useState("");
  const [selectorAbierto, setSelectorAbierto] = useState(null);

  const { products, isLoading, isFetching, isEmpty } = useProducts({ search });
  const [productCache, setProductCache] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
const [detalleIndexSel, setDetalleIndexSel] = useState(null);
useEffect(() => {
  if (!products || products.length === 0) return;

  setProductCache(prev => {
    const nuevo = { ...prev };
    products.forEach(p => {
      nuevo[p.id] = p;
    });
    return nuevo;
  });
}, [products]);

  
  // Enviar al padre
  useEffect(() => {
    onChange(detalles);
  }, [detalles, onChange]);

  const handleInputChange = (index, field, value) => {
    const nuevos = [...detalles];
    nuevos[index][field] =
      field === "cantidad_solicitada" ? parseFloat(value) || 0 : value;
    setDetalles(nuevos);
  };

  const handleCampoSeleccionado = (index, campo) => {
    const nuevos = [...detalles];
    const producto = products.find((p) => p.id === nuevos[index].producto_id);
    
    if (producto) {
      nuevos[index].campo_seleccionado = campo;
      nuevos[index].descripcion = campo === "name" ? producto.name : producto.description;
    }
    
    setDetalles(nuevos);
  };

  const agregarItem = () => {
    setDetalles((prev) => [
      ...prev,
      createDetalle(prev.length + 1),
    ]);
  };

  const eliminarItem = (index) => {
    const nuevos = detalles.filter((_, i) => i !== index);
    const conReorden = nuevos.map((d, i) => ({ ...d, item: i + 1 }));
    setDetalles(conReorden);
  };



const agregarProcesoADetalle = (procesoData) => {
  setDetalles(prev =>
    prev.map((detalle, index) => {
      if (index !== detalleIndexSel) return detalle;

      return {
        ...detalle,
        procesos: [
          ...detalle.procesos,
          {
            proceso_bolsas_id: procesoData.proceso_bolsas_id,
            proceso_nombre: procesoData.proceso_nombre,
            proveedor_id: procesoData.proveedor_id,
            proveedor_nombre: procesoData.proveedor_nombre,
            observacion: procesoData.observacion,
            estado: procesoData.estado || "pendiente",
          }
        ]
      };
    })
  );

  setModalOpen(false);
};
const abrirModalProceso = (index) => {
  setDetalleIndexSel(index);
  setModalOpen(true);
};

useEffect(() => {
  console.log(detalles);
}, [detalles]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-xl font-semibold text-gray-900">Detalles de Productos</h3>
        <button
          onClick={agregarItem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Producto
        </button>
      </div>

      {/* Tabla responsive */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Procesos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campo a Usar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detalles.map((detalle, index) => (
                <tr key={detalle.uid} className="hover:bg-gray-50 transition-colors">
                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => eliminarItem(index)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                  {/* Item número */}
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {detalle.item}
                  </td>

                  {/* Selector de producto */}
                  <td className="px-4 py-3">
                    {selectorAbierto === index ? (
                      <div className="relative">
                        <Select
                          autoFocus
                          isLoading={isLoading || isFetching}
                          options={products.map((p) => ({
                            value: p.id,
                            code: p.code,
                            name: p.name,
                            description: p.description || "Sin descripción",
                            label: `${p.code} - ${p.name}`,
                          }))}
                          onInputChange={(value) => setSearch(value)}
                          onChange={(option) => {
                           // console.log(option);
                   if (option) {
  const nuevos = [...detalles];
  nuevos[index].producto_id = option.value;
  nuevos[index].code = option.code;

  const campoActual = nuevos[index].campo_seleccionado;
  nuevos[index].descripcion = campoActual === "name" 
    ? option.name 
    : option.description;

  setDetalles(nuevos);

  // 🔥 Guardar en cache
  setProductCache(prev => ({
    ...prev,
    [option.value]: {
      id: option.value,
      code: option.code,
      name: option.name,
      description: option.description
    }
  }));
}

                            setSelectorAbierto(null);
                          }}
                          onBlur={() => setSelectorAbierto(null)}
                          placeholder="Buscar producto..."
                          noOptionsMessage={() =>
                            isEmpty
                              ? "No se encontraron productos"
                              : "Escribe para buscar"
                          }
                          className="min-w-[280px]"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                          menuPortalTarget={document.body}
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectorAbierto(index)}
                        className="cursor-pointer min-h-[38px] flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                      >
                        {detalle.producto_id ? (
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                             {productCache[detalle.producto_id]?.name || "Producto no encontrado"}

                            </div>
                            <div className="text-sm text-gray-500">
                              {detalle.code}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            <span>Seleccionar producto...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Código */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={detalle.code || ""}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  </td>

                  {/* Descripción */}
                  <td className="px-4 py-3">
                    <textarea
                      value={detalle.descripcion}
                      readOnly
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed resize-none"
                    />
                    {errores?.[index]?.descripcion && (
                      <p className="text-red-500 text-xs mt-1">
                        {errores[index].descripcion[0]}
                      </p>
                    )}
                  </td>
<td className="px-4 py-3">
  <button
    onClick={() => abrirModalProceso(index)}
    className="px-2 py-1 bg-indigo-500 text-white rounded text-xs"
  >
    + Proceso
  </button>

  {/* Mostrar procesos agregados */}
{detalle.procesos?.map((p, i) => (
  <div key={i} className="text-xs bg-gray-100 rounded p-1 mt-1">
    <div>Proceso: {p.proceso_nombre}</div>
    <div>Proveedor: {p.proveedor_nombre}</div>
  </div>
))}
{modalOpen && detalleIndexSel === index && (
  <RegisterObservacionOcProveedorDetalles
 isOpen={true}
  onClose={() => setModalOpen(false)}
    modo="local"
    onSave={agregarProcesoADetalle}
  />
)}
</td>
                  {/* Selector de campo a usar */}
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`campo_${index}`}
                          value="name"
                          checked={detalle.campo_seleccionado === "name"}
                          onChange={() => handleCampoSeleccionado(index, "name")}
                          disabled={!detalle.producto_id}
                          className="mr-2 text-blue-600"
                        />
                        <span className="text-xs text-gray-700">Usar Nombre</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`campo_${index}`}
                          value="description"
                          checked={detalle.campo_seleccionado === "description"}
                          onChange={() => handleCampoSeleccionado(index, "description")}
                          disabled={!detalle.producto_id}
                          className="mr-2 text-blue-600"
                        />
                        <span className="text-xs text-gray-700">Usar Descripción</span>
                      </label>
                    </div>
                  </td>

                  {/* Cantidad */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={detalle.cantidad_solicitada}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "cantidad_solicitada",
                          e.target.value
                        )
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    {errores?.[index]?.cantidad_solicitada && (
                      <p className="text-red-500 text-xs mt-1">
                        {errores[index].cantidad_solicitada[0]}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


        </div>

        {/* Mensaje cuando no hay productos */}
        {detalles.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay productos agregados</p>
              <p className="text-sm">Haz clic en Agregar Producto para comenzar</p>
            </div>
          </div>
        )}
      </div>

      {/* Resumen en mobile */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 lg:hidden">
        <div className="text-center">
          <div className="text-sm text-gray-600">Total de productos</div>
          <div className="text-lg font-semibold text-gray-900">{detalles.length}</div>
        </div>
      </div>
    </div>
  );
}