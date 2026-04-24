import { useQuery } from "@tanstack/react-query";
import { proveedoresApi } from "../../services/api";

export const useGetAllProveedores = () => {
    const fetchProveedores = async () => {
        const response = await proveedoresApi.getAll();
        console.log("Proveedores obtenidos:", response.data.data); // 👈 Agrega este log para verificar la respuesta
        return response.data.proveedores;
    };

    const { data: proveedores, isLoading, error } = useQuery({
        queryKey: ["proveedores"],
        queryFn: fetchProveedores,
    });

    return {
        proveedores,
        isLoading,
        error,
    };
}