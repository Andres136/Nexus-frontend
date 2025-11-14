import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { bodegasApi, sedesApi } from "../services/api";
import Swal from "sweetalert2";


export function useSedes() {
  const [sedes, setSedes] = useState([]);
  const [error, setError] = useState(null);

  const [bodegas, setBodegas] = useState([]);
  const [errorBodegas, setErrorBodegas] = useState(null);
  // Función para obtener las sedes desde la API


  const fetchSedes = async () => {
    try {
      const response = await sedesApi.getAll();
      setSedes(response.data);
    } catch (error) {
      console.error('Error fetching sedes:', error);
    }
  };

  
  useEffect(() => {
    fetchSedes();
  }, []);

const registrarSede = async (data) => {
  setError(null); // Limpiar errores previos
  try {
    const response = await sedesApi.create(data);
    toast.success("Sede creada correctamente", {
      className: "bg-green-100 text-green-800 border border-green-300 font-medium rounded-md",
      progressClassName: "bg-green-400"
});

    return response.data;


  } catch (error) {
   
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        setError(validationErrors);
      }
    } else {
      console.log('Error registering sede:', error);
    }
  }
}



//Actualizar sede


const updateSede = async (id, data) => {
  setError(null); // Limpiar errores previos
  try {
    const response = await sedesApi.update(id, data);
    toast.success("Sede actualizada correctamente", {
      className: "bg-blue-100 text-blue-800 border border-blue-300 font-medium rounded-md",
      progressClassName: "bg-blue-400"
});
    // Actualiza la sede en el estado local
    setSedes(prevSedes => prevSedes.map(sede => sede.id === id ? { ...sede, ...data } : sede));
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        setError(validationErrors);
      }
    } else {
      console.log('Error updating sede:', error);
    }
  }
}

//Eliminar sede
const eliminarSede = async (id) =>{
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await sedesApi.delete(id);
        setSedes(prevSedes => prevSedes.filter(sede => sede.id !== id));
        Swal.fire('Eliminado', 'La sede ha sido eliminada.', 'success');
      } catch (error) {
        console.error('Error deleting sede:', error);
        Swal.fire('Error', 'Hubo un problema al eliminar la sede.', 'error');
      }
    }
  });
}

const  fetchBodegas = async () => {
  try {
    const response = await bodegasApi.getAll();

    setBodegas(response.data);
  } catch (error) {
    console.error('Error fetching bodegas:', error);
  }
}
useEffect(() => {
  fetchBodegas();
}, []);


const registrarBodega = async (data) => {
  setErrorBodegas(null); // Limpiar errores previos
  try {
    const response = await bodegasApi.create(data);
   await fetchBodegas(); // Actualiza la lista de bodegas después de registrar una nueva
    
    toast.success("Bodega creada correctamente", {
      className: "bg-green-100 text-green-800 border border-green-300 font-medium rounded-md",
      progressClassName: "bg-green-400"
});

    return response.data;

  } catch (error) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        setErrorBodegas(validationErrors);
      }
    } else {
      console.log('Error registering bodega:', error);
    }
  }
}


const updateBodega = async (id, data) => {
  setErrorBodegas(null); // Limpiar errores previos
  try {
    const response = await bodegasApi.update(id, data);
    toast.success("Bodega actualizada correctamente", {
      className: "bg-blue-100 text-blue-800 border border-blue-300 font-medium rounded-md",
      progressClassName: "bg-blue-400"
});
    // Actualiza la bodega en el estado local
    setBodegas(prevBodegas => prevBodegas.map(bodega => bodega.id === id ? { ...bodega, ...data } : bodega));
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        setErrorBodegas(validationErrors);
      }
    } else {
      console.log('Error updating bodega:', error);
    }
  }
}

//Eliminar bodega
const eliminarBodega = async (id) =>{
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await bodegasApi.delete(id);
        setBodegas(prevBodegas => prevBodegas.filter(bodega => bodega.id !== id));
        Swal.fire('Eliminado', 'La bodega ha sido eliminada.', 'success');
      } catch (error) {
        console.error('Error deleting bodega:', error);
        Swal.fire('Error', 'Hubo un problema al eliminar la bodega.', 'error');
      }
    }
  });
}

return { sedes, registrarSede, error, updateSede, eliminarSede, bodegas, errorBodegas, registrarBodega, eliminarBodega, updateBodega};
}