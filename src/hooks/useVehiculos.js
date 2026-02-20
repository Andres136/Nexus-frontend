
import { useState } from "react";
import clienteAxios from "../config/axios"
import { usersApi } from "../services/api";
// hooks/useVehiculos.js
export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState(null);
  const [conductores, setConductores] = useState([]);


  const obtenerVehiculos = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');

      const { data } = await clienteAxios.get('/api/vehiculos-options', {
        headers: { Authorization: `Bearer ${token}` },
      });
    //  console.log('Vehículos obtenidos:', data.vehiculos);
    setVehiculos(Array.isArray(data) ? data : data.vehiculos ?? []);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setCargando(false);
    }
  };
  

  //Obtener  conductores
  const obtenerConductores = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');

      const { data } = await usersApi.getUsers();
     
      setConductores(data);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setCargando(false);
    }
  };


  return { vehiculos, cargando, error, obtenerVehiculos, obtenerConductores, conductores };
}
