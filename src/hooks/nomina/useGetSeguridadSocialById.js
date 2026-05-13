import { useQuery } from "@tanstack/react-query";
import { seguridadSocialService } from "../../services/nominaService";

export const useGetSeguridadSocialById = (uuid) => {
  const fetchSeguridadSocialById = async () => {
    const response = await seguridadSocialService.getSeguridadSocialById(uuid);
    return response.data;
  };

  const {
    data: seguridadSocial,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["seguridadSocial", uuid],
    queryFn: fetchSeguridadSocialById,
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5,
  });

  return {
    seguridadSocial,
    isLoading,
    error,
    refetch,
  };
};
