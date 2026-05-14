import { useQuery } from "@tanstack/react-query";
import { formasPagoService } from "../../services/contabilidadService";

export const useGetFormasPago = () => {

  const fetchFormasPago = async () => {
    const response = await formasPagoService.getFormasPago();
   // console.log("Formas de pago obtenidas:", response.data);
    return response.data.data;
  };

  const { data: formasPago, isLoading, error } = useQuery({
    queryKey: ["formasPago"],
    queryFn: fetchFormasPago,
  });

  return {
    formasPago,
    isLoading,
    error,
  };
};