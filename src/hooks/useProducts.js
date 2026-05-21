import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useEffect } from "react";
import { productsApi } from "../services/api";

export const useProducts = ({
  search = "",
  selectedProductId = null, // ⬅️ nuevo parámetro
  options = {}
} = {}) => {
  const queryClient = useQueryClient();



  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
    refetchOnWindowFocus = false,
    ...queryOptions
  } = options;

  // 🔹 1) Query principal: lista de productos
  const query = useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      const response = await productsApi.getAll({ search });
      // El endpoint devuelve { message, data: [...] }
      return response.data?.data ?? response.data ?? [];
    },
    enabled,
    staleTime,
    cacheTime: gcTime,
    keepPreviousData: true,
    refetchOnWindowFocus,
    retry: 2,
    ...queryOptions
  });

  const products = query.data ?? [];

  // 🔹 2) Si se requiere asegurar un productId → cargarlo individualmente
  useEffect(() => {
    if (!selectedProductId) return;

    const exists = products.some((p) => p.id === selectedProductId);
    if (exists) return;

    // Si NO existe → cargarlo y agregarlo al cache
    const loadProduct = async () => {
      try {
        const res = await productsApi.getById(selectedProductId);
        console.log("Producto individual cargado:", res.data);
        const product = res.data;

        // 🔹 Guardarlo en cache de React Query
        queryClient.setQueryData(["products", search], (old = []) => {
          const existsAlready = old.some((p) => p.id === product.id);
          return existsAlready ? old : [...old, product];
        });
      } catch (error) {
        console.error("Error cargando producto individual:", error);
      }
    };

    loadProduct();
  }, [selectedProductId, products, search, queryClient]);


  //Traer categorias
const categoriasQuery = useQuery({
  queryKey: ["categorias"],
  queryFn: async () => {
    const res = await productsApi.getCategorias();
    return res.data;
  },
  staleTime: 10 * 60 * 1000,
});


  

  return {
    products,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isEmpty: !query.isLoading && products.length === 0,
     categorias: categoriasQuery.data ?? [],
  categoriasLoading: categoriasQuery.isLoading,

  };
};
