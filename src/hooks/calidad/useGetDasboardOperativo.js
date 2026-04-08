import { gestionOperativaService } from "../../services/calidaService";
import { useQuery } from "@tanstack/react-query";

export const useGetDashboardOperativo = (id, filters = {}) => {

  return useQuery({
    queryKey: ["dashboardOperativo", id, JSON.stringify(filters)],

    queryFn: async () => {
      console.log("Obteniendo datos:", { id, filters });

      const response = await gestionOperativaService.getGestionById(id, filters);

      console.log("Respuesta API:", response.data);

      return response.data;
    },

    enabled: true, // 🔥 importante
    keepPreviousData: true
  });

};