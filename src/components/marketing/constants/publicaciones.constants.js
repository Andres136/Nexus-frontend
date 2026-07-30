export const ESTADOS_FILTRO = [
  { key: "todos", label: "Todos", color: "bg-gray-400" },
  { key: "programado", label: "Programado", color: "bg-amber-400" },
  { key: "publicado", label: "Publicado", color: "bg-emerald-400" },
  { key: "cancelado", label: "Cancelado", color: "bg-red-400" },
];

export const ESTADO_COLORES = {
  programado: "#f59e0b",
  publicado: "#10b981",
  cancelado: "#ef4444",
};

export const ESTADO_BADGES = {
  programado: { style: "bg-amber-100 text-amber-800 border-amber-200", label: "Programado" },
  publicado: { style: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Publicado" },
  cancelado: { style: "bg-red-100 text-red-800 border-red-200", label: "Cancelado" },
};

export const ESTADO_BG_CLASES = {
  programado: "bg-amber-50 border-amber-400",
  publicado: "bg-emerald-50 border-emerald-500",
  cancelado: "bg-red-50 border-red-400",
};
