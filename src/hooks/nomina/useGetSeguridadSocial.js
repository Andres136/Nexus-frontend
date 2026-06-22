import { useQuery } from "@tanstack/react-query";
import { seguridadSocialService } from "../../services/nominaService";

export const useGetSeguridadSocial = ({ enabled = true } = {}) => {
  const fetchSeguridadSocial = async () => {
    const response = await seguridadSocialService.getSeguridadSocial();
    return response.data;
  };

  const { data: seguridadSociales, isLoading, error } = useQuery({
    queryKey: ["seguridadSocial"],
    queryFn: fetchSeguridadSocial,
    enabled,
  });

  return {
    seguridadSociales,
    isLoading,
    error,
  };
};
