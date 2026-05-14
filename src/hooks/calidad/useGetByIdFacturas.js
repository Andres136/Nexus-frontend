import { useQuery } from "@tanstack/react-query";
import { facturasService } from "../../services/contabilidadService";

export const useGetByIdFacturas = (id) => {
  return useQuery({
    queryKey: ["factura", id],
    queryFn: async () => {
      const response = await facturasService.getFacturaById(id);
      return response.data.data ?? response.data;
    },
    enabled: !!id,
  });
};
