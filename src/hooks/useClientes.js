
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";    
import useSWR from "swr";


//fetcher para SWR
const fetcher = (url) => {
    const token = localStorage.getItem("token"); // Obtener el token almacenado
  
    if (!token) {
      console.error("Token no encontrado, el usuario no está autenticado.");
      return Promise.reject("No hay token disponible.");
    }
  
    return clienteAxios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error en el fetcher de SWR:", error.response || error);
        return Promise.reject(error);
      });
  };
  
export function useClientes() {
const{user}=useAuth({middleware:'auth'});
const [clientes, setClientes] = useState([]);
const [error, setErrores] = useState({});
const [paginaActual, setPaginaActual] = useState(1);
const [totalPaginas, setTotalPaginas] = useState(1);
const[busqueda, setBusqueda]=useState('');
const [historialCliente, setHistorialCliente] = useState([]);
const[clientesTodos, setClientesTodos]=useState([]);

 // Usamos SWR para manejar los clientes
 const { data, mutate } = useSWR(`/api/clientes`, fetcher,{
    refreshInterval:60000,
 });
 // Refs para capturar los valores del formulario

const id_user =useRef(null);    
const nombreRef = useRef(null);
const emailRef = useRef(null);
const telefonoRef = useRef(null);
const direccionRef = useRef(null);
const nitRef = useRef(null);


async function registrarCliente(e){
    setErrores({});// Limpiar errores antes de enviar
    e.preventDefault();
    console.log('id del usrario', user.id);

    const token = localStorage.getItem('token');
     // Crear objeto con los datos del cliente
    const cliente = {
        user_id: user.id,
        nombre: nombreRef.current.value,
        email: emailRef.current.value,
        telefono: telefonoRef.current.value,
        direccion: direccionRef.current.value,
        nit: nitRef.current.value
    }
    try {
        const response = await clienteAxios.post('/api/clientes', cliente, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        toast.success(response.data.message);
        
        console.log(response.data);
        // Actualizar el estado de clientes usando mutate de SWR
        mutate();
        // Limpiar los campos del formulario
        nombreRef.current.value = '';
        emailRef.current.value = '';
        telefonoRef.current.value = '';
        direccionRef.current.value = '';
        nitRef.current.value = '';
    } catch (error) {
    if (error.response && error.response.data.errors) {
        setErrores(error.response.data.errors);
        console.log(error);
    }else{
        toast.error('Ocurrió un error al registrar el cliente');
    }   
}
}
// Obtener los clientes de la API
const obtenerClientes = async (page = 1, search = "") => {
    const token = localStorage.getItem("token");
    // 🛑 Si user no está listo, esperar antes de hacer la petición
  if (!user || !user.role_id) {
    console.log("Usuario no disponible aún, esperando...");
    return
      }
          const esAdmin = user.role_id === 1 || user.role_id === 7;
    try {
       const url = esAdmin
         ? `/api/clientes?page=${page}&search=${search}`
         : `/api/clientes-registro-user?page=${page}&search=${search}`;

      const response = await clienteAxios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClientes(response.data.data);
      setPaginaActual(response.data.current_page);
      setTotalPaginas(response.data.last_page);
     //Actualizar la cache de SWR
     mutate();
      
    
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  };

  //Traer los clientes de la API

  const obtenerTodosClientes = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get(`/api/clientes-todos?search=${busqueda}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
        setClientesTodos(response.data.data || response.data);
        console.log('todos ',response.data);

    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }

  };

useEffect(() => {

 if(user && user.role_id){
     obtenerClientes();
     consultarHistorialCliente();
     obtenerTodosClientes();

    
 }
}
, [user,busqueda]);

// Filtrar clientes con debounce


//Actualizar cliente
const actualizarCliente = async (id, clienteActualizado) => {
    const token = localStorage.getItem('token');

    try {
        const response = await clienteAxios.put(`/api/clientes/${id}`, clienteActualizado, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        toast.success(response.data.message);
        console.log(response.data);

        // Actualizar el estado de clientes usando mutate de SWR
        mutate();
    } catch (error) {
        if (error.response && error.response.data.errors) {
            setErrores(error.response.data.errors);
            console.log(error);
        } else {
            toast.error('Ocurrió un error al actualizar el cliente');
        }
    }
};
//Eliminar cliente

async function eliminarCliente(id){

    console.log('id del cliente', id);
    const token = localStorage.getItem('token');
    try {
        const response = await clienteAxios.delete(`/api/clientes/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        toast.success(response.data.message);
        console.log(response.data);
        // Actualizar el estado de clientes usando mutate de SWR
        mutate();
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
    }
}


//Registrar gestion a cliente
async function registrarGestionCliente(clienteId, gestion){
    console.log('id del cliente gestion', clienteId);
    const token = localStorage.getItem('token');
    try {
        const response = await clienteAxios.post(`/api/clientes/${clienteId}/seguimientos`, gestion, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        toast.success(response.data.message);
        console.log(response.data);
        // Actualizar el estado de clientes usando mutate de SWR
        mutate();

        setErrores({}); // Limpiar errores
    } catch (error) {
        if (error.response && error.response.data.errors) {
            setErrores(error.response.data.errors);
            console.log(error.response.data.errors);
        } else {
            toast.error('Ocurrió un error al registrar la gestión');
        }
    }
}

//Consultar Historial de cliente por ID
async function consultarHistorialCliente(clienteId){
    console.log('id del cliente', clienteId)
    const token = localStorage.getItem('token');
    try {
        const response = await clienteAxios.get(`/api/clientes/${clienteId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
         console.log(response.data);
        setHistorialCliente(response.data);
      
        return response.data;
    } catch (error) {
        console.error('Error al obtener el historial del cliente:', error);
        return null;
    }
}


    return{
        clientes,
        id_user,
        nombreRef,
        emailRef,
        telefonoRef,
        direccionRef,
        nitRef,
        error,
        paginaActual,
        totalPaginas,
        busqueda,
        historialCliente,
        clientesTodos,
        setHistorialCliente,
        setBusqueda,
        registrarCliente,
        obtenerClientes,
        obtenerTodosClientes,
        actualizarCliente,
        eliminarCliente,
        registrarGestionCliente,
        consultarHistorialCliente,
        

    }
}