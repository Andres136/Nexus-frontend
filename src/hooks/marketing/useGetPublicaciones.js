import { useQuery } from "@tanstack/react-query";
import { PublicacionMarketingService } from "../../services/marketingService";

export const useGetPublicaciones = () => {
  return useQuery({
    queryKey: ["publicaciones-marketing"],
    queryFn: async () => {
      const res = await PublicacionMarketingService.getPublicaciones();
      return res.data.data.data;
    },
  });
};
