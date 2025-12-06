import axios from "axios";
import clienteAxios from "../config/axios";


const apiClient = axios.create({
  baseURL: clienteAxios.defaults.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token de autorización a cada solicitud
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
//Interceptor para manejar respuestas y errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Manejar errores específicos según el código de estado
      if (error.response.status === 401) {
        // Por ejemplo, redirigir al usuario a la página de login si no está autorizado
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// Función para obtener todos los roles
export const obtenerPermisosApi={
    getAll:() => apiClient.get("/api/permissions"),
    getLoad:(id) => apiClient.get(`/api/user-permissions/${id}`),
    create:(data) => apiClient.post("/api/asignar-permisos-usuario", { user_id: data.user_id, permission_ids: data.permission_ids }),
}

//Crear Roles
export const crearRolApi={
    create:(data) => apiClient.post("/api/roles", { nombre: data.nombre }),
}

// Obtener todos los roles
export const obtenerRolesApi={
    getAll:() => apiClient.get("/api/roles"),
}

// Eliminar rol
export const eliminarRolApi={
    delete:(id) => apiClient.delete(`/api/roles/${id}`),
}

// Actualizar rol
export const actualizarRolApi={
    update:(id, data) => apiClient.put(`/api/roles/${id}`, { nombre: data.nombre }),
}