// import { useState, useEffect } from "react";

// const FACTOR_PULGADA   = 0.393701; // cm → in
// const FACTOR_CONSTANTE = 302;      // factor empírico

// function generateUUID() {
//   return crypto.randomUUID();
// }

// function createNewItem(itemNumber) {
//   return {
//     _uuid: generateUUID(),
//     item: itemNumber,
//     largo_cm: 0,
//     ancho_cm: 0,
//     calibre: 0,
//     cantidad: 1,
//     precio_total: 0,
//     valor_unitario: 0,
//     valor_total: 0,
//     peso_bolsa: 0,
//     numero_bolsas: 0,
//     cantidad_requerida_kg: 0,
//     descripcion: "",
//     cliente_clb: "",
//     observaciones: ""
//   };
// }

// /* ---------- CÁLCULOS ACTUALIZADOS ---------- */
// function updateRowCalculations(row) {
//   const largo_cm     = parseFloat(row.largo_cm)     || 0;
//   const ancho_cm     = parseFloat(row.ancho_cm)     || 0;
//   const calibre      = parseFloat(row.calibre)      || 0;
//   const cantidad     = parseFloat(row.cantidad)     || 0;
//   const precio_total = parseFloat(row.precio_total) || 0;

//   let peso_bolsa            = 0; // g
//   let numero_bolsas         = 0; // bolsas por kg
//   let cantidad_requerida_kg = 0; // kg totales
//   let valor_unitario        = 0; // $
//   let valor_total           = 0; // $

//   /* --- 1. Peso de la bolsa --- */
//   if (largo_cm > 0 && ancho_cm > 0 && calibre > 0) {
//     const largoIn = Math.round(largo_cm * FACTOR_PULGADA);
//     const anchoIn = Math.round(ancho_cm * FACTOR_PULGADA);

//     // Fórmula de planta
//     const resultado = largoIn * anchoIn * FACTOR_CONSTANTE * calibre;

//     // “Correr la coma” → dividir entre 10 000 y TRUNCAR
//     peso_bolsa = Math.max(1, Math.floor(resultado / 10_000)); // g

//     /* --- 2. Bolsas por kilo y kg requeridos --- */
//     numero_bolsas         = Math.round(1000 / peso_bolsa);          // bolsas por kg
//     cantidad_requerida_kg = Math.ceil(cantidad * peso_bolsa) / 1000; // kg
//   }

//   /* --- 3. Valores monetarios --- */
//   if (precio_total > 0 && numero_bolsas > 0) {
//     valor_unitario = precio_total / numero_bolsas;
//   }
//   valor_total = cantidad * valor_unitario * 1.19; // incluye IVA 19 %

//   return {
//     peso_bolsa,
//     numero_bolsas,
//     cantidad_requerida_kg,
//     valor_unitario,
//     valor_total
//   };
// }
// /* ------------------------------------------- */

// export default function useCotizacionItems({ errores = {}, onChange }) {
//   const [rows, setRows] = useState([createNewItem(1)]);

//   const handleInputChange = (_uuid, field, value) => {
//     setRows(rows.map(row => {
//       if (row._uuid !== _uuid) return row;
//       const updated      = { ...row, [field]: value };
//       const calculations = updateRowCalculations(updated);
//       return { ...updated, ...calculations };
//     }));
//   };

//   const addRow = () =>
//     setRows([...rows, createNewItem(rows.length + 1)]);

//   const removeRow = (_uuid) =>
//     setRows(
//       rows
//         .filter(r => r._uuid !== _uuid)
//         .map((r, i) => ({ ...r, item: i + 1 }))
//     );

//   useEffect(() => { onChange?.(rows); }, [rows]);
//   useEffect(() => { if (!Object.keys(errores).length) setRows([createNewItem(1)]); }, [errores]);

//   return { rows, handleInputChange, addRow, removeRow };
// }
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
    precio_total: 0,       // precio por kg
    valor_unitario: 0,     // precio por bolsa (antes de IVA)
    precio_paquete: 0,     // NUEVO: precio neto por la cantidad de bolsas
    valor_total: 0,        // total con IVA
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
  const precioKilo   = parseFloat(row.precio_total) || 0; // esto es $/kg

  // 1) CÁLCULO DE BOLSAS (para mostrar peso y núm. bolsas)
  let peso_bolsa = 0, numero_bolsas = 0;
  if (largo_cm && ancho_cm && calibre) {
    const inA = Math.round(ancho_cm * FACTOR_PULGADA);
    const inL = Math.round(largo_cm * FACTOR_PULGADA);
    const res = inA * inL * FACTOR_CONSTANTE * calibre;
    peso_bolsa    = Math.max(1, Math.floor(res / 10_000)); // en g
    numero_bolsas = Math.round(1000 / peso_bolsa);         // bolsas por kg
  }

  // 2) PRECIO POR BOLSA (usando bolsas/kg)
  const valor_unitario = numero_bolsas
    ? precioKilo / numero_bolsas
    : 0;

  // 3) PRECIO NETO DEL PAQUETE (independiente de kilos):
  //    simplemente cantidad de unidades × precio por unidad
  const precio_paquete = cantidad * valor_unitario;

  // 4) TOTAL CON IVA 19% (si lo quieres sobre el paquete):
  const valor_total = precio_paquete * 1.19;

  return {
    peso_bolsa,        // seguirás mostrando esto
    numero_bolsas,     // y esto
    valor_unitario,    // precio por bolsa
    precio_paquete,    // precio neto del paquete
    valor_total        // paquete + IVA
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
