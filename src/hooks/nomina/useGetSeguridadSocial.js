import { useQuery } from "@tanstack/react-query";
import { seguridadSocialService } from "../../services/nominaService";

export const useGetSeguridadSocial = () => {
  const fetchSeguridadSocial = async () => {
    const response = await seguridadSocialService.getSeguridadSocial();
    console.log("Seguridad Social Response:", response); // Debug log
    return response.data;
  };

  const { data: seguridadSociales, isLoading, error } = useQuery({
    queryKey: ["seguridadSocial"],
    queryFn: fetchSeguridadSocial,
  });

  return {
    seguridadSociales,
    isLoading,
    error,
  };
};
