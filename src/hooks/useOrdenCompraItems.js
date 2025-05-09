// import { useState, useEffect } from "react";

// const FACTOR_PULGADA = 0.393701;
// const FACTOR_CONSTANTE = 302;

// function generateUUID() {
//   return crypto.randomUUID();
// }

// function createNewItem(n) {
//   return {
//     _uuid: generateUUID(),
//     itemNumber: n,
//     // …campos…
//     largo_cm: 0,
//     ancho_cm: 0,
//     calibre: 0,
//     cantidad: "",
//     valor_unitario: 0,
//     peso_bolsa: 0,
//     numero_bolsas: 0,
//     cantidad_requerida_kg: 0,
//     valor_total: 0,
//     observaciones: `${n}`,
//   };
// }

// // --- NUEVA LÓGICA DE PESAJE ---
// function calcularPesoBolsaNegocio(largo_cm, ancho_cm, calibre) {
//   if (!largo_cm || !ancho_cm || !calibre) return 0;

//   const largoIn = Math.round(largo_cm * FACTOR_PULGADA);
//   const anchoIn = Math.round(ancho_cm * FACTOR_PULGADA);

//   const resultado = largoIn * anchoIn * FACTOR_CONSTANTE * calibre;

//   return Math.max(1, Math.floor(resultado / 10_000)); // gramos, trunca
// }

// function updateRow(row) {
//   const largo = parseFloat(row.largo_cm) || 0;
//   const ancho = parseFloat(row.ancho_cm) || 0;
//   const calibre = parseFloat(row.calibre) || 0;
//   const cantidad = parseFloat(row.cantidad) || 0;
//   const unit = parseFloat(row.valor_unitario) || 0;

//   const peso_bolsa = calcularPesoBolsaNegocio(largo, ancho, calibre);

//   const numero_bolsas   = peso_bolsa ? Math.round(1000 / peso_bolsa) : 0;
//   const kg_requeridos   = peso_bolsa ? Math.ceil(cantidad * peso_bolsa) / 1000 : 0;
//   const valor_total     = cantidad * unit * 1.19;

//   return { peso_bolsa, numero_bolsas, cantidad_requerida_kg: kg_requeridos, valor_total };
// }

// // Hook principal
// export default function useOrdenCompraItems({ errores = {}, onChange }) {
//   const [rows, setRows] = useState([createNewItem(1)]);

//   const handleInputChange = (_uuid, field, value) => {
//     setRows(rows.map(r => {
//       if (r._uuid !== _uuid) return r;
//       const updated = { ...r, [field]: value };
//       return { ...updated, ...updateRow(updated) };
//     }));
//   };

//   const addRow    = () => setRows([...rows, createNewItem(rows.length + 1)]);
//   const removeRow = id =>
//     setRows(rows
//       .filter(r => r._uuid !== id)
//       .map((r, i) => ({ ...r, itemNumber: i + 1, observaciones: `${i + 1}` })));

//   useEffect(() => { onChange?.(rows); }, [rows]);
//   useEffect(() => { if (!Object.keys(errores).length) setRows([createNewItem(1)]); }, [errores]);

//   return { rows, handleInputChange, addRow, removeRow };
// }
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
    valor_total: 0,
    observaciones: `${n}`,
    cliente_clb: 0,
    descripcion: "",
  };
}

function calcularPesoBolsaNegocio(largo_cm, ancho_cm, calibre) {
  if (!largo_cm || !ancho_cm || !calibre) return 0;

  const largoIn = Math.round(largo_cm * FACTOR_PULGADA);
  const anchoIn = Math.round(ancho_cm * FACTOR_PULGADA);
  const resultado = largoIn * anchoIn * FACTOR_CONSTANTE * calibre;

  return Math.max(1, Math.floor(resultado / 10000)); // gramos
}

function updateRow(row) {
  const largo = parseFloat(row.largo_cm) || 0;
  const ancho = parseFloat(row.ancho_cm) || 0;
  const calibre = parseFloat(row.calibre) || 0;
  const cantidad = parseFloat(row.cantidad) || 0;
  const unit = parseFloat(row.valor_unitario) || 0;

  const peso_bolsa = calcularPesoBolsaNegocio(largo, ancho, calibre);
  const numero_bolsas = peso_bolsa ? Math.round(1000 / peso_bolsa) : 0;
  const kg_requeridos = peso_bolsa ? Math.ceil(cantidad * peso_bolsa) / 1000 : 0;
  const valor_total = cantidad * unit;

  return { peso_bolsa, numero_bolsas, cantidad_requerida_kg: kg_requeridos, valor_total };
}

function areItemsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function useOrdenCompraItems({ errores = {}, onChange, initialItems = [] }) {
  const [rows, setRows] = useState([]);

  // ✅ Cargar valores iniciales en modo edición
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

  // 🔁 Comunicar cambios al componente padre
  useEffect(() => {
    onChange?.(rows);
  }, [rows]);

  const handleInputChange = (_uuid, field, value) => {
    setRows(rows.map(r => {
      if (r._uuid !== _uuid) return r;
      const updated = { ...r, [field]: value };
      return { ...updated, ...updateRow(updated) };
    }));
  };

  const addRow = () => {
    setRows(prev => [...prev, createNewItem(prev.length + 1)]);
  };

  const removeRow = (id) => {
    const updated = rows
      .filter(r => r._uuid !== id)
      .map((r, i) => ({
        ...r,
        itemNumber: i + 1,
        observaciones: `${i + 1}`,
      }));
    setRows(updated);
  };

  return { rows, handleInputChange, addRow, removeRow };
}
