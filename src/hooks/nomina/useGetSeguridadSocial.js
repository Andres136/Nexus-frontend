import { useQuery } from "@tanstack/react-query";
import { seguridadSocialService } from "../../services/nominaService";

export const useGetSeguridadSocial = ({ enabled = true, params = {} } = {}) => {
  const fetchSeguridadSocial = async () => {
    const response = await seguridadSocialService.getSeguridadSocial(params);
    return response.data;
  };

  const { data: seguridadSociales, isLoading, error } = useQuery({
    queryKey: ["seguridadSocial", params],
    queryFn: fetchSeguridadSocial,
    enabled,
  });

  return {
    seguridadSociales,
    isLoading,
    error,
  };
};
