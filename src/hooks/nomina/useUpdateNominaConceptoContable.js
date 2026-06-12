import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nominaConceptoContableService } from "../../services/nominaService";

export function useUpdateNominaConceptoContable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }) => nominaConceptoContableService.updateConcepto(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nomina-conceptos-contables"] });
      queryClient.invalidateQueries({ queryKey: ["nomina-puc-payload"] });
    },
  });
}
