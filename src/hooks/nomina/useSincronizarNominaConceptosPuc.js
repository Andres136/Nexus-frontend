import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nominaConceptoContableService } from "../../services/nominaService";

export function useSincronizarNominaConceptosPuc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => nominaConceptoContableService.sincronizarPuc(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nomina-conceptos-contables"] });
      queryClient.invalidateQueries({ queryKey: ["nomina-puc-payload"] });
    },
  });
}
