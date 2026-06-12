
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";    
import useSWR from "swr";
import { showToast } from "../helpers/utils/showToast";
import { clienteService, gestionClienteService } from "../services/clienteSevice";


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

const [error, setErrores] = useState({});
const [paginaActual, setPaginaActual] = useState(1);
const [totalPaginas, setTotalPaginas] = useState(1);
const[busqueda, setBusqueda]=useState('');
const [usuarioFiltro, setUsuarioFiltro] = useState("");
const [estadoFiltro, setEstadoFiltro] = useState("");
const [historialCliente, setHistorialCliente] = useState([]);
const[clientesTodos, setClientesTodos]=useState([]);


// El backend aplica los filtros según el rol y retorna las relaciones de gestión.
const query = new URLSearchParams({
  page: paginaActual,
  search: busqueda,
});

if (usuarioFiltro) query.set("user_id", usuarioFiltro);
if (estadoFiltro) query.set("estado_id", estadoFiltro);

const url = user ? `/api/clientes?${query.toString()}` : null;

// SWR se ejecuta solo si `url` no es null
const { data, mutate, isLoading } = useSWR(url, fetcher, {
  refreshInterval: 60000,
});

// Extraer los datos si están disponibles
const clientes = data?.data || [];
const estadisticas = data?.estadisticas || {
  clientes_activos: 0,
  clientes_listos: 0,
  clientes_pendientes: 0,
  gestiones_faltantes: 0,
};
const resumenMensualUsuarios = data?.resumen_mensual_usuarios || [];
const filtrosDisponibles = data?.filtros || {
  puede_filtrar_usuarios: false,
  usuarios: [],
  estados: [],
};

useEffect(() => {
  if (data) {
    setPaginaActual(data.current_page);
    setTotalPaginas(data.last_page);
  }
}, [data]);
 // usar data.data porque así lo devuelve tu API


const id_user =useRef(null);    
const nombreRef = useRef(null);
const emailRef = useRef(null);
const telefonoRef = useRef(null);
const direccionRef = useRef(null);
const nitRef = useRef(null);

async function registrarCliente(e) {
   
    e.preventDefault();

    const token = localStorage.getItem("token");

    const cliente = {
        user_id: user.id,
        nombre: nombreRef.current.value,
        email: emailRef.current.value,
        telefono: telefonoRef.current.value,
        direccion: direccionRef.current.value,
        nit: nitRef.current.value
    };

    try {
        const response = await clienteService.createCliente(cliente);

        showToast('success', response.data.message);
        const clienteNuevo = response.data.cliente;

        mutate(async current => {
            if (!current || !current.data) return { data: [clienteNuevo] };
            return {
              ...current,
              data: [clienteNuevo, ...current.data]
            };
          }, false);
          

        // Limpiar los campos del formulario
        nombreRef.current.value = "";
        emailRef.current.value = "";
        telefonoRef.current.value = "";
        direccionRef.current.value = "";
        nitRef.current.value = "";
    } catch (error) {
        if (error.response && error.response.data.errors) {
            setErrores(error.response.data.errors);
        } else {
            toast.error("Ocurrió un error al registrar el cliente");
        }
    }
}


// Obtener los clientes de la API
const obtenerClientes = async (
  page = 1,
  search = "",
  userId = usuarioFiltro,
  estadoId = estadoFiltro
) => {



  try {

    const response = await clienteService.getClientes(page, search, userId, estadoId);
    
    setPaginaActual(response.data.current_page);
    setTotalPaginas(response.data.last_page);

    // Si tienes estado clientes
    // setClientes(response.data.data);

  } catch (error) {

    console.error("Error al obtener los clientes:", error);

  }
};

  //Traer los clientes de la API

  const obtenerTodosClientes = async () => {

    try {
      const response = await clienteService.obtenerClientesAll(busqueda);
        setClientesTodos(response.data.data || response.data);
       

    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }

  };

useEffect(() => {

 if(user && user.role_id){
     obtenerClientes();
     obtenerTodosClientes();

    
 }
}
, [user,busqueda]);

// Filtrar clientes con debounce


//Actualizar cliente
const actualizarCliente = async (id, clienteActualizado) => {


    try {
        const response = await clienteService.updateCliente(id, clienteActualizado)

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

async function cambiarEstadoCliente(id){

    
    try {
        const response = await clienteService.cambiarEstado(id) // Cambia el estado a 2 para marcarlo como eliminado
        toast.success(response.data.message);
        // Actualizar el estado de clientes usando mutate de SWR
        await mutate();
        return response.data;
    } catch (error) {
        console.error('Error al cambiar el estado del cliente:', error);
        throw error;
    }
}


//Registrar gestion a cliente
async function registrarGestionCliente(clienteId, gestion){
    

    try {
        const response = await gestionClienteService.registrarGestion(clienteId, gestion);
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


    try {
        const response = await gestionClienteService.consultarHistorial(clienteId);
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
        usuarioFiltro,
        estadoFiltro,
        estadisticas,
        resumenMensualUsuarios,
        filtrosDisponibles,
        historialCliente,
        clientesTodos,
        setHistorialCliente,
        setBusqueda,
        setPaginaActual,
        setUsuarioFiltro,
        setEstadoFiltro,
        registrarCliente,
        obtenerClientes,
        obtenerTodosClientes,
        actualizarCliente,
        cambiarEstadoCliente,
        registrarGestionCliente,
        consultarHistorialCliente,
        

    }
}
