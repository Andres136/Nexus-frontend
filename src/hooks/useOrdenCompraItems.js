import { useState, useEffect } from "react";

const FACTOR_PULGADA = 0.393701;
const FACTOR_CONSTANTE = 302;

function generateUUID() {
  return crypto.randomUUID();
}

function createNewItem(n) {
  return {
    _uuid: generateUUID(),
    itemNumber: n,
    largo_cm: 0,
    ancho_cm: 0,
    calibre: 0,
    cantidad: "",
    valor_unitario: 0,
    peso_bolsa: 0,
    numero_bolsas: 0,
    cantidad_requerida_kg: 0,
    valor_paquete: 0,
    valor_total: 0,
    precio_total: "",
    cliente_clb: "",
    descripcion: "",
    observaciones: `${n}`
  };
}

function calcularPesoBolsaNegocio(largo_cm, ancho_cm, calibre) {
  if (!largo_cm || !ancho_cm || !calibre) return 0;
  const largoIn = largo_cm * FACTOR_PULGADA;
  const anchoIn = ancho_cm * FACTOR_PULGADA;
  const resultado = largoIn * anchoIn * calibre * FACTOR_CONSTANTE;
  return Math.max(1, parseFloat((resultado / 10000).toFixed(2))); // gramos
}

function updateRow(row) {
  const largo = parseFloat(row.largo_cm) || 0;
  const ancho = parseFloat(row.ancho_cm) || 0;
  const calibre = parseFloat(row.calibre) || 0;
  const cantidad = parseFloat(row.cantidad) || 0;
  const precio_total = parseFloat(row.precio_total) || 0;
  let valor_unitario = parseFloat(row.valor_unitario) || 0;

  const peso_bolsa = calcularPesoBolsaNegocio(largo, ancho, calibre);
  const numero_bolsas = peso_bolsa > 0 ? Math.floor(1000 / peso_bolsa) : 0;

  // si no tiene valor_unitario pero sí precio_total, lo calculamos
  if (!valor_unitario && numero_bolsas > 0 && precio_total > 0) {
    valor_unitario = parseFloat((precio_total / numero_bolsas).toFixed(2));
  }

  const valor_paquete = parseFloat((valor_unitario * cantidad).toFixed(2));
  const valor_total = parseFloat((valor_paquete * 1.19).toFixed(2));
  const cantidad_requerida_kg = peso_bolsa > 0
    ? parseFloat(((cantidad * peso_bolsa) / 1000).toFixed(2))
    : 0;

  return {
    peso_bolsa,
    numero_bolsas,
    valor_unitario,
    valor_paquete,
    valor_total,
    cantidad_requerida_kg
  };
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
