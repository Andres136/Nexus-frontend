import { useState, useEffect } from "react";

const FACTOR_PULGADA   = 0.393701; // cm → in
const FACTOR_CONSTANTE = 302;      // factor empírico

function generateUUID() {
  return crypto.randomUUID();
}

function createNewItem(itemNumber) {
  return {
    _uuid: generateUUID(),
    item: itemNumber,
    largo_cm: 0,
    ancho_cm: 0,
    calibre: 0,
    cantidad: 1,
    precio_total: 0,
    valor_unitario: 0,
    valor_total: 0,
    peso_bolsa: 0,
    numero_bolsas: 0,
    cantidad_requerida_kg: 0,
    descripcion: "",
    cliente_clb: "",
    observaciones: ""
  };
}

/* ---------- CÁLCULOS ACTUALIZADOS ---------- */
function updateRowCalculations(row) {
  const largo_cm     = parseFloat(row.largo_cm)     || 0;
  const ancho_cm     = parseFloat(row.ancho_cm)     || 0;
  const calibre      = parseFloat(row.calibre)      || 0;
  const cantidad     = parseFloat(row.cantidad)     || 0;
  const precio_total = parseFloat(row.precio_total) || 0;

  let peso_bolsa            = 0; // g
  let numero_bolsas         = 0; // bolsas por kg
  let cantidad_requerida_kg = 0; // kg totales
  let valor_unitario        = 0; // $
  let valor_total           = 0; // $

  /* --- 1. Peso de la bolsa --- */
  if (largo_cm > 0 && ancho_cm > 0 && calibre > 0) {
    const largoIn = Math.round(largo_cm * FACTOR_PULGADA);
    const anchoIn = Math.round(ancho_cm * FACTOR_PULGADA);

    // Fórmula de planta
    const resultado = largoIn * anchoIn * FACTOR_CONSTANTE * calibre;

    // “Correr la coma” → dividir entre 10 000 y TRUNCAR
    peso_bolsa = Math.max(1, Math.floor(resultado / 10_000)); // g

    /* --- 2. Bolsas por kilo y kg requeridos --- */
    numero_bolsas         = Math.round(1000 / peso_bolsa);          // bolsas por kg
    cantidad_requerida_kg = Math.ceil(cantidad * peso_bolsa) / 1000; // kg
  }

  /* --- 3. Valores monetarios --- */
  if (precio_total > 0 && numero_bolsas > 0) {
    valor_unitario = precio_total / numero_bolsas;
  }
  valor_total = cantidad * valor_unitario * 1.19; // incluye IVA 19 %

  return {
    peso_bolsa,
    numero_bolsas,
    cantidad_requerida_kg,
    valor_unitario,
    valor_total
  };
}
/* ------------------------------------------- */

export default function useCotizacionItems({ errores = {}, onChange }) {
  const [rows, setRows] = useState([createNewItem(1)]);

  const handleInputChange = (_uuid, field, value) => {
    setRows(rows.map(row => {
      if (row._uuid !== _uuid) return row;
      const updated      = { ...row, [field]: value };
      const calculations = updateRowCalculations(updated);
      return { ...updated, ...calculations };
    }));
  };

  const addRow = () =>
    setRows([...rows, createNewItem(rows.length + 1)]);

  const removeRow = (_uuid) =>
    setRows(
      rows
        .filter(r => r._uuid !== _uuid)
        .map((r, i) => ({ ...r, item: i + 1 }))
    );

  useEffect(() => { onChange?.(rows); }, [rows]);
  useEffect(() => { if (!Object.keys(errores).length) setRows([createNewItem(1)]); }, [errores]);

  return { rows, handleInputChange, addRow, removeRow };
}
