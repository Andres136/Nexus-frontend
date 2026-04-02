import { useQuery } from "@tanstack/react-query";
import { otAlistamientoService } from "../../services/vsm";
import { useState } from "react";

export function useAlistamientosActivos() {
  const [filters, setFilters] = useState({});

  const query = useQuery({
    queryKey: ["alistamientos-activos", filters], // 🔥 clave con filtros
    queryFn: async () => {
      const res = await otAlistamientoService.alistamientoActivoPorOT(filters);
      console.log("ReactQuery data:", res.data);
      return res.data;
    },
    refetchInterval: 2000, // 🔥 reemplaza setInterval
    keepPreviousData: true, // 🔥 evita parpadeos
  });

  const refresh = (newFilters = null) => {
    if (newFilters) {
      setFilters(newFilters); // 🔥 cambia filtro → refetch automático
    } else {
      query.refetch(); // 🔥 manual
    }
  };

  return {
    alistamientos: query.data || [],
    loading: query.isLoading,
    refresh,
  };
}