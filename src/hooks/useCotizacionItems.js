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
    itemNumber: index,
    ancho_cm: "",
    largo_cm: "",
    calibre: "",
    peso_bolsa: 0,
    numero_bolsas: 0,
    precio_total: "",
    valor_unitario: 0,
    cantidad: "",
    valor_paquete: 0,
    valor_total: 0,
    iva_porcentaje: 19,
    cliente_clb: "",
    cantidad_requerida_kg: "",
    descripcion: "",
    observaciones: "",
  };
}

function calcularValores(item) {
  const ancho = parseFloat(item.ancho_cm) || 0;
  const largo = parseFloat(item.largo_cm) || 0;
  const calibre = parseFloat(item.calibre) || 0;
  let precioKilo = parseFloat(item.precio_total) || 0;
  const cantidad = parseFloat(item.cantidad) || 0;
  const manual_unitario = item.valor_unitario !== "" ? parseFloat(item.valor_unitario) : 0;
  const iva = parseFloat(item.iva_porcentaje ?? 19) || 0;

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
    const rawPeso = resultado / 10000;
    peso_bolsa = Math.floor(rawPeso);

    if (peso_bolsa > 0) {
      const rawBags = 1000 / peso_bolsa;
      const enteroB = Math.floor(rawBags);
      const decimaB = rawBags - enteroB;
      numero_bolsas = decimaB >= 0.5 ? enteroB + 1 : enteroB;
    }
  }

  let fueCalculadoUnitario = false;

  if (precioKilo > 0 && numero_bolsas > 0) {
    valor_unitario = Math.ceil(precioKilo / numero_bolsas);
    fueCalculadoUnitario = true;
  }

  if (!fueCalculadoUnitario && manual_unitario > 0) {
    valor_unitario = parseFloat(manual_unitario.toFixed(2));
    if (numero_bolsas === 0) {
      numero_bolsas = 1;
      precioKilo = valor_unitario;
    }
  }

  if (valor_unitario > 0 && cantidad > 0) {
    valor_paquete = parseFloat((valor_unitario * cantidad).toFixed(2));
    valor_total = parseFloat((valor_paquete * (1 + iva / 100)).toFixed(2));
  }

  return {
    peso_bolsa,
    numero_bolsas,
    valor_unitario,
    valor_paquete,
    valor_total,
    precio_total: parseFloat(precioKilo.toFixed(2)),
    fueCalculadoUnitario,
  };
}

export default function useCotizacionItems({ errores = {}, onChange, initialRows = [] }) {
  const [rows, setRows] = useState(initialRows.length ? initialRows : [createItem(1)]);

  useEffect(() => {
    if (initialRows.length) setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    onChange?.(rows);
  }, [rows]);

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
      prev.filter((item) => item._uuid !== _uuid).map((item, i) => ({ ...item, item: i + 1, itemNumber: i + 1 }))
    );
  };

  const resetItems = () => {
    setRows([]);
    onChange?.([]);
  };

  return { rows, updateItem, addItem, removeItem, resetItems };
}

export { calcularValores };
