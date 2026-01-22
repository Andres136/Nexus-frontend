import { useState, useEffect } from "react";

const FACTOR_PULGADA = 0.393701;
const FACTOR_CONSTANTE = 302;

function generateUUID() {
  return crypto.randomUUID();
}

function createItem(index) {
  return {
    _uuid: generateUUID(),
    item: index,
    ancho_cm: "",
    largo_cm: "",
    calibre: "",
    peso_bolsa: 0,
    numero_bolsas: 0,
    precio_total: "", // precio del kilo (opcional)
    valor_unitario: 0,
    cantidad: "", // número de unidades
    valor_paquete: 0,
    valor_total: 0,
    cliente_clb: "",
    cantidad_requerida_kg: "",
    descripcion: "",
    observaciones: ""
  };
}
function calcularValores(item) {
  const ancho = parseFloat(item.ancho_cm) || 0;
  const largo = parseFloat(item.largo_cm) || 0;
  const calibre = parseFloat(item.calibre) || 0;
  let precioKilo = parseFloat(item.precio_total) || 0;
  const cantidad = parseFloat(item.cantidad) || 0;
  const manual_unitario = item.valor_unitario !== "" ? parseFloat(item.valor_unitario) : 0;

  console.log("📏 Input inicial:", { ancho, largo, calibre, precioKilo, cantidad });

  let peso_bolsa = 0;
  let numero_bolsas = 0;
  let valor_unitario = 0;
  let valor_paquete = 0;
  let valor_total = 0;

  if (ancho > 0 && largo > 0 && calibre > 0) {
    let anchoIn = ancho * FACTOR_PULGADA;
    let largoIn = largo * FACTOR_PULGADA;
    if (ancho < 100) anchoIn = Math.ceil(anchoIn);
    if (largo < 100) largoIn = Math.ceil(largoIn);

    const resultado = anchoIn * largoIn * calibre * FACTOR_CONSTANTE;

    console.log("📐 Conversión cm → pulgadas:", { anchoIn, largoIn });
    console.log("📊 Resultado fórmula:", resultado);

    const rawPeso = resultado / 10000;
    peso_bolsa = Math.floor(rawPeso);

    console.log("⚖️ Peso bolsa:", rawPeso, "→ redondeado:", peso_bolsa);

    if (peso_bolsa > 0) {
      const rawBags = 1000 / peso_bolsa;
      const enteroB = Math.floor(rawBags);
      const decimaB = rawBags - enteroB;
      numero_bolsas = decimaB >= 0.5 ? enteroB + 1 : enteroB;
      console.log("📦 Número de bolsas:", rawBags, "→ redondeado:", numero_bolsas);
    } else {
      console.warn("⚠️ No se pudo calcular número de bolsas porque peso_bolsa es 0");
    }
  } else {
    console.warn("❌ No se puede calcular por valores incompletos", { ancho, largo, calibre });
  }

  let fueCalculadoUnitario = false;

  if (precioKilo > 0 && numero_bolsas > 0) {
    const rawUnitario = precioKilo / numero_bolsas;
    valor_unitario = Math.ceil(rawUnitario);
    fueCalculadoUnitario = true;
    console.log("💰 Unitario por precio/kilo:", rawUnitario, "→ redondeado:", valor_unitario);
  }

if (!fueCalculadoUnitario && manual_unitario > 0) {
  valor_unitario = parseFloat(manual_unitario.toFixed(2)); // ✅ conserva decimales
  console.log("✍️ Unitario manual (sin redondeo):", valor_unitario);

  if (numero_bolsas === 0) {
    numero_bolsas = 1;
    precioKilo = valor_unitario;
  }
}


  if (valor_unitario > 0 && cantidad > 0) {
    valor_paquete = parseFloat((valor_unitario * cantidad).toFixed(2));
    valor_total = parseFloat((valor_paquete * 1.19).toFixed(2));
    console.log("📦 Paquete sin IVA:", valor_paquete, "→ con IVA:", valor_total);
  }

  return {
    peso_bolsa,
    numero_bolsas,
    valor_unitario,
    valor_paquete,
    valor_total,
    precio_total: parseFloat(precioKilo.toFixed(2)),
    fueCalculadoUnitario
  };
}



export default function useCotizacionItems({ errores = {}, onChange, initialRows = [] }) {
  const [rows, setRows] = useState(initialRows.length ? initialRows : [createItem(1)]);

  useEffect(() => {
    if (initialRows.length) {
      setRows(initialRows);
    }
  }, [initialRows]);
 

  const updateItem = (_uuid, field, value) => {
    setRows((prev) =>
      prev.map((item) => {
        if (item._uuid !== _uuid) return item;
        const actualizado = { ...item, [field]: value };
        return { ...actualizado, ...calcularValores(actualizado) };
      })
    );
  };

  const addItem = () => {
    setRows((prev) => [...prev, createItem(prev.length + 1)]);
  };

  const removeItem = (_uuid) => {
    setRows((prev) =>
      prev.filter((item) => item._uuid !== _uuid).map((item, i) => ({ ...item, item: i + 1 }))
    );
  };

  useEffect(() => {
    onChange?.(rows);
  }, [rows]);

  const resetItems = () => {
    setRows([]);
    onChange([]);
  };

  return { rows, updateItem, addItem, removeItem,resetItems  };
}
export {calcularValores}