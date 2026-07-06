import { useQuery } from "@tanstack/react-query"
import {  hallazgosNovedadesService } from "../../services/calidaService";
 export const useGetEstadisticasSemestral = ({ fecha_inicio, fecha_fin } = {}) => {

    const obtenerEstadisticasSemestral = async () => {
    const response = await  hallazgosNovedadesService.getEstadisticasSemestrales({ fecha_inicio, fecha_fin });
   // console.log("Respuesta de estadísticas semestrales:", response.data);
        return response.data;
    }

    const query = useQuery({
        queryKey: ["estadisticas-semestral", fecha_inicio, fecha_fin],
        queryFn: obtenerEstadisticasSemestral,
    });
    
    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,


    }
 }  