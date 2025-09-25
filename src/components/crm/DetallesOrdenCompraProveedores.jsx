import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import Select from "react-select";
import { Search } from "lucide-react";

export default function DetallesOrdenCompraProveedores({
  onChange,
  errores = {},
  
}) {
  const [detalles, setDetalles] = useState([
    {
      item: 1,
      descripcion: "",
      cantidad_solicitada: 0,
      cantidad_entregada: 0,
      code: "",
      producto_id: null,
      
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectorAbierto, setSelectorAbierto] = useState(null);

  const { products, isLoading, isFetching, isEmpty } = useProducts({ search });


  // Enviar al padre
  useEffect(() => {
    onChange(detalles);
  }, [detalles, onChange]);

  const handleInputChange = (index, field, value) => {
    const nuevos = [...detalles];
    nuevos[index][field] =
      field === "cantidad_solicitada" ? parseFloat(value) : value;
    setDetalles(nuevos);
  };

  const agregarItem = () => {
    setDetalles((prev) => [
      ...prev,
      {
        item: prev.length + 1,
        descripcion: "",
        cantidad_solicitada: 0,
        cantidad_entregada: 0,
        code: "",
        producto_id: null,
      },
    ]);
  };

  const eliminarItem = (index) => {
    const nuevos = detalles.filter((_, i) => i !== index);
    // Recalcular los ítems
    const conReorden = nuevos.map((d, i) => ({ ...d, item: i + 1 }));
    setDetalles(conReorden);
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Detalles de Productos</h3>

      <table className="min-w-full text-sm border border-gray-300 bg-white rounded shadow overflow-x-auto">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Acciones</th>
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Buscar</th>
            <th className="p-2 border">Código</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">Cantidad Solicitada</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {/* Acciones */}
              <td className="p-2 border text-center">
                <button
                  onClick={() => eliminarItem(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </td>

              {/* Item */}
              <td className="p-2 border text-center">{detalle.item}</td>

              {/* Selector de producto */}
              <td className="p-2 border">
                {selectorAbierto === index ? (
                  <div className="flex items-center gap-2">
                    <Search size={18} className="text-blue-500" />
                    <Select
                      autoFocus
                      isLoading={isLoading || isFetching}
                      options={products.map((p) => ({
                        value: p.id,
                        code: p.code,
                        description:
                          p.description || p.name || "Sin descripción",
                        label: `${p.code} - ${
                          p.description || p.name || "Sin descripción"
                        }`,
                      }))}
                      onInputChange={(value) => setSearch(value)}
                      onChange={(option) => {
                        const nuevos = [...detalles];
                        nuevos[index].producto_id = option.value;
                        nuevos[index].code = option.code;
                        nuevos[index].descripcion = option.description; // Ya viene con fallback
                        setDetalles(nuevos);
                        setSelectorAbierto(null);
                      }}
                      placeholder="Buscar producto..."
                      noOptionsMessage={() =>
                        isEmpty
                          ? "No se encontraron productos"
                          : "Escribe para buscar"
                      }
                      className="w-64 text-left"
                      styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 👈 esto hace que se pinte encima
  }}
  menuPortalTarget={document.body} // 👈 renderiza el menú fuera del contenedor
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectorAbierto(
                        selectorAbierto === index ? null : index
                      )
                    }
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    title="Seleccionar producto"
                  >
                    <Search size={18} />
                    <span className="text-sm">Buscar</span>
                  </button>
                )}
              </td>

              {/* Código */}
              <td className="p-2 border">
                <input
                  type="text"
                  value={detalle.code || ""}
                  readOnly
                  className="w-full border rounded p-1 bg-gray-100 cursor-not-allowed"
                />
              </td>

              {/* Descripción */}
              <td className="p-2 border">
                <input
                  type="text"
                  value={detalle.descripcion}
                  readOnly
                  className="w-full border rounded p-1 bg-gray-100 cursor-not-allowed"
                />
                {errores?.[index]?.descripcion && (
                  <p className="text-red-500 text-xs">
                    {errores[index].descripcion[0]}
                  </p>
                )}
              </td>

              {/* Cantidad */}
              <td className="p-2 border">
                <input
                  type="number"
                  value={detalle.cantidad_solicitada}
                  onChange={(e) =>
                    handleInputChange(
                      index,
                      "cantidad_solicitada",
                      e.target.value
                    )
                  }
                  className="w-full border rounded p-1"
                />
                {errores?.[index]?.cantidad_solicitada && (
                  <p className="text-red-500 text-xs">
                    {errores[index].cantidad_solicitada[0]}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={agregarItem}
          className="bg-gray-700 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + Agregar Ítem
        </button>
      </div>
    </div>
  );
}
