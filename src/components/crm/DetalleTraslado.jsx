import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { inventariosApi, productsApi } from "../../services/api";

import { useProducts } from "../../hooks/useProducts";
import Select from "react-select";

export default function DetalleTraslado({
  detalle,
  index,
  sedeOrigenId,
  handleChange,
  handleBodegaChange,
  addBodega,
  errores,
  onRemove,
  canRemove = true,
}) {
  const [ocproveedores, setOcproveedores] = useState([]);
 
  const [search, setSearch] = useState("");
  const { products, isLoading, isFetching, isEmpty } = useProducts({ search });

  const [bodegasDisponibles, setBodegasDisponibles] = useState([]);

const cargarOC = async (value = "") => {
  try {
    const params = value ? { q: value } : {};
    const response = await inventariosApi.ordenesCompraTraslados(params);
    setOcproveedores(response.data);
  } catch (error) {
    console.error("Error al cargar órdenes de compra:", error);
  }
};


const cargarOcIndividual = async (id) => {
  try {
    const response = await inventariosApi.getOcShow(id);
    setOcproveedores([response.data]);
  } catch (error) {
    console.error("Error al cargar orden de compra individual:", error);
  }
};

  useEffect(() => {
    cargarOC();
  }, []);

useEffect(() => {
  if (detalle.orden_compra_id && ocproveedores.length > 0) {
    const existe = ocproveedores.some(
      (oc) => oc.id === detalle.orden_compra_id
    );

    if (!existe) {
      cargarOcIndividual(detalle.orden_compra_id);
    }
  }
}, [detalle.orden_compra_id, ocproveedores]);




const fetchDirectStock = async (productId) => {
  try {
    const params = {};

    if (sedeOrigenId) {
      params.sede_id = sedeOrigenId;
    }

    const res = await productsApi.getStock(productId, params);
    return res?.data?.stock || null;
  } catch (err) {
    console.error("❌ Error obteniendo stock:", err);
    return null;
  }
};



useEffect(() => {
  if (!detalle.product_id) return;

  const load = async () => {
    const stock = await fetchDirectStock(detalle.product_id);

    if (!stock) return;

    const total = stock.stock_total ?? 0;
    const bodegas = stock.resumen_por_bodega ?? [];

    setBodegasDisponibles(bodegas);

    handleChange(
      { target: { name: "stock_total", value: total }},
      index
    );
  };

  load();
}, [detalle.product_id]);






  // ✅ Función para manejar el cambio del select de OC
  const handleOcChange = (selectedOption) => {
    const syntheticEvent = {
      target: {
        name: "orden_compra_id",
        value: selectedOption ? selectedOption.id : "",
      },
    };
    handleChange(syntheticEvent, index);
  };

  // ✅ Función para manejar el cambio de producto CORREGIDA
  const handleProductChange = (selectedOption) => {
    if (selectedOption) {
      // Actualizar product_id
      handleChange(
        {
          target: {
            name: "product_id",
            value: selectedOption.value,
          },
        },
        index
      );

      // ✅ NUEVO: Guardar el code_id (código del producto)
      handleChange(
        {
          target: {
            name: "code_id",
            value: selectedOption.code,
          },
        },
        index
      );

      // ✅ Llenar descripción automáticamente: name si existe, sino description
      const descripcionAuto =
        selectedOption.name || selectedOption.description || "";
      handleChange(
        {
          target: {
            name: "descripcion",
            value: descripcionAuto,
          },
        },
        index
      );
    } else {
      // Limpiar campos si se deselecciona
      handleChange(
        {
          target: {
            name: "product_id",
            value: "",
          },
        },
        index
      );

      // ✅ NUEVO: Limpiar code_id también
      handleChange(
        {
          target: {
            name: "code_id",
            value: "",
          },
        },
        index
      );

      handleChange(
        {
          target: {
            name: "descripcion",
            value: "",
          },
        },
        index
      );
    }
  };

  // ✅ Encontrar la OC seleccionada
  const selectedOc =
    ocproveedores.find((oc) => oc.id == detalle.orden_compra_id) || null;





  return (
    <div key={index} className="border p-3 rounded bg-gray-50 mb-4 shadow-sm">
      <h3 className="font-semibold mb-2 text-gray-700">Detalle {index + 1}</h3>

      <table className="min-w-full table-fixed">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left text-sm font-semibold border">
              Ítem
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold border">
              #OC
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold border">
              Producto
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold border">
              Descripción
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold border">
              Cantidad
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold border">
              Bodegas
            </th>
      <th className="px-3 py-2 text-center text-sm font-semibold border min-w-[60px] w-[60px]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {/* Ítem */}
            <td className="px-3 py-2 border">
              <input
                type="number"
                name="item"
                value={detalle.item || index + 1}
                onChange={(e) => handleChange(e, index)}
                className="w-full border rounded-md p-1 bg-gray-100 text-gray-500 cursor-not-allowed"
                min="1"
              />
            </td>

            {/* Orden de compra */}
            <td className="px-3 py-2 border">
              <Select
                name="orden_compra_id"
                value={selectedOc}
                onChange={handleOcChange}
                options={ocproveedores}
                getOptionLabel={(oc) => oc.numero_orden}
                getOptionValue={(oc) => oc.id}
                placeholder="Seleccione OC..."
                isClearable
                isSearchable
            onInputChange={(inputValue) => {
  if (typeof inputValue === "string" && inputValue.length >= 2) {
    cargarOC(inputValue); // búsqueda dinámica
  } else if (inputValue === "") {
    cargarOC(); // recargar las 50 iniciales
  }
}}

                noOptionsMessage={() => "No hay órdenes disponibles"}
                className="text-sm"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    minHeight: "32px",
                    fontSize: "14px",
                    border: errores?.[`detalles.${index}.orden_compra_id`]
                      ? "1px solid #ef4444"
                      : "1px solid #d1d5db",
                    "&:hover": {
                      borderColor: "#3b82f6",
                    },
                    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                  }),
                  valueContainer: (provided) => ({
                    ...provided,
                    padding: "2px 6px",
                  }),
                  input: (provided) => ({
                    ...provided,
                    margin: "0px",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    overflow: "visible",
                    textOverflow: "clip",
                    whiteSpace: "nowrap",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    minWidth: "200px",
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: "14px",
                  }),
                }}
              />
              {errores?.[`detalles.${index}.orden_compra_id`] && (
                <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                  <span>•</span>
                  <span>{errores[`detalles.${index}.orden_compra_id`]}</span>
                </p>
              )}
            </td>

            {/* Producto */}
            <td className="px-3 py-2 border">
                              <Select
  isLoading={isLoading || isFetching}
  options={products.map((p) => ({
    value: p.id,
    label: `${p.code || p.code_id || "Sin código"} - ${p.name || "Sin nombre"}`,
    code: p.code,
    name: p.name,
  }))}
  value={
    detalle.product_id && products.length > 0
      ? (() => {
          const product = products.find((p) => p.id === detalle.product_id);
          if (product) {
            return {
              value: product.id,
              label: `${product.code || product.code_id || "Sin código"} - ${product.name || "Sin nombre"}`,
            };
          } 
        })()
      : null
  }
  onChange={handleProductChange}
  onInputChange={(inputValue) => setSearch(inputValue)}
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
        
              {errores?.[`detalles.${index}.product_id`] && (
                <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                  <span>•</span>
                  <span>{errores[`detalles.${index}.product_id`]}</span>
                </p>
              )}
            </td>

            {/* Descripción - ahora automática pero editable */}
            <td className="px-3 py-2 border">
              <input
                type="text"
                name="descripcion"
                value={detalle.descripcion || ""}
                onChange={(e) => handleChange(e, index)}
                placeholder="Descripción del producto"
                className={`w-full border rounded-md p-1 ${
                  errores?.[`detalles.${index}.descripcion`]
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errores?.[`detalles.${index}.descripcion`] && (
                <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                  <span>•</span>
                  <span>{errores[`detalles.${index}.descripcion`]}</span>
                </p>
              )}
            </td>

            {/* Cantidad total */}
            <td className="px-3 py-2 border">
              <input
                type="number"
                name="cantidad"
                value={detalle.cantidad || ""}
                onChange={(e) => handleChange(e, index)}
                className={`w-full border rounded-md p-1 text-right ${
                  errores?.[`detalles.${index}.cantidad`]
                    ? "border-red-500"
                    : ""
                }`}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              {errores?.[`detalles.${index}.cantidad`] && (
                <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                  <span>•</span>
                  <span>{errores[`detalles.${index}.cantidad`]}</span>
                </p>
              )}
            </td>

            {/* Bodegas */}
            <td className="px-3 py-2 border align-top">
              {detalle.stock_total !== undefined && (
                <div className="text-xs text-gray-600 mb-1">
                  Stock disponible: <strong>{detalle.stock_total}</strong>{" "}
                  unidades
                </div>
              )}

              <Select
                isMulti
                placeholder="Seleccionar bodegas..."
                options={bodegasDisponibles.map((b) => ({
                  value: b.bodega_id,
                  label: `${b.bodega_nombre} - ${b.stock_total} unidades disponibles`,
                  stock: b.stock_total,
                  nombre: b.bodega_nombre,
                }))}
                onChange={(selected) => {
                  //  console.log("👉 BODEGA seleccionada:", selected);

                  const bodegas = selected
                    ? selected.map((sel) => ({
                        bodega_id: sel.value,
                        bodega_nombre: sel.nombre,
                        stock: sel.stock, // ✅ ESTE es el bueno
                        cantidad: 0,
                      }))
                    : [];

                  // console.log("✅ bodegas guardadas:", bodegas);

                  handleChange(
                    { target: { name: "bodegas", value: bodegas } },
                    index
                  );
                }}
                // ✅ CORRECCIÓN: Filtrar bodegas vacías o sin bodega_id
                value={
                  (detalle.bodegas || [])
                    .filter((b) => b.bodega_id) // Solo bodegas con ID válido
                    .map((b) => {
                      const bd = bodegasDisponibles.find(
                        (x) => x.bodega_id === b.bodega_id
                      );
                      return bd
                        ? {
                            value: b.bodega_id,
                            label: `${bd.bodega_nombre} - ${bd.stock_total} unidades disponibles`,
                            stock: bd.stock_total,
                            nombre: bd.bodega_nombre,
                          }
                        : null;
                    })
                    .filter(Boolean) // Eliminar valores null
                }
                className="text-xs"
                isClearable={true} // ✅ Permitir limpiar selección
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: "28px",
                    fontSize: "12px",
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    fontSize: "11px",
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: "12px",
                  }),
                }}
              />

              {/* ✅ Mostrar cantidades solo si hay bodegas seleccionadas */}
              {(detalle.bodegas || [])
                .filter((b) => b.bodega_id) // Solo mostrar bodegas válidas
                .map((b, i) => {
                  const bodegaInfo = bodegasDisponibles.find(
                    (x) => x.bodega_id === b.bodega_id
                  );
                  const nombreBodega =
                    bodegaInfo?.bodega_nombre ||
                    b.bodega_nombre ||
                    `Bodega ${b.bodega_id}`;

                  return (
                    <div
                      key={`${b.bodega_id}-${i}`}
                      className="flex items-center mt-2 gap-2 text-xs bg-white rounded border p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium text-gray-700 truncate"
                          title={nombreBodega}
                        >
                          {nombreBodega}
                        </div>
                        <div className="text-gray-500 text-xs">
                          Stock: {bodegaInfo?.stock_total || 0} unidades
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <input
                          type="number"
                          className={`border rounded p-1 w-20 text-right ${
                            errores?.[`detalles.${index}.bodegas.${i}.cantidad`]
                              ? "border-red-500"
                              : ""
                          }`}
                          value={b.cantidad || ""}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          max={bodegaInfo?.stock_total || 0}
                          onChange={(e) => {
                            const nueva = [...(detalle.bodegas || [])];
                            const realIndex = nueva.findIndex(
                              (x) => x.bodega_id === b.bodega_id
                            );

                            if (realIndex !== -1) {
                              nueva[realIndex].cantidad =
                                parseFloat(e.target.value) || 0;

                              // Actualizar cantidad total automáticamente
                              const total = nueva.reduce(
                                (sum, x) => sum + (parseFloat(x.cantidad) || 0),
                                0
                              );

                              handleChange(
                                { target: { name: "bodegas", value: nueva } },
                                index
                              );
                              handleChange(
                                { target: { name: "cantidad", value: total } },
                                index
                              );
                            }
                          }}
                        />
                        {errores?.[
                          `detalles.${index}.bodegas.${i}.cantidad`
                        ] && (
                          <p className="text-red-500 text-xs mt-1">
                            {
                              errores[
                                `detalles.${index}.bodegas.${i}.cantidad`
                              ][0]
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </td>

            {/* Acciones */}
       <td className="px-3 py-2 border text-center min-w-[60px] w-[60px]">
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700"
                title="Eliminar detalle"
            >
                  <Trash2 className="w-5 h-5 mx-auto" />
                </button>
      
            </td>
          </tr>
        </tbody>
      </table>

      {/* ✅ Debug info ACTUALIZADO 
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>Debug:</strong> Product ID: {detalle.product_id} | 
          Code ID: {detalle.code_id} | 
          Descripción: {detalle.descripcion} | 
          Código: {selectedProduct?.code || 'N/A'}
        </div>
      )}*/}
    </div>
  );
}
