import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TipoResiduosService } from "../../services/hseqService";

export const useGetTipoResiduosById = (id) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ["tipoResiduos", id],
        queryFn: async () => {
            const res = await TipoResiduosService.getTipoResiduosById(id);
            return res.data;
        },
        enabled: !!id,
        initialData: () => {
            const lista = queryClient.getQueryData(["tipoResiduos"]);
            return lista?.find(item => item.id === id);
        },
    });
}