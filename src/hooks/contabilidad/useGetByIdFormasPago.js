import { useQuery } from "@tanstack/react-query"
import { formasPagoService } from "../../services/contabilidadService"

export const useGetByIdFormasPago = (id) => {

const fetchFormaPago = async () => {

    const response = await  formasPagoService.getFormaPagoById(id);
    console.log("Forma de pago obtenida:", response.data);
    return response.data.data;
  };

  const { data: formaPago, isLoading, error } = useQuery({
    queryKey: ["formaPago", id],
    queryFn: fetchFormaPago,
    enabled: !!id, // Solo ejecuta la consulta si el ID está disponible
  });   

    return {
        formaPago,
        isLoading,
        error,
    }
}