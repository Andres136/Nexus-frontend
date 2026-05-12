import { useQuery } from "@tanstack/react-query";
import { abonosFacturaCompraService } from "../../services/contabilidadService";

export const useGetRegistroPagoFactura = (params = {}) => {

    const obtenerRegistroPago = async () => {
        const response = await abonosFacturaCompraService.getAbonos(params);

        console.log("Respuesta del servicio de pagos:", response.data);

        return response.data;
    };

    const {
        data,
        error,
        isLoading,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ["registro-pago-factura", params],
        queryFn: obtenerRegistroPago,
        enabled: true,
    });

    return {
        data,
        error,
        isLoading,
        refetch,
        isFetching
    };
};