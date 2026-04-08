import { useQuery } from "@tanstack/react-query";
import { GestionarFacturaApi } from "../../services/api";
export const useGetHistorialGestionFactura = (filters) => {

    const obtenerHistorialGestionFactura = async () => {
    
         const response = await GestionarFacturaApi.getCartera(filters ) // Reemplaza con el endpoint correcto para obtener el historial de gestión de factura
         console.log("Respuesta de historial gestión factura API:", response.data); // Verificar la estructura de la respuesta
         return response.data;
    // Por ahora, devolveremos un objeto vacío como placeholder hasta que implementes la lógica de la API
  
    }

        const query = useQuery({
        queryKey: ["historialGestionFactura", filters], // 🔥 clave para refrescar con filtros
        queryFn: obtenerHistorialGestionFactura,
        keepPreviousData: true
    });


    return{
        ...query
    }
}