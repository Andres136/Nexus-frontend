// src/utils/calculosBolsa.js
const FACTOR_PULGADA = 0.393701;
const FACTOR_CONSTANTE = 302;

export function calcularCamposBolsa({ largo_cm, ancho_cm, calibre, cantidad, valor_unitario, precio_total, iva_porcentaje = 19 }) {
  const largo = parseFloat(largo_cm) || 0;
  const ancho = parseFloat(ancho_cm) || 0;
  const cal   = parseFloat(calibre) || 0;
  const cant  = parseFloat(cantidad) || 0;
  let unitario = parseFloat(valor_unitario) || 0;
  let precioKilo = parseFloat(precio_total) || 0;

  let peso_bolsa = 0, numero_bolsas = 0, cantidad_requerida_kg = 0, valor_paquete = 0, valor_total = 0;

  if (largo > 0 && ancho > 0 && cal > 0) {
    let anchoIn = ancho * FACTOR_PULGADA;
    let largoIn = largo * FACTOR_PULGADA;
    if (ancho < 100) anchoIn = Math.ceil(anchoIn);
    if (largo < 100) largoIn = Math.ceil(largoIn);

    const resultado = anchoIn * largoIn * cal * FACTOR_CONSTANTE;
    peso_bolsa = Math.floor(resultado / 10000);

    if (peso_bolsa > 0) {
      const rawBags = 1000 / peso_bolsa;
      const enteroB = Math.floor(rawBags);
      const decimaB = rawBags - enteroB;
      numero_bolsas = decimaB >= 0.5 ? enteroB + 1 : enteroB;

      cantidad_requerida_kg = parseFloat(((cant * peso_bolsa) / 1000).toFixed(2));
    }
  }

  if (!unitario && numero_bolsas > 0 && precioKilo > 0) {
    unitario = parseFloat((precioKilo / numero_bolsas).toFixed(2));
  }

  if (unitario > 0 && cant > 0) {
    valor_paquete = parseFloat((unitario * cant).toFixed(2));
    const iva = parseFloat(iva_porcentaje) || 0;
    valor_total = parseFloat((valor_paquete * (1 + iva / 100)).toFixed(2));
  }

  return { peso_bolsa, numero_bolsas, cantidad_requerida_kg, valor_paquete, valor_total, valor_unitario: unitario };
}
