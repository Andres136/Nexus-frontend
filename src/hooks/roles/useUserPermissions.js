import { useEffect, useState } from "react";
import Swal from "sweetalert2";


import clienteAxios from "../../config/axios";
import { usersApi } from "../../services/api";
import { obtenerPermisosApi } from "../../services/Roles";

export default function useUserPermissions() {
  const [usuarios, setUsuarios] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPerms, setUserPerms] = useState([]);

  const token = localStorage.getItem("token");

  const headers = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // =========================
  // Cargar usuarios
  // =========================
  const loadUsuarios = async () => {
    try {
      const { data } = await usersApi.getUsers();
      setUsuarios(data.data || data);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    }
  };

  // =========================
  // Cargar permisos generales
  // =========================
  const loadPermisos = async () => {
    try {
      const { data } = await obtenerPermisosApi.getAll();
      setPermisos(data);
    } catch (error) {
      console.error("Error cargando permisos", error);
    }
  };

  // =========================
  // Cargar permisos del usuario
  // =========================
  const loadUserPerms = async (userId) => {
    try {
      const { data } = await obtenerPermisosApi.getLoad(userId);
      setUserPerms(data.permissions || []);
    } catch (error) {
      console.error("Error cargando permisos del usuario", error);
    }
  };

  // =========================
  // Cambiar check
  // =========================
  const togglePermiso = (path) => {
    setUserPerms((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  // Agregar / quitar todos
  const agregarTodos = () => setUserPerms(permisos.map((p) => p.path));
  const quitarTodos = () => setUserPerms([]);

  // =========================
  // Guardar asignación
  // =========================
  const guardar = async () => {
    try {
      if (!selectedUser) return;

      const permisosIds = permisos
        .filter((p) => userPerms.includes(p.path))
        .map((p) => p.id);

      await clienteAxios.post(
        "/api/asignar-permisos-usuario",
        {
          user_id: selectedUser,
          permission_ids: permisosIds,
        },
        headers
      );

      Swal.fire("Éxito", "Permisos asignados correctamente", "success");
    } catch (error) {
      console.error("Error asignando permisos:", error);
      Swal.fire("Error", "No se pudo asignar permisos", "error");
    }
  };

  // =========================
  // Cargar datos iniciales
  // =========================
  useEffect(() => {
    loadUsuarios();
    loadPermisos();
  }, []);

  return {
    usuarios,
    permisos,
    selectedUser,
    setSelectedUser,
    userPerms,
    loadUserPerms,
    togglePermiso,
    agregarTodos,
    quitarTodos,
    guardar,
  };
}
