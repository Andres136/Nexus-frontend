import { useQuery } from "@tanstack/react-query";
import { RedSocialService } from "../../services/marketingService";

export const useGetRedesSociales = () => {
  return useQuery({
    queryKey: ["redes-sociales"],
    queryFn: async () => {
      const res = await RedSocialService.getRedesSociales();
      return res.data;
    },
  });
};
