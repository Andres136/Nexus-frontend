import { gestionOperativaService } from "../../services/calidaService";
import { useQuery } from "@tanstack/react-query";

export const useGetDashboardOperativo = (id, filters = {}) => {

  return useQuery({
    queryKey: ["dashboardOperativo", id, JSON.stringify(filters)],

    queryFn: async () => {
      try {
        console.log("Obteniendo datos:", { id, filters });

        const response = await gestionOperativaService.getGestionById(id, filters);

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