import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function useFormatoFecha() {
    const formatearFecha = (fecha) => {
        if (!fecha) return "No disponible";

        try {
            return format(new Date(fecha), "dd 'de' MMMM 'del' yyyy, HH:mm", { locale: es });
        } catch (error) {
            console.error("Error formateando la fecha:", error);
            return "Fecha inválida";
        }
    };

    return { formatearFecha };
}
