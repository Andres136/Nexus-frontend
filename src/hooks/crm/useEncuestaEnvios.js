import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { encuestaService } from "../../services/encuestaService";
import { showToast } from "../../helpers/utils/showToast";

export const useEncuestaEnvios = (encuestaId) => {
  const queryClient = useQueryClient();
  const [linksGenerados, setLinksGenerados] = useState([]);

  const { mutate: enviar, isPending: isEnviando } = useMutation({
    mutationFn: (clienteIds) => encuestaService.enviar(encuestaId, clienteIds),
    onSuccess: (res) => {
      const links = res.data.links ?? [];
      setLinksGenerados(links);

      const total = links.length;
      showToast(
        "success",
        `Encuesta enviada a ${total} cliente${total !== 1 ? "s" : ""}. El correo llegará en breve.`
      );

      // Actualizar detalle para reflejar los nuevos envíos
      queryClient.invalidateQueries({ queryKey: ["encuesta", encuestaId] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Error al enviar la encuesta";
      showToast("error", msg);
    },
  });

  const limpiarLinks = () => setLinksGenerados([]);

  return {
    enviar,
    isEnviando,
    linksGenerados,
    limpiarLinks,
  };
};
