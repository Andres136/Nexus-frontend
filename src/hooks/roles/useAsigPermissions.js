import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import Swal from "sweetalert2";



export default function useAsigPermissions() {
  // Aquí va la lógica del hook personalizado

const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePerms, setRolePerms] = useState([]);

  const token = localStorage.getItem("token");

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  // Cargar roles
  const loadRoles = async () => {
    const { data } = await clienteAxios.get("/api/roles", headers);
    setRoles(data);
  };

  // Cargar permisos almacenados
  const loadPermisos = async () => {
    const { data } = await clienteAxios.get("/api/permissions", headers);
    setPermisos(data);
  };

  // Cargar permisos del rol seleccionado
  const loadRolePerms = async (roleId) => {
    const { data } = await clienteAxios.get(`/api/roles/${roleId}/permisos`, headers);
    setRolePerms(data);
  };

  useEffect(() => {
    loadRoles();
    loadPermisos();
  }, []);

  // Alternar permiso
  const togglePermiso = (permId) => {
    setRolePerms((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  // Agregar todos
  const agregarTodos = () => {
    if (permisos.length > 0) {
      setRolePerms(permisos.map((p) => p.id));
    }
  };

  // Quitar todos
  const quitarTodos = () => {
    setRolePerms([]);
  };

  // Guardar en el backend
  const guardar = async () => {
    try {
      const response = await clienteAxios.post(
        "/api/roles/asignar-permisos",
        {
          role_id: selectedRole,
          permission_ids: rolePerms
        },
        headers
      );

      if (response.status === 200) {
        Swal.fire("Éxito", "Permisos asignados correctamente", "success");
      }
    } catch (error) {
      console.error("Error al asignar permisos", error);
      Swal.fire("Error", "No se pudo asignar permisos", "error");
    }
  };

    return {   roles,
         permisos, selectedRole, setSelectedRole, rolePerms, loadRolePerms, togglePermiso, agregarTodos, quitarTodos, guardar,setRolePerms };

}

