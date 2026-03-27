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

  // ✅ Caso 1: string tipo "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss"
  if (typeof date === "string") {
    const cleanDate = date.split("T")[0]; // quita hora si existe
    const parts = cleanDate.split("-");

    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
  }

  // ✅ Caso 2: Date object (fallback seguro)
  if (date instanceof Date) {
    return date.toLocaleDateString("es-CO");
  }

  return "-";
}

export function formatNumber(value) {
  if (!value) return "0";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


