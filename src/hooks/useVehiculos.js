
import { useState } from "react";
import clienteAxios from "../config/axios"

export const useVehiculos = () => {

const [vehiculos, setVehiculos] = useState([]);
const [cargando, setCargando] = useState(false);
const [error, setError] = useState({});

const obtenerVehiculos = async () => {
    setCargando(true);
    setError({}); // Limpiar errores antes de enviar
    try {
        const token = localStorage.getItem("token");
        const response = await clienteAxios.get("/api/vehiculos", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Vehiculos:", response.data);
        setVehiculos(response.data.vehiculos);

        
    } catch (error) {
        console.error("Error al obtener los vehículos:", error);
        setError(error) 
     }finally{
        setCargando(false);
     }
}


    return{
     vehiculos,
     cargando,
     error,
     setError,
     obtenerVehiculos
    }
}