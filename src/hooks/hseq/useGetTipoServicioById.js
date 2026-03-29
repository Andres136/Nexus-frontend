import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TipoServiciosService } from "../../services/hseqService";


export const useGetTipoServicioById = (id) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ["tipoServicio", id],
        queryFn: async () => {
            const res = await TipoServiciosService.getTipoServicioById(id);
            return res.data;
        },
        enabled: !!id,
        initialData: () => {
            const lista = queryClient.getQueryData(["tipoServicios"]);
            return lista?.find(item => item.id === id);
        },
    });
}