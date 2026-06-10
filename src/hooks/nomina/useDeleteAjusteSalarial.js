import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { ajusteSalarialService } from "../../services/nominaService";

export const useDeleteAjusteSalarial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid) => ajusteSalarialService.deleteAjuste(uuid),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Ajuste salarial eliminado");
      queryClient.invalidateQueries({ queryKey: ["ajustesSalariales"] });
      queryClient.invalidateQueries({ queryKey: ["contrataciones"] });
      queryClient.invalidateQueries({ queryKey: ["nominas"] });
      queryClient.invalidateQueries({ queryKey: ["nominaSummary"] });
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No se pudo eliminar el ajuste salarial");
    },
  });
};
