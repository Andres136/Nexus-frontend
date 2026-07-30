import { useQuery } from "@tanstack/react-query";
import { TipoPostService } from "../../services/marketingService";

export const useGetTiposPost = () => {
  return useQuery({
    queryKey: ["tipos-post"],
    queryFn: async () => {
      const res = await TipoPostService.getTiposPost();
      return res.data;
    },
  });
};
