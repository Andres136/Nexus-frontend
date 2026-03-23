import { useQuery } from "@tanstack/react-query";
import { InspeccionesHseqService } from "../../services/hseqService";


export const useGetInspecciones = () => {
  return useQuery({
    queryKey: ["inspecciones"],
    queryFn: async () => {
      const res = await InspeccionesHseqService.getInspecciones();
      return res.data.data.data; // Asegúrate de devolver solo los datos relevantes
    },
  });
};