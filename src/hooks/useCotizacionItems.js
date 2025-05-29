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

  let peso_bolsa = 0;
  let numero_bolsas = 0;
  let valor_unitario = 0;
  let valor_paquete = 0;
  let valor_total = 0;

  if (ancho > 0 && largo > 0 && calibre > 0) {
    const anchoIn   = ancho  * FACTOR_PULGADA;
    const largoIn   = largo  * FACTOR_PULGADA;
    const resultado = anchoIn * largoIn * calibre * FACTOR_CONSTANTE;
  
    // 1) Peso de la bolsa con “.5 hacia arriba”
    const rawPeso = resultado / 10000;
    const enteroP = Math.floor(rawPeso);
    const decimaP = rawPeso - enteroP;
    peso_bolsa    = decimaP >= 0.5 ? enteroP + 1 : enteroP;
  
    // 2) Número de bolsas con “.5 hacia arriba”
    const rawBags  = 1000 / peso_bolsa;
    const enteroB  = Math.floor(rawBags);
    const decimaB  = rawBags - enteroB;
    numero_bolsas = decimaB >= 0.5 ? enteroB + 1 : enteroB;
  }
  
  

  let fueCalculadoUnitario = false;

  // Si hay precio por kilo y bolsas, calcular automáticamente
  if (precioKilo > 0 && numero_bolsas > 0) {
 //   valor_unitario = parseFloat((precioKilo / numero_bolsas).toFixed(2));
 const rawUnitario = precioKilo / numero_bolsas;
 valor_unitario    = Math.ceil(rawUnitario);
    fueCalculadoUnitario = true;
  }

  // Si no se calculó y hay unitario manual

    if (!fueCalculadoUnitario && manual_unitario > 0) {
     // valor_unitario = manual_unitario;
     valor_unitario = Math.ceil(manual_unitario);
    
      // Establecemos precio_total explícitamente si viene solo valor_unitario
      if (numero_bolsas === 0) {
        numero_bolsas = 1;
        precioKilo = manual_unitario; // <-- 👈 evita que precio_total se quede vacío
      }
    }
    
  if (valor_unitario > 0 && cantidad > 0) {
    valor_paquete = parseFloat((valor_unitario * cantidad).toFixed(2));
    valor_total = parseFloat((valor_paquete * 1.19).toFixed(2));
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

  return { rows, updateItem, addItem, removeItem,  };
}
export {calcularValores}