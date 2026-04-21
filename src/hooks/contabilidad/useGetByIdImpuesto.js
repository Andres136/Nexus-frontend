import { useQuery } from "@tanstack/react-query";
import { impuestosService } from "../../services/contabilidadService";

export const useGetByIdImpuesto = (id) => {

const fetchImpuesto = async () => {

    const response = await  impuestosService.getImpuestoById(id);
    console.log("Impuesto obtenido:", response.data);
    return response.data.data;
  };

  const { data: impuesto, isLoading, error } = useQuery({
    queryKey: ["impuesto", id],
    queryFn: fetchImpuesto,
    enabled: !!id, // Solo ejecuta la consulta si el ID está disponible
  });

    return {
        impuesto,
        isLoading,
        error,
    }
}