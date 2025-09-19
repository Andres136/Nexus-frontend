


import { useQuery } from "@tanstack/react-query";
import { siigoSetasApi, siigoGlobalApi } from "../services/api";

// 🔹 Hook para manejar ambas APIs de Siigo
export function useApiSiigo({ tipo = "setas", search = "", page = 1, pageSize = 10 }) {
  // función para elegir el endpoint
  const getProducts = async () => {
    if (tipo === "setas") {
      const res = await siigoSetasApi.getProducts({ search, page, page_size: pageSize });
      console.log("Productos de setas:", res.data);
      return res.data;
    } else if (tipo === "global") {
      const res = await siigoGlobalApi.getProducts({ search, page, page_size: pageSize });
      console.log("Productos globales:", res.data);
      return res.data;
    }
    throw new Error("Tipo inválido, debe ser 'setas' o 'global'");
  };

  // react query dinámico
  const query = useQuery({
    queryKey: ["siigoProducts", tipo, search, page],
    queryFn: getProducts,
    keepPreviousData: true,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
