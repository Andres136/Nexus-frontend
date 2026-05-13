import { useQuery } from "@tanstack/react-query";
import { abonosFacturaCompraService } from "../../services/contabilidadService";

export const useGetRegistroPagoFacturaById = (id) => {

    const {
        data,
        error,
        isLoading,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ["registro-pago-factura-id", id],
        queryFn: async () => {
            const response = await abonosFacturaCompraService.getAbonoById(id);

            console.log("Factura por ID:", response.data);

            return response.data.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });

    return {
        data,
        error,
        isLoading,
        refetch,
        isFetching
    };
};