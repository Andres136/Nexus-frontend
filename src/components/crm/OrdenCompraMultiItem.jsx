import { formatCurrency } from "../../helpers";
import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";

// Factor para convertir cm a pulgadas
const FACTOR_PULGADA = 0.393701;

// Función para crear una nueva fila con campos iniciales
function createNewItem(id = null) {
  return {
    id,
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
  };
}

export default function OrdenCompraMultiItem({
  onDetallesChange,
  errores = {},
}) {
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

  // Función para manejar cambios en los inputs
  const handleInputChange = (id, field, value) => {
    const newRows = rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        const calculations = updateRowCalculations(updatedRow);
        return { ...updatedRow, ...calculations };
      }
      return row;
    });

    setRows(newRows);
  };

  // Efecto para enviar los detalles al componente principal cada vez que `rows` cambie
  useEffect(() => {
    if (rows.length > 0) {
      onDetallesChange(rows);
    }
  }, [rows]);

  // ✅ Escuchar cambios en `detalles` para limpiar el componente
  useEffect(() => {
    if (Object.keys(errores).length === 0) {
      setRows([createNewItem(1)]);
    }
  }, [errores]);

  // Agregar una nueva fila
  const addRow = () => {
    const newId = rows.length + 1;
    setRows([...rows, createNewItem(newId)]);
  };

  // Eliminar una fila
  const removeRow = (id) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);
  };

  return (
    <div className="p-6 bg-white rounded-xl">
      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white text-sm">
          <tr>
            {[
              "Acciones",
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
              <th key={header} className="px-4 py-3 text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-gray-300">
              <td className="px-4 py-3 flex gap-2">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
              {[
                { key: "largo_cm", type: "text" },
                { key: "ancho_cm", type: "text" },
                { key: "calibre", type: "text" },
                
              ].map(({ key, type }) => (
                <td key={key} className="px-4 py-3">
                  <input
                    type={type}
                    className="w-full border border-gray-300 px-2 py-1 rounded text-center"
                    value={row[key]}
                    onChange={(e) =>
                      handleInputChange(row.id, key, e.target.value)
                    }
                  />
                  {errores[rows.indexOf(row)]?.[key] && (
                    <span className="text-sm text-red-500">
                      {errores[rows.indexOf(row)][key]}
                    </span>
                  )}
                </td>
              ))}
              <td className="px-4 py-3 text-center">
                {row.peso_bolsa.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center">
                {row.numero_bolsas.toFixed(0)}
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  className="w-full border border-gray-300 px-2 py-1 rounded text-center"
                  value={row.cliente_clb}
                  onChange={(e) =>
                    handleInputChange(row.id, "cliente_clb", e.target.value)
                  }
                />
                {errores[rows.indexOf(row)]?.cliente_clb && (
                  <span className="text-sm text-red-500">
                    {errores[rows.indexOf(row)].cliente_clb}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {row.cantidad_requerida_kg.toFixed(2)}
              </td>
   
             
              <td className="px-4 py-3">
                <input
                  type="text"
                  className="w-full border border-gray-300 px-2 py-1 rounded text-center"
                  value={row.descripcion}
                  onChange={(e) =>
                    handleInputChange(row.id, "descripcion", e.target.value)
                  }
                />
                {errores[rows.indexOf(row)]?.descripcion && (
                  <span className="text-sm text-red-500">
                    {errores[rows.indexOf(row)].descripcion}
                  </span>
                )}
              </td>
     <td className="px-4 py-3">
                <input
                  type="text"
                  className="w-full border border-gray-300 px-2 py-1 rounded text-center"
                  value={row.cantidad}
                  onChange={(e) =>
                    handleInputChange(row.id, "cantidad", e.target.value)
                  }
                />
                {errores[rows.indexOf(row)]?.cantidad && (
                  <span className="text-sm text-red-500">
                    {errores[rows.indexOf(row)].cantidad}
                  </span>
                )}
              </td>


               <td className="px-4 py-3">
                <input
                  type="text"
                  className="w-full border border-gray-300 px-2 py-1 rounded text-center"
                  value={row.valor_unitario}
                  onChange={(e) =>
                    handleInputChange(row.id, "valor_unitario", e.target.value)
                  }
                />
                {errores[rows.indexOf(row)]?.valor_unitario && (
                  <span className="text-sm text-red-500">
                    {errores[rows.indexOf(row)].valor_unitario}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {formatCurrency(row.valor_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-4">
        <button
          onClick={addRow}
          className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
        >
          <Plus size={16} /> Agregar Ítem
        </button>
      </div>
    </div>
  );
}
