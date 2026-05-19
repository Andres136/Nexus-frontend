// src/hooks/crm/useResumenDashboard.js
import { useQuery } from "@tanstack/react-query";
import { dashboardComercialApi } from "../../services/api";

export default function useResumenDashboard({
  userId = "",
  year = new Date().getFullYear(),
  month = "",
} = {}) {
  return useQuery({
    queryKey: ["resumen-dashboard", userId, year, month],

    queryFn: async () => {
      const params = {
        year,
      };

      if (userId) {
        params.user_id = userId;
      }

      if (month) {
        params.month = month;
      }

      const { data } =
        await dashboardComercialApi.getEstadisticasComerciales(params);



  return data.map((item) => ({
  ...item,
  total_gestiones: Number(item.gestiones || 0),
  total_cotizaciones: Number(item.cotizaciones || 0),
  total_ordenes: Number(item.ordenes || 0),
  total_clientes: Number(item.clientes_gestionados || 0),
  total_valor_ordenes: Number(item.valor_ventas || 0) / 1_000_000,
  cumplimiento: 0, // no viene del API
  conversion_pct: Number(item.conversion_pct || 0),
  fidelizacion_pct: Number(item.fidelizacion_pct || 0),
  cartera_pct_gestion: Number(item.cartera_pct_gestion || 0),
}));
    },

    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: true,
  });
}