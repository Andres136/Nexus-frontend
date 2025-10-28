import { useQuery } from "@tanstack/react-query";
import { inventariosApi, productsApi } from "../services/api";

export const useProducts = ({ search = "", options = {} } = {}) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
    gcTime = 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus = false,
    ...queryOptions
  } = options;

  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["products", search], // cache separado por búsqueda
    queryFn: async () => {
      try {
        const response = await productsApi.getAll({ search });

        return response.data;
      } catch (err) {
        console.error("Error fetching products:", err);
        throw err; // React Query necesita que lo lances
      }
    },
    enabled,
    staleTime,
    cacheTime: gcTime,
    keepPreviousData: true,
    refetchOnWindowFocus,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions
  });


 

  return {
    products: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isEmpty: !isLoading && (!data?.data || data.data.length === 0)
  };
};
