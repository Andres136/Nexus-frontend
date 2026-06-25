import { useQuery } from "@tanstack/react-query";
import { gestionOperativaService } from "../../services/calidaService";

export const useGetPrioridadesVsm = (filters = {}) => {
  return useQuery({
    queryKey: ["vsmPrioridades", JSON.stringify(filters)],
    queryFn: async () => {
      const response = await gestionOperativaService.getPrioridadesActivas(filters);
      return response.data; // { data, total, current_page, last_page, per_page, stats }
    },
    staleTime: 60000,
    keepPreviousData: true,
  });
};
