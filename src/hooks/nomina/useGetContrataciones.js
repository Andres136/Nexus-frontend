import { useQuery } from "@tanstack/react-query";
import { contratacionService } from "../../services/nominaService";

export const useGetContrataciones = (params = {}) => {
  const { data: contrataciones, isLoading, error } = useQuery({
    queryKey: ["contrataciones", params],
    queryFn: async () => {
      const response = await contratacionService.getContratos(params);
      // console.log("Respuesta de getContratos:", response);  
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  return { contrataciones, isLoading, error };
};
