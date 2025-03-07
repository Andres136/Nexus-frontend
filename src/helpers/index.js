 export const formatCurrency = (cantidad) => {
    return cantidad.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
