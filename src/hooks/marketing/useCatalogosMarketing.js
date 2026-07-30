import { useQueryClient } from "@tanstack/react-query";
import { useGetRedesSociales } from "./useGetRedesSociales";
import { useGetTiposPost } from "./useGetTiposPost";
import { RedSocialService, TipoPostService } from "../../services/marketingService";
import { showToast } from "../../helpers/utils/showToast";

export const useCatalogosMarketing = () => {
  const queryClient = useQueryClient();
  const { data: redesSociales } = useGetRedesSociales();
  const { data: tiposPost } = useGetTiposPost();

  const crearRedSocial = async (nombre) => {
    try {
      const res = await RedSocialService.createRedSocial({ nombre });
      showToast("success", "Red social creada exitosamente");
      queryClient.invalidateQueries(["redes-sociales"]);
      return res.data.data;
    } catch (err) {
      showToast("error", err.response?.data?.message || "No se pudo crear la red social");
      return null;
    }
  };

  const crearTipoPost = async (nombre) => {
    try {
      const res = await TipoPostService.createTipoPost({ nombre });
      showToast("success", "Tipo de post creado exitosamente");
      queryClient.invalidateQueries(["tipos-post"]);
      return res.data.data;
    } catch (err) {
      showToast("error", err.response?.data?.message || "No se pudo crear el tipo de post");
      return null;
    }
  };

  return { redesSociales, tiposPost, crearRedSocial, crearTipoPost };
};
