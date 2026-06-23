import { Trash2,} from "lucide-react";
import { useEffect, useState } from "react";
import { inventariosApi,  } from "../../services/api";
import { useProducts } from "../../hooks/useProducts";
import Select from "react-select";
import { useStock } from "../../hooks/crm/useStock";

export default function DetalleTraslado({
  detalle,
  index,
  sedeOrigenId,
  handleChange,
  handleBodegaChange,
  addBodega,
  errores,
  onRemove,
  empresaId,
  canRemove = true,
  sedeDestinoId
}) {
  const [search, setSearch] = useState("");
  const { products, isLoading, isFetching, isEmpty } = useProducts({ search });
  const [bodegasDisponibles, setBodegasDisponibles] = useState([]);
  const [ocCargadas, setOcCargadas] = useState([]);
  const [ocLoading, setOcLoading] = useState(false);
const {
  data: stockData,
  isLoading: stockLoading,
  error: stockError,
} = useStock(detalle.product_id, sedeOrigenId);
  // ========= TODA LA LÓGICA ORIGINAL SIN CAMBIOS =========
useEffect(() => {
  let isCurrentRequest = true;

  const cargarOcPendientes = async () => {
    if (!detalle.product_id || !sedeDestinoId) {
      setOcCargadas([]);
      setOcLoading(false);
      return;
    }

    setOcLoading(true);

    try {
      const response = await inventariosApi.OCpendientes({
        producto_id: detalle.product_id,
        sede_id: sedeDestinoId,
      });

      if (isCurrentRequest) {
        setOcCargadas(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      if (isCurrentRequest) {
        setOcCargadas([]);
        console.error("Error al cargar órdenes de compra pendientes:", error);
      }
    } finally {
      if (isCurrentRequest) {
        setOcLoading(false);
      }
    }
  };

  cargarOcPendientes();

  return () => {
    isCurrentRequest = false;
  };
}, [detalle.product_id, sedeDestinoId]);

useEffect(() => {
  if (!stockData) return;

  const total = stockData.stock_total ?? 0;
  const bodegas = stockData.resumen_por_bodega ?? [];

  setBodegasDisponibles(bodegas);

  handleChange(
    {
      target: {
        name: "stock_total",
        value: total,
      },
    },
    index
  );
}, [stockData]);

  const handleOcChange = (selectedOption) => {
    const syntheticEvent = {
      target: {
        name: "orden_compra_id",
        value: selectedOption ? selectedOption.id : "",
      },
    };
    handleChange(syntheticEvent, index);
  };

  const handleProductChange = (selectedOption) => {
    if (selectedOption) {
      handleChange({ target: { name: "product_id", value: selectedOption.value }}, index);
      handleChange({ target: { name: "code_id", value: selectedOption.code }}, index);
      const descripcionAuto = selectedOption.name || selectedOption.description || "";
      handleChange({ target: { name: "descripcion", value: descripcionAuto }}, index);
    } else {
      handleChange({ target: { name: "product_id", value: "" }}, index);
      handleChange({ target: { name: "code_id", value: "" }}, index);
      handleChange({ target: { name: "descripcion", value: "" }}, index);
    }
  };

const selectedOc =
  Array.isArray(ocCargadas)
    ? ocCargadas.find(
        (oc) => String(oc.id) === String(detalle.orden_compra_id)
      ) || null
    : null;

  // ========= FIN DE LA LÓGICA ORIGINAL =========

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      
      {/* Ítem */}
      <td className="px-2 py-2 text-center">
        <div className="w-12 mx-auto">
          <input
            type="number"
            name="item"
            value={detalle.item || index + 1}
            onChange={(e) => handleChange(e, index)}
            className="w-full text-center text-sm bg-gray-50 border-0 rounded focus:ring-1 focus:ring-indigo-500"
            min="1"
            readOnly
          />
        </div>
      </td>

      {/* Orden de Compra */}
      <td className="px-2 py-2">
        <div className="min-w-[120px]">
        <Select
  name="orden_compra_id"
  value={selectedOc}
  onChange={handleOcChange}
  options={ocCargadas}
  getOptionLabel={(oc) => oc.numero_orden}
  getOptionValue={(oc) => oc.id}
  placeholder="OC..."
  isClearable
  isSearchable
  isLoading={ocLoading}

  menuPortalTarget={document.body}   // 🔑 CLAVE
  menuPosition="fixed"               // 🔑 CLAVE

  noOptionsMessage={() =>
    !detalle.product_id || !sedeDestinoId
      ? "Selecciona producto y sede destino"
      : "Sin órdenes pendientes"
  }

  styles={{
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,                   // 🔑 SIEMPRE ARRIBA
    }),

    control: (provided) => ({
      ...provided,
      minHeight: "32px",
      fontSize: "13px",
      border: errores?.[`detalles.${index}.orden_compra_id`]
        ? "1px solid #ef4444"
        : "1px solid #e5e7eb",
      boxShadow: "none",
      "&:hover": { borderColor: "#6366f1" },
    }),

    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px",
    }),

    singleValue: (provided) => ({
      ...provided,
      fontSize: "13px",
    }),

    menu: (provided) => ({
      ...provided,
      fontSize: "13px",
    }),
  }}
/>

          {errores?.[`detalles.${index}.orden_compra_id`] && (
            <p className="text-red-500 text-xs mt-1">{errores[`detalles.${index}.orden_compra_id`]}</p>
          )}
        </div>
      </td>

      {/* Producto */}
      <td className="px-2 py-2">
        <div className="min-w-[200px]">
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
            placeholder="Buscar producto..."
            noOptionsMessage={() =>
              isLoading ? "Cargando..." : isEmpty ? "Sin productos" : "Escribe para buscar"
            }
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (provided) => ({
                ...provided,
                minHeight: "32px",
                fontSize: "13px",
                border: errores?.[`detalles.${index}.product_id`] 
                  ? "1px solid #ef4444" 
                  : "1px solid #e5e7eb",
                boxShadow: "none",
                "&:hover": { borderColor: "#6366f1" },
              }),
              valueContainer: (provided) => ({
                ...provided,
                padding: "0 6px",
              }),
              singleValue: (provided) => ({
                ...provided,
                fontSize: "13px",
              }),
            }}
          />
          {errores?.[`detalles.${index}.product_id`] && (
            <p className="text-red-500 text-xs mt-1">{errores[`detalles.${index}.product_id`]}</p>
          )}
        </div>
      </td>

      {/* Descripción */}
      <td className="px-2 py-2">
        <div className="min-w-[150px]">
          <input
            type="text"
            name="descripcion"
            value={detalle.descripcion || ""}
            onChange={(e) => handleChange(e, index)}
            placeholder="Descripción..."
            className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${
              errores?.[`detalles.${index}.descripcion`] ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errores?.[`detalles.${index}.descripcion`] && (
            <p className="text-red-500 text-xs mt-1">{errores[`detalles.${index}.descripcion`]}</p>
          )}
        </div>
      </td>

      {/* Cantidad */}
      <td className="px-2 py-2">
        <div className="w-20 mx-auto">
          <input
            type="number"
            name="cantidad"
            value={detalle.cantidad || ""}
            onChange={(e) => handleChange(e, index)}
            className={`w-full px-2 py-1 text-sm text-right border rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${
              errores?.[`detalles.${index}.cantidad`] ? "border-red-500" : "border-gray-300"
            }`}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          {errores?.[`detalles.${index}.cantidad`] && (
            <p className="text-red-500 text-xs mt-1">{errores[`detalles.${index}.cantidad`]}</p>
          )}
        </div>
      </td>

      {/* Bodegas */}
      <td className="px-2 py-2">
        <div className="min-w-[200px]">
          {detalle.stock_total !== undefined && (
            <div className="text-xs text-green-600 font-medium mb-1">
              Stock: {detalle.stock_total} unidades
            </div>
          )}

          <Select
            isMulti
            placeholder="Seleccionar bodegas..."
            options={bodegasDisponibles.map((b) => ({
              value: b.bodega_id,
              label: `${b.bodega_nombre} (${b.stock_total})`,
              stock: b.stock_total,
              nombre: b.bodega_nombre,
            }))}
            onChange={(selected) => {
              const bodegas = selected
                ? selected.map((sel) => ({
                    bodega_id: sel.value,
                    bodega_nombre: sel.nombre,
                    stock: sel.stock, 
                    cantidad: 0,
                  }))
                : [];
              handleChange({ target: { name: "bodegas", value: bodegas } }, index);
            }}
            value={
              (detalle.bodegas || [])
                .filter((b) => b.bodega_id)
                .map((b) => {
                  const bd = bodegasDisponibles.find((x) => x.bodega_id === b.bodega_id);
                  return bd ? {
                    value: b.bodega_id,
                    label: `${bd.bodega_nombre} (${bd.stock_total})`,
                    stock: bd.stock_total,
                    nombre: bd.bodega_nombre,
                  } : null;
                })
                .filter(Boolean)
            }
            isClearable={true}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={
              {
                control: (provided) => ({
                  ...provided,
                  minHeight: "32px",
                  fontSize: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "none",
                }),
                multiValue: (provided) => ({
                  ...provided,
                  fontSize: "11px",
                  backgroundColor: "#f3f4f6",
                }),
                valueContainer: (provided) => ({
                  ...provided,
                  padding: "0 6px",
                }),
              }
            }
          />

          {/* Cantidades por bodega */}
          {(detalle.bodegas || [])
            .filter((b) => b.bodega_id)
            .map((b, i) => {
              const bodegaInfo = bodegasDisponibles.find((x) => x.bodega_id === b.bodega_id);
              const nombreBodega = bodegaInfo?.bodega_nombre || b.bodega_nombre || `Bodega ${b.bodega_id}`;

              return (
                <div key={`${b.bodega_id}-${i}`} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 mt-1">
                  <span className="text-xs text-gray-700 truncate flex-1" title={nombreBodega}>
                    {nombreBodega}
                  </span>
                  <input
                    type="number"
                    className={`w-16 px-1 py-0.5 text-xs text-right border rounded ml-2 ${
                      errores?.[`detalles.${index}.bodegas.${i}.cantidad`] ? "border-red-500" : "border-gray-300"
                    }`}
                    value={b.cantidad || ""}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    max={bodegaInfo?.stock_total || 0}
                    onChange={(e) => {
                      const nueva = [...(detalle.bodegas || [])];
                      const realIndex = nueva.findIndex((x) => x.bodega_id === b.bodega_id);
                      if (realIndex !== -1) {
                        nueva[realIndex].cantidad = parseFloat(e.target.value) || 0;
                        const total = nueva.reduce((sum, x) => sum + (parseFloat(x.cantidad) || 0), 0);
                        handleChange({ target: { name: "bodegas", value: nueva } }, index);
                        handleChange({ target: { name: "cantidad", value: total } }, index);
                      }
                    }}
                  />
                </div>
              );
            })}
        </div>
      </td>

      {/* Acciones */}
      <td className="px-2 py-2 text-center">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          title="Eliminar detalle"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
