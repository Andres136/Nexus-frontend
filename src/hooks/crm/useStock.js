import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../../services/api";


export function useStock(productId, sedeId) {
  return useQuery({
    queryKey: ["stock", productId, sedeId],
    queryFn: async () => {
      if (!productId) return null;

      const params = sedeId ? { sede_id: sedeId } : {};
      const res = await productsApi.getStock(productId, params);
    //  console.log("Stock obtenido:", res.data);

      return res.data.stock;
    },
    enabled: !!productId,
    staleTime: 1000 * 30, // 30 segundos
    refetchOnWindowFocus: true,
    retry: 1,
  });
}