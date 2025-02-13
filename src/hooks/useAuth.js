import useSWR from "swr";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";
import {  useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export const useAuth = ({middleware,url}) => {
    

    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
const token = localStorage.getItem("token");
const navigate = useNavigate();
const {data: user, error,mutate}= useSWR('/api/user',()=>
    clienteAxios('/api/user',{
        headers:{
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => res.data)
    .catch(error=>{
        throw Error(error?.response?.data?.errors)
    })
)

 const login = async (data,setErrores) => {
    try {
        const response = await clienteAxios.post('/api/login', data);
        localStorage.setItem("token", response.data.token);
      
        setErrores({});
        await mutate();
        toast.success(response.data.message); // Mensaje de éxito
        return true;
      } catch (error) {
        if (error.response && error.response.data.errors) {
          const backendErrors = error.response.data.errors;
          if (backendErrors["0"]) {
            // Error general del backend
            setErrores({ general: backendErrors["0"] });
          } else {
            // Errores específicos por campo
            const erroresPorCampo = {};
            Object.keys(backendErrors).forEach((campo) => {
              erroresPorCampo[campo] = backendErrors[campo][0];
            });
            setErrores(erroresPorCampo);
          }
        } else {
          toast.error("Ocurrió un error inesperado. Inténtalo de nuevo.");
        }
        return false;
      }
 }
 const register = async (data, setErrores) => {
    try {
        const response = await clienteAxios.post('/api/users', data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        // Mostrar mensaje de éxito
        toast.success(response.data.message);

        // Limpiar errores previos
        setErrores({});
        return true;
    } catch (error) {
        if (error.response && error.response.status === 422) {
            // Manejar errores de validación
            const erroresPorCampo = {};
            Object.keys(error.response.data.errors).forEach((campo) => {
                erroresPorCampo[campo] = error.response.data.errors[campo][0];
            });
            setErrores(erroresPorCampo);
        } else {
            // Manejar otros errores
            toast.error("Ocurrió un error inesperado.");
        }
        return false;
    }
};



const logout = async () => {   
    try{
        await clienteAxios.post('/api/logout',null,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
        localStorage.removeItem("token");
        await mutate(undefined);
        navigate('/');
        toast.success("Sesión cerrada exitosamente");

    }catch(error){
        throw Error(error?.response?.data?.errors)
    }
    
    

}


const obtenerUsuarios = async (page = 1) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await clienteAxios.get(`/api/users?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Error al obtener usuarios", error);
      alert("Hubo un problema al cargar los usuarios. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  


  const toggleEstadoUsuario = async (id, estadoActual) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de que deseas ${estadoActual === 3 ? 'desactivar' : 'activar'} este usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, estoy seguro',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await clienteAxios.put(`/api/users/${id}/estado`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast(response.data.message);
      obtenerUsuarios(pagination.current_page);
    } catch (error) {
      toast.error("Error al cambiar el estado del usuario", error);
      Swal.fire('Error', 'Hubo un problema al actualizar el estado del usuario.', 'error');
    }
  };


  useEffect(() => {
    // Si se está en modo "guest" y ya hay un usuario autenticado
    if (middleware === "guest" && user) {
      // Si el usuario es administrador, redirige a la ruta de administración,
      // de lo contrario, a la sección de procesos.
      const redirectUrl = user.role_id === 1 ? "/admin/users" : "/auth/procesos";
      navigate(redirectUrl);
      return;
    }
  
    // Para rutas protegidas (middleware "auth") y si hay un usuario autenticado:
    if (middleware === "auth" && user) {
      // Si el usuario NO es administrador, forzamos que use las rutas de /auth.
      if (user.role_id !== 1 && !location.pathname.startsWith("/auth")) {
        navigate("/auth/procesos");
        return;
      }
      // Para el administrador: No hacemos redirección automática.
      // Así, el administrador puede acceder a cualquier página que desee.
    }
  
    // Si hay algún error (por ejemplo, token inválido o expirado) en modo "auth",
    // redirige a la pantalla de login.
    if (middleware === "auth" && error) {
      navigate("/");
    }
  }, [middleware, user, error, location.pathname, navigate]);
  
  

const updateUsuario = async (userId, data,setErrores) => {
  console.log('updateUsuario este', userId, data);
  const token = localStorage.getItem('token');

  try {
    const response = await clienteAxios.put(`/api/users/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success(response.data.message);
    setErrores({});
    mutate(`/api/users?page=${pagination.current_page}`);
    return true;
    
  } catch (error) {
    console.error("Error al actualizar el usuario", error);
    
  }

  
     }

    return {
        login,
        register,
        logout,
        user,
        error,
        obtenerUsuarios,
        toggleEstadoUsuario,
        loading,
        users,
        pagination,
        updateUsuario


    }


}
;