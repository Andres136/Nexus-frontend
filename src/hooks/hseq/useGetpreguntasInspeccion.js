import { useQuery } from "@tanstack/react-query";
import { PreguntasInspeccionesService } from "../../services/hseqService";

export const useGetPreguntasInspeccion = ({
  page = 1,
  per_page = 10,
  search = "",
  tipo_inspeccion_id = null,
}) => {
  const obtenerPreguntas = async () => {

    const response =
      await PreguntasInspeccionesService.getPreguntasInspeccionTipoInspeccion({
        page,
        per_page,
        search,
        tipo_inspeccion_id,
      });



    return response.data;
  };

  const query = useQuery({
    queryKey: ["preguntasInspeccion", page, search, tipo_inspeccion_id],
    queryFn: obtenerPreguntas,
    keepPreviousData: true,
  });

  return {
    dataPreguntas: query.data?.data?.data || [],
    pagination: {
      currentPage: query.data?.data?.current_page || 1,
      lastPage: query.data?.data?.last_page || 1,
      total: query.data?.data?.total || 0,
    },
    isLoadingPreguntas: query.isLoading,
    errorPreguntas: query.error,
  };
};