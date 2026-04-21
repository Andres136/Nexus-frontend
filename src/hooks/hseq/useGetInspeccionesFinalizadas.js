import { useQuery } from "@tanstack/react-query";
import { InspeccionesHseqService } from "../../services/hseqService";

export const useGetInspeccionesFinalizadas = () => {

  const fetchInspeccionesFinalizadas = async () => {
    const response = await InspeccionesHseqService.getInspeccionesFinalizadas();
    return response.data; // 🔥 importante
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["inspeccionesFinalizadas"],
    queryFn: fetchInspeccionesFinalizadas,
  });

  return {
    inspeccionesFinalizadas: data || [], // 🔥 evita undefined
    isLoading,
    error,
  };
};