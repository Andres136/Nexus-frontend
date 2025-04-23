export function formatCurrency(valor) {
  const number = Number(valor) || 0;
  return number.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


  