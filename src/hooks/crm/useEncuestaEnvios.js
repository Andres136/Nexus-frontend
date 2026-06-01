import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { encuestaService } from "../../services/encuestaService";
import { showToast } from "../../helpers/utils/showToast";

export const useEncuestaEnvios = (encuestaId) => {
  const queryClient = useQueryClient();
  const [linksGenerados, setLinksGenerados] = useState([]);
  const [excluidos, setExcluidos]           = useState([]);

  const { mutate: enviar, isPending: isEnviando } = useMutation({
    mutationFn: (clienteIds) => encuestaService.enviar(encuestaId, clienteIds),
    onSuccess: (res) => {
      const links = res.data.links     ?? [];
      const excl  = res.data.excluidos ?? [];
      setLinksGenerados(links);
      setExcluidos(excl);

      if (links.length > 0) {
        showToast(
          "success",
          `Encuesta enviada a ${links.length} cliente${links.length !== 1 ? "s" : ""}. El correo llegará en breve.`
        );
      }

      if (excl.length > 0) {
        showToast(
          "error",
          `${excl.length} cliente${excl.length !== 1 ? "s" : ""} no pudo${excl.length !== 1 ? "eron" : ""} recibir la encuesta.`
        );
      }

      queryClient.invalidateQueries({ queryKey: ["encuesta", encuestaId] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Error al enviar la encuesta";
      showToast("error", msg);
    },
  });

  const limpiarLinks = () => { setLinksGenerados([]); setExcluidos([]); };

  return {
    enviar,
    isEnviando,
    linksGenerados,
    excluidos,
    limpiarLinks,
  };
};
