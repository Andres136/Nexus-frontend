export function formatCurrency(valor) {
  const number = Number(valor) || 0;
  return number.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Formatea una fecha en formato "DD/MM/YYYY" Colombiano
export function formatDate(date) {
  if (!date) return "-";
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(date).toLocaleDateString("es-CO", options);
}


  