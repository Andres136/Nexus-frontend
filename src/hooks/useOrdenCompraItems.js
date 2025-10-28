import { useState, useEffect } from "react";
import { calcularCamposBolsa } from "../helpers/utils/calculoBolsa";

const FACTOR_PULGADA = 0.393701;
const FACTOR_CONSTANTE = 302;

function generateUUID() {
  return crypto.randomUUID();
}

function createNewItem(n) {
  return {
    _uuid: generateUUID(),
    itemNumber: n,
    product_id: null,
    largo_cm: null ,
    ancho_cm: null,
    calibre: 0,
    cantidad: "",
    valor_unitario: 0,
    peso_bolsa: 0,
    numero_bolsas: 0,
    cantidad_requerida_kg: 0,
    valor_paquete: 0,
    valor_total: 0,
    precio_total: "",
    cliente_clb: 0,
    descripcion: "",
    observaciones: `${n}`
  };
}



function updateRow(row) {
return{...row, ...calcularCamposBolsa(row)}
}


function areItemsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function useCotizacionItems({ errores = {}, onChange, initialItems = [] }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (initialItems.length > 0 && !areItemsEqual(initialItems, rows)) {
      const itemsConUUID = initialItems.map((item, index) => ({
        ...item,
        _uuid: generateUUID(),
        itemNumber: index + 1,
        observaciones: item.observaciones || `${index + 1}`,
        ...updateRow(item),
      }));
      setRows(itemsConUUID);
    } else if (rows.length === 0) {
      setRows([createNewItem(1)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialItems]);

  useEffect(() => {
    onChange?.(rows);
  }, [rows]);    
           

  const handleInputChange = (_uuid, field, value) => {
    setRows(rows.map((r) => {
      if (r._uuid !== _uuid) return r;
      const updated = { ...r, [field]: value };
      return { ...updated, ...updateRow(updated) };
    }));
  };

  const addRow = () => {
    setRows((prev) => [...prev, createNewItem(prev.length + 1)]);
  };

  const removeRow = (id) => {
    const updated = rows
      .filter((r) => r._uuid !== id)
      .map((r, i) => ({
        ...r,
        itemNumber: i + 1,
        observaciones: `${i + 1}`,
      }));
    setRows(updated);
  };

  return { rows, handleInputChange, addRow, removeRow };
}
