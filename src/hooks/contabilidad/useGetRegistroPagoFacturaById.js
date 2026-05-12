import { useQuery } from "@tanstack/react-query";
import { abonosFacturaCompraService } from "../../services/contabilidadService";

export const useGetRegistroPagoFacturanteById = (id) => {

    const { data, error, isLoading } = useQuery({
        queryKey: ["registro-pago-factura", id],
        queryFn: () => abonosFacturaCompraService.getAbonoById(id).then(r => r.data),
        enabled: !!id,
    });

    return {
        data,
        error,
        isLoading,
    };
};
