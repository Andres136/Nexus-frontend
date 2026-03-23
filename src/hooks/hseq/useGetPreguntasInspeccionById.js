import { useQuery } from "@tanstack/react-query";
import { PreguntasInspeccionesService } from "../../services/hseqService";

export const useGetPreguntasInspeccionById = (tipoInspeccionId) => {
    const obtenerPreguntas = async () => {
        const response = await PreguntasInspeccionesService.getPreguntasInspeccionByTipo(tipoInspeccionId);
        console.log("Respuesta de preguntas por tipo de inspección:", response.data) // Verificar la estructura de la respuesta
        return response.data.data;
    }

    const query = useQuery({
        queryKey: ["preguntasInspeccion", tipoInspeccionId],
        queryFn: obtenerPreguntas,
        enabled: !!tipoInspeccionId, // Solo ejecutar si se proporciona un ID válido
    })

    return{
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    }
}