import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TipoInspeccionesService } from "../../services/hseqService";


export const useGetTipoInspeccionesById = (id) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["tipoInspeccion", id],
    queryFn: async () => {
      const res = await TipoInspeccionesService.getTipoInspeccionById(id);
      return res.data;
    },
    enabled: !!id,
    initialData: () => {
      const lista = queryClient.getQueryData(["tipoInspecciones"]);
      return lista?.find(item => item.id === id);
    },
  });
};