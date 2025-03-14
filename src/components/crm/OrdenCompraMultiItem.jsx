import { formatCurrency } from "../../helpers";
import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";

// Factor para convertir cm a pulgadas
const FACTOR_PULGADA = 0.393701;

// Genera un ID único para cada fila
function generateUUID() {
  return crypto.randomUUID();
}

// Función para crear una nueva fila con campos iniciales
function createNewItem(itemNumber) {
  return {
    // Clave interna para React; NO se reusa para numerar ítems.
    _uuid: generateUUID(),
    // Este "itemNumber" es el que mostrarás como "Item 1, Item 2, ..."
    itemNumber,
    id: null,
    orden_compra_id: "", // ID de la orden de compra
    largo_cm: 0,
    ancho_cm: 0,
    calibre: 0,
    cantidad: "",
    valor_unitario: 0,
    peso_bolsa: 0,
    numero_bolsas: 0,
    cliente_clb: 0,
    cantidad_requerida_kg: 0,
    descripcion: "",
    valor_total: 0,
    observaciones: `${itemNumber}`,
  };
}

export default function OrdenCompraMultiItem({ onDetallesChange, errores = {} }) {
  console.log("Errores:", errores);
  // Estado para manejar las filas de la tabla
  const [rows, setRows] = useState([createNewItem(1)]);

  // Función para realizar los cálculos en una fila
  const updateRowCalculations = (row) => {
    const largo_cm = parseFloat(row.largo_cm) || 0;
    const ancho_cm = parseFloat(row.ancho_cm) || 0;
    const calibre = parseFloat(row.calibre) || 0;
    const cantidad = parseFloat(row.cantidad) || 0;
    const valor_unitario = parseFloat(row.valor_unitario) || 0;

    let peso_bolsa = 0;
    let numero_bolsas = 0;
    let cantidad_requerida_kg = 0;
    let valor_total = 0;

    if (largo_cm > 0 && ancho_cm > 0 && calibre > 0) {
      const largoIn = Math.round(largo_cm * FACTOR_PULGADA);
      const anchoIn = Math.round(ancho_cm * FACTOR_PULGADA);
      const resultado = Math.round((largoIn * anchoIn * 302) / 10);
      peso_bolsa = Math.ceil((resultado * calibre) / 1000); // Peso en gramos

      if (peso_bolsa > 0) {
        numero_bolsas = Math.max(1, Math.round(1000 / peso_bolsa));
        cantidad_requerida_kg = Math.ceil(cantidad * peso_bolsa) / 1000;
      }
    }

    valor_total = cantidad * valor_unitario * 1.19;

    return { peso_bolsa, numero_bolsas, cantidad_requerida_kg, valor_total };
  };

  // Manejar cambios en los inputs usando _uuid
  const handleInputChange = (_uuid, field, value) => {
    const newRows = rows.map((row) => {
      if (row._uuid === _uuid) {
        const updatedRow = { ...row, [field]: value };
        const calculations = updateRowCalculations(updatedRow);
        return { ...updatedRow, ...calculations };
      }
      return row;
    });

    setRows(newRows);
  };

  // Enviar los detalles al componente principal cada vez que rows cambie
  useEffect(() => {
    if (rows.length > 0) {
      onDetallesChange(rows);
    }
  }, [rows, onDetallesChange]);

  // Escuchar cambios en errores para limpiar el componente (si aplica)
  useEffect(() => {
    if (Object.keys(errores).length === 0) {
      setRows([createNewItem(1)]);
    }
  }, [errores]);

  // Agregar una nueva fila con itemNumber = rows.length + 1
  const addRow = () => {
    const newItemNumber = rows.length + 1;
    setRows([...rows, createNewItem(newItemNumber)]);
  };

  // Eliminar una fila y reenumerar itemNumber y observaciones usando _uuid
  const removeRow = (_uuid) => {
    let newRows = rows.filter((row) => row._uuid !== _uuid);

    // Reenumerar desde 1
    newRows = newRows.map((row, index) => ({
      ...row,
      itemNumber: index + 1,
      observaciones: `${index + 1}`,
    }));

    setRows(newRows);
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white text-xs sm:text-sm">
          <tr>
            {[
              "Acciones",
              "Item",
              "Largo cm",
              "Ancho cm",
              "Calibre",
              "Peso Bolsa",
              "Número de Bolsas",
              "Cliente",
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
                { key: "largo_cm", type: "text" },
                { key: "ancho_cm", type: "text" },
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
                  type="text"
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
