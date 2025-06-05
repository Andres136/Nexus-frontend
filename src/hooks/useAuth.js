import useSWR from "swr";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const useAuth = ({ middleware, url }) => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const {
    data: user,
    error,
    mutate,
  } = useSWR( token ? "/api/user":null, () =>
    clienteAxios("/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.data)
      .catch((error) => {
        throw Error(error?.response?.data?.errors);
      })
  );

  const login = async (data, setErrores) => {
    try {
      const response = await clienteAxios.post("/api/login", data);
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
  };
  const register = async (data, setErrores) => {
    try {
      // 1. Construimos el objeto de configuración de Axios
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Sólo si data es FormData, le ponemos multipart
          ...(data instanceof FormData 
            ? { "Content-Type": "multipart/form-data" } 
            : {}
          )
        },
      };
  
      // 2. Envío
      const response = await clienteAxios.post("/api/users", data, config);
  
      // 3. Éxito
      toast.success(response.data.message);
      setErrores({});
      return true;
  
    } catch (error) {
      if (error.response?.status === 422) {
        // Validación
        const erroresPorCampo = {};
        for (const campo in error.response.data.errors) {
          erroresPorCampo[campo] = error.response.data.errors[campo][0];
        }
        setErrores(erroresPorCampo);
      } else {
        toast.error("Ocurrió un error inesperado.");
      }
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await clienteAxios.post("/api/logout", null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem("token");
      await mutate(undefined);
      navigate("/");
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      throw Error(error?.response?.data?.errors);
    }
  };

  const obtenerUsuarios = async (page = 1, search = "") => {
    setLoading(true);
    const token = localStorage.getItem("token");
  
    try {
      const response = await clienteAxios.get(`/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          search,
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
      title: `¿Estás seguro de que deseas ${
        estadoActual === 3 ? "desactivar" : "activar"
      } este usuario?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, estoy seguro",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.put(
        `/api/users/${id}/estado`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast(response.data.message);
      obtenerUsuarios(pagination.current_page);
    } catch (error) {
      toast.error("Error al cambiar el estado del usuario", error);
      Swal.fire(
        "Error",
        "Hubo un problema al actualizar el estado del usuario.",
        "error"
      );
    }
  };

  useEffect(() => {
    if (middleware === "guest" && user) {
      // Definir las rutas según los roles de usuario
      const roleRedirects = {
        1: "/admin/users", // Administrador
        2: "/auth/procesos", // HSEQ
        3: "/auth/procesos", // Invitado
        4: "/auth/crm", // Administrativo
        5: "/auth/crm", // Compras
        6: "/auth/crm", // Inventario
        7: "/auth/crm", // Comercial
        8: "/auth/crm", // Transporte
        9: "/auth/crm", // Ejecutivo Comercial
      };

      const redirectUrl = roleRedirects[user.role_id] || "/auth/procesos";
      navigate(redirectUrl);
      return;
    }

    if (middleware === "auth" && user) {
      // 🔹 Si el usuario es ADMINISTRADOR, no hacer redirección
      if (user.role_id === 1) return;

      // 🔹 Si el usuario NO es admin y está fuera de /auth, redirigir
      if (!location.pathname.startsWith("/auth")) {
        navigate("/auth/procesos");
        return;
      }
    }

    if (middleware === "auth" && error) {
      navigate("/");
    }
  }, [middleware, user, error, location.pathname, navigate]);

  // Función para actualizar un usuario
  const updateUsuario = async (userId, data, setErrores) => {
    const token = localStorage.getItem("token");
    const isForm = data instanceof FormData;
  
    try {
      const response = await clienteAxios[ isForm ? "post" : "put" ](
        `/api/users/${userId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(isForm 
              ? { "Content-Type": "multipart/form-data" } 
              : {}
            )
          }
        }
      );
  
      toast.success(response.data.message);
      setErrores({});
      mutate(`/api/users?page=${pagination.current_page}`);
      return true;
    } catch (error) {
      if (error.response?.status === 422) {
        console.log(error.response.data.errors);
        const errs = {};
        Object.entries(error.response.data.errors)
              .forEach(([f, msgs])=> errs[f]=msgs[0]);
        setErrores(errs);
      } else {
        toast.error("Error al actualizar usuario.");
      }
      return false;
    }
  };
  
  

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
    updateUsuario,
  };
};
