import { useEffect, useState } from "react";
import clienteAxios from "../config/axios";


export function useSedes() {
  const [sedes, setSedes] = useState([]);
  const [error, setError] = useState(null);

  const fetchSedes = async () => {
    try {
      const response = await clienteAxios.get('/api/sedes');
      setSedes(response.data);
    } catch (error) {
      console.error('Error fetching sedes:', error);
    }
  };

  
  useEffect(() => {
    fetchSedes();
  }, []);

const registrarSede = async (data) => {
 const token = localStorage.getItem('token');
  try {
    const response = await clienteAxios.post('/api/sedes', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;


  } catch (error) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        setError(validationErrors);
      }
    } else {
      console.error('Error registering sede:', error);
    }
  }
}

  return { sedes, registrarSede, error };
}