import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { ajusteSalarialService } from "../../services/nominaService";

export const useRegisterAjusteSalarial = ({ onSuccess } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => ajusteSalarialService.createAjuste(payload),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Ajuste salarial registrado");
      queryClient.invalidateQueries({ queryKey: ["ajustesSalariales"] });
      queryClient.invalidateQueries({ queryKey: ["contrataciones"] });
      queryClient.invalidateQueries({ queryKey: ["nominas"] });
      queryClient.invalidateQueries({ queryKey: ["nominaSummary"] });
      onSuccess?.(response);
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo registrar el ajuste salarial");
    },
  });
};
