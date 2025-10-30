import { createContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventariosApi, productsApi } from "../services/api";
import {useAuth} from '../hooks/useAuth';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  // Estado global de filtros
    const { user } = useAuth( {middleware: 'auth'} );
  const [filters, setFilters] = useState({
    search: "",
    empresa_id: null,
    sede_id: null,
    bodega_id: null,
    page: 1,
  });


  //UseEffect 

  useEffect(() => {
  if (user?.sede_id && !filters.sede_id) {
    setFilters(prev => ({ ...prev, sede_id: user.sede_id }));
  }
  if (user?.empresa_id && !filters.empresa_id) {
    setFilters(prev => ({ ...prev, empresa_id: user.empresa_id }));
  }
}, [user]);


  // Estado para controlar qué queries ejecutar
  const [enabledQueries, setEnabledQueries] = useState({
    products: true,
    allProducts: false,
    stock: false,
  });

  // Parámetros para queries específicas
  const [stockParams, setStockParams] = useState(null);
  const [stockUserOrder, setStockUserOrder] = useState(null);
  const [errors, setErrors] = useState(null);
  const [urlPDF, setUrlPDF] = useState(null);

  // Query 1: Productos paginados
const {
  data: productsData,
  isLoading: isLoadingProducts,
  isError: isErrorProducts,
  error: errorProducts,
  refetch: refetchProducts,
  isFetching: isFetchingProducts,
} = useQuery({
  queryKey: ["products", filters],
  queryFn: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ No hay token de autenticación. No se consultarán productos.");
      return { data: [] }; // devuelve vacío sin romper nada
    }

    const res = await productsApi.getProducts(filters);
    return res.data;
  },
  enabled: !!localStorage.getItem("token") && !!user, // 👈 evita ejecutar sin autenticación
  keepPreviousData: true,
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: false,
});

  // Query 2: Todos los productos (sin paginación)
  const {
    data: allProductsData,
    isLoading: isLoadingAllProducts,
    isError: isErrorAllProducts,
    error: errorAllProducts,
    refetch: refetchAllProducts,
    isFetching: isFetchingAllProducts,
  } = useQuery({
    queryKey: ["allProducts"],
    queryFn: async () => {
      const res = await productsApi.getAll();
      return res.data;
    },
    enabled: enabledQueries.allProducts,
    staleTime: 10 * 60 * 1000, // 10 min para todos los productos
    cacheTime: 15 * 60 * 1000, // 15 min
    refetchOnWindowFocus: false,
    retry: 2,
  });

// Query 3: Stock de producto específico
const {
  data: stockData,
  isLoading: isLoadingStock,
  isError: isErrorStock,
  error: errorStock,
  refetch: refetchStock,
  isFetching: isFetchingStock,
} = useQuery({
  queryKey: ["productStock", stockParams],
  queryFn: async () => {
    if (!stockParams?.id) return null;
    const res = await productsApi.getStock(stockParams.id, stockParams.params || {});
    //console.log("Stock data fetched:", res.data);
    return res.data;

  },
  enabled: enabledQueries.stock && !!stockParams,
  staleTime: 2 * 60 * 1000,
  cacheTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 2,
});





  // Métodos para controlar las queries
  const enableProductsQuery = () => {
    setEnabledQueries(prev => ({ ...prev, products: true }));
  };

  const enableAllProductsQuery = () => {
    setEnabledQueries(prev => ({ ...prev, allProducts: true }));
  };

  const enableStockQuery = (params) => {
    setStockParams(params);
    setEnabledQueries(prev => ({ ...prev, stock: true }));
  };

  const disableStockQuery = () => {
    setEnabledQueries(prev => ({ ...prev, stock: false }));
    setStockParams(null);
  };

// Métodos de conveniencia
const getStockProduct = async (id, params = {}) => {
  // params puede ser { bodega_id, sede_id }
  enableStockQuery({ id, ...params });  // 👈 spread para que se aplane el objeto
  return refetchStock();
};


  const getAllProducts = async () => {
    enableAllProductsQuery();
  
    return refetchAllProducts();
  };

const getStockWithSuggestions = async (id) => {
  try {
    // 🔹 Llamada directa al endpoint, sin tocar react-query ni stockParams
    const res = await productsApi.getStockWithSuggestions(id);
    return res;
  } catch (error) {
    console.error(`❌ Error en getStockWithSuggestions(${id}):`, error);
    throw error;
  }
};


const getStockForUserAndOrder = async (productoId, orderSedeId, bodegaId = null) => {
  try {
    const { data } = await productsApi.getStockForUserAndOrder(productoId, orderSedeId, bodegaId);
    setStockUserOrder(data);
    return data;
  } catch (err) {
    console.error("Error fetching stock for user+order:", err);
    throw err;
  }
};

  // Datos procesados
  const productos = productsData?.data ?? [];
  const pagination = productsData?.meta ?? null;
  const allProducts = allProductsData ?? [];
  const stockInfo = stockData ?? null;
  

  // Estados combinados
  const isLoading = isLoadingProducts || isLoadingAllProducts || isLoadingStock 
  const isFetching = isFetchingProducts || isFetchingAllProducts || isFetchingStock 
  const isError = isErrorProducts || isErrorAllProducts || isErrorStock 
  const error = errorProducts || errorAllProducts || errorStock 



   //Enviar traslado
  const envioInternoOc = async (data) => {
    try {
      const response = await inventariosApi.createTraslado(data);
      const pdfUrl = response.data.pdf || null;
      if (pdfUrl) {
        // Si la respuesta incluye la URL del PDF, puedes manejarla aquí
        setUrlPDF(pdfUrl);
      }
      return response.data;

    } catch (err) {
   //Error por input
   if (err.response && err.response.data && err.response.data.errors) {
    setErrors(err.response.data.errors);
   }
   

      console.error("Error creating traslado:", err);
      throw err;
    }
  }




  return (
    <ProductContext.Provider
      value={{
        // Datos
        productos,
        pagination,
        allProducts,
        stockInfo,
       
        filters,
        
        // Estados
        isLoading,
        isFetching,
        isError,
        error,
        isEmpty: !isLoadingProducts && (!productsData?.data || productsData.data.length === 0),
        
        // Estados específicos por query
        states: {
          products: {
            isLoading: isLoadingProducts,
            isFetching: isFetchingProducts,
            isError: isErrorProducts,
            error: errorProducts,
          },
          allProducts: {
            isLoading: isLoadingAllProducts,
            isFetching: isFetchingAllProducts,
            isError: isErrorAllProducts,
            error: errorAllProducts,
          },
          stock: {
            isLoading: isLoadingStock,
            isFetching: isFetchingStock,
            isError: isErrorStock,
            error: errorStock,
          },
        },
        
        // Métodos
        setFilters,
        refetchProducts,
        refetchAllProducts,
        refetchStock,
        getStockProduct,
        getStockWithSuggestions,
        getAllProducts,
        enableStockQuery,
        disableStockQuery,
        enableAllProductsQuery,
        enableProductsQuery,
        getStockForUserAndOrder,
        envioInternoOc,
        errors,
        setErrors,
        stockUserOrder,
        urlPDF,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};