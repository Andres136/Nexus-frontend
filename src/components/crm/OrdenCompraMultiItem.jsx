import { formatCurrency } from "../../helpers";

import { Trash2, Plus } from "lucide-react";
import useOrdenCompraItems from "../../hooks/useOrdenCompraItems";






export default function OrdenCompraMultiItem({ onDetallesChange, errores = {}, value = [] }) {
  const { rows, handleInputChange, addRow, removeRow } = useOrdenCompraItems({
    errores,
    onChange: onDetallesChange,
    initialItems: value,
  });
 

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white text-xs sm:text-sm">
          <tr>
            {[
              "Acciones",
              "Item", 
                 "Ancho cm",
              "Largo cm",
          
              "Calibre",
              "Peso Bolsa",
              "Número de Bolsas",
              "Cliente Clb",
              "Cantidad Requerida (Kg)",
              "Descripcion",
              "Cantidad",
              "Valor Unitario",
              "Valor Total",
            ].map((header) => (
              <th key={header} className="px-2 sm:px-4 py-2 text-left whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-xs sm:text-sm">
          {rows.map((row) => (
            // Usamos _uuid como key, ya que row.id es null
            <tr key={row._uuid} className="border-t border-gray-300">
              {/* Columna de acciones */}
              <td className="px-2 sm:px-4 py-2 flex gap-1 sm:gap-2">
                <button
                  className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => removeRow(row._uuid)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
              {/* Columna de Item */}
              <td className="px-2 sm:px-4 py-2 text-center">{row.observaciones}</td>
              {/* Columnas de inputs para: largo_cm, ancho_cm, calibre */}
              {[
              
                { key: "ancho_cm", type: "text" }, 
                 { key: "largo_cm", type: "text" },
                { key: "calibre", type: "text" },
              ].map(({ key, type }) => (
                <td key={key} className="px-2 sm:px-4 py-2">
                  <input
                    type={type}
                    className="w-full border border-gray-300 px-1 sm:px-2 py-1 rounded text-center text-xs sm:text-sm"
                    value={row[key]}
                    onChange={(e) =>
                      handleInputChange(row._uuid, key, e.target.value)
                    }
                  />
                  {errores[rows.indexOf(row)]?.[key] && (
                    <span className="text-xs text-red-500">
                      {errores[rows.indexOf(row)][key]}
                    </span>
                  )}
                </td>
              ))}
              {/* Columna de Peso Bolsa */}
              <td className="px-2 sm:px-4 py-2 text-center">
                {row.peso_bolsa.toFixed(2)}
              </td>
              {/* Columna de Número de Bolsas */}
              <td className="px-2 sm:px-4 py-2 text-center">
                {row.numero_bolsas.toFixed(0)}
              </td>
              {/* Columna de Cliente */}
              <td className="px-2 sm:px-4 py-2">
                <input
                  type="text"
                  className="w-full border border-gray-300 px-1 sm:px-2 py-1 rounded text-center text-xs sm:text-sm"
                  value={row.cliente_clb}
                  onChange={(e) =>
                    handleInputChange(row._uuid, "cliente_clb", e.target.value)
                  }
                />
                {errores[rows.indexOf(row)]?.cliente_clb && (
                  <span className="text-xs text-red-500">
                    {errores[rows.indexOf(row)].cliente_clb}
                  </span>
                )}
              </td>
              {/* Columna de Cantidad Requerida (Kg) */}
              <td className="px-2 sm:px-4 py-2 text-center">
                {row.cantidad_requerida_kg.toFixed(2)}
              </td>
              {/* Columna de Descripción */}
              <td className="px-2 sm:px-4 py-2">
                <input
                  type="text"
                  className="w-full border border-gray-300 px-1 sm:px-2 py-1 rounded text-center text-xs sm:text-sm"
                  value={row.descripcion}
                  onChange={(e) =>
                    handleInputChange(row._uuid, "descripcion", e.target.value)
                  }
                />
                {errores[rows.indexOf(row)]?.descripcion && (
                  <span className="text-xs text-red-500">
                    {errores[rows.indexOf(row)].descripcion}
                  </span>
                )}
              </td>
              {/* Columna de Cantidad */}
              <td className="px-2 sm:px-4 py-2">
                <input
                  type="text"
                  className="w-full border border-gray-300 px-1 sm:px-2 py-1 rounded text-center text-xs sm:text-sm"
                  value={row.cantidad}
                  onChange={(e) =>
                    handleInputChange(row._uuid, "cantidad", e.target.value)
                  }
                />
                {errores[rows.indexOf(row)]?.cantidad && (
                  <span className="text-xs text-red-500">
                    {errores[rows.indexOf(row)].cantidad}
                  </span>
                )}
              </td>
              {/* Columna de Valor Unitario */}
              <td className="px-2 sm:px-4 py-2">
                <input
                  type="number"
                  className="w-full border border-gray-300 px-1 sm:px-2 py-1 rounded text-center text-xs sm:text-sm"
                  value={row.valor_unitario}
                  onChange={(e) =>
                    handleInputChange(row._uuid, "valor_unitario", e.target.value)
                  }
                />
                {errores[rows.indexOf(row)]?.valor_unitario && (
                  <span className="text-xs text-red-500">
                    {errores[rows.indexOf(row)].valor_unitario}
                  </span>
                )}
              </td>
              {/* Columna de Valor Total */}
              <td className="px-2 sm:px-4 py-2 text-center">
                {formatCurrency(row.valor_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-4">
        <button
          onClick={addRow}
          className="bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-green-700 text-xs sm:text-sm"
        >
          <Plus size={16} /> Agregar Ítem
        </button>
      </div>
    </div>
  );
}
