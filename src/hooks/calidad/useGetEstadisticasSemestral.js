import { useQuery } from "@tanstack/react-query" 
import {  hallazgosNovedadesService } from "../../services/calidaService";
 export const useGetEstadisticasSemestral = () => {

    const obtenerEstadisticasSemestral = async () => {
    const response = await  hallazgosNovedadesService.getEstadisticasSemestrales();
   // console.log("Respuesta de estadísticas semestrales:", response.data);
        return response.data;
    }

    const query = useQuery({
        queryKey: ["estadisticas-semestral"],
        queryFn: obtenerEstadisticasSemestral,
    });
    
    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,


    }
 }  