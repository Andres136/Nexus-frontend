import { useQuery } from "@tanstack/react-query";
import { seguimentoHallazgosService } from "../../services/calidaService";

export const useGetByIdSeguimientoHallazgo = (id) => {

    const obtenerSeguimiento = async () => {
        const response = await seguimentoHallazgosService.getSeguimientoById(id);
        return response.data;
    };

    // 🔥 REACT QUERY V5
    const {
        data,
        isLoading,
        error
    } = useQuery({
        queryKey: ["seguimientoHallazgo", id],
        queryFn: obtenerSeguimiento,
        enabled: !!id,
        retry: false,
    });

    return {
        data,
        isLoading,
        error
    };
};