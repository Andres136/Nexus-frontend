import { gestionOperativaService } from "../../services/calidaService";
import { useQuery } from "@tanstack/react-query";

export const useGetDashboardOperativo = ( filters = {}) => {

  return useQuery({
    queryKey: ["dashboardOperativo",  JSON.stringify(filters)],

    queryFn: async () => {
      try {
        console.log("Obteniendo datos:", {  filters });

        const response = await gestionOperativaService.getvsm(filters)
        console.log("Datos recibidos:", response.data);

        return response.data;

      } catch (error) {
        console.error("Error en dashboard:", error);

        // 🔥 IMPORTANTE: lanzar error para que React Query lo capture
        throw error;
      }
    },

    enabled: true,
    keepPreviousData: true,

    // 🔥 captura global
    onError: (error) => {
      console.error("Error React Query:", error);
    }
  });
};