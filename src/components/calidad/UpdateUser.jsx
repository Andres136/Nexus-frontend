import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";

export default function UpdateUser({ onClose, userId }) {

  // Usamos useRef para mantener la referencia entre renderizados
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const role_idRef = useRef(null);
  const telefonoRef = useRef(null);
  const departamento_idRef = useRef(null);

  const [errores, setErrores] = useState({});
  const { users, updateUsuario, obtenerUsuarios } = useAuth({ middleware: "guest" });
  console.log("Usuarios:", users);

  const [departamentos, setDepartamentos] = useState([]);
  const [roles, setRoles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      role_id: parseInt(role_idRef.current.value),
      telefono: telefonoRef.current.value,
      departamento_id: parseInt(departamento_idRef.current.value),
      estado_id: 1,
    };

    const success = await updateUsuario(userId, data, setErrores);
    if (success) {
      onClose(); // Cierra el modal en caso de éxito
    }
  };

  // Funciones para obtener departamentos y roles
  const obtenerDepartamentos = async () => {
    try {
      const response = await clienteAxios.get("/api/departamentos");
      setDepartamentos(response.data);
    } catch (error) {
      toast.error("No se pudieron cargar los departamentos.");
    }
  };

  const obtenerRoles = async () => {
    try {
      const response = await clienteAxios.get("/api/roles");
      setRoles(response.data);
    } catch (error) {
      toast.error("No se pudieron cargar los roles.");
    }
  };

  // Función para obtener los datos del usuario por ID (en caso de que no se encuentre en la lista paginada)
  const obtenerUsuarioPorId = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await clienteAxios.get(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // Asegúrate de que esta respuesta tenga la estructura esperada
    } catch (error) {
      console.error("Error al obtener el usuario por ID", error);
      return null;
    }
  };

  useEffect(() => {
    // Buscar el usuario en la lista paginada
    let usuario = users.find((user) => user.id === userId);
    console.log("Usuario encontrado en la lista:", usuario);

    // Si no se encontró, lo buscamos de forma individual
    const cargarDatos = async () => {
      if (!usuario) {
        usuario = await obtenerUsuarioPorId();
      }
      if (usuario) {
        if (nameRef.current) nameRef.current.value = usuario.name || "";
        if (emailRef.current) emailRef.current.value = usuario.email || "";
        if (telefonoRef.current) telefonoRef.current.value = usuario.telefono || "";
        if (role_idRef.current) role_idRef.current.value = usuario.role_id || "";
        if (departamento_idRef.current) departamento_idRef.current.value = usuario.departamento_id || "";
      }
    };

    cargarDatos();
    obtenerDepartamentos();
    obtenerRoles();
  }, [users, userId]);

  // Cada vez que cambien los errores, se reobtienen los usuarios (esto actualiza la lista si es necesario)
  useEffect(() => {
    obtenerUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errores]);

  return (
    <div className="p-4 w-full">
      <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          id="name"
          name="name"
          ref={nameRef}
          placeholder="Ingrese su nombre"
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo Electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          ref={emailRef}
          placeholder="Ingrese su correo electrónico"
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          ref={passwordRef}
          placeholder="Ingrese su contraseña"
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Rol
        </label>
        <select
          id="role_id"
          name="role_id"
          ref={role_idRef}
          className="mt-1 block w-full h-10 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option>Seleccionar un rol</option>
          {roles.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {rol.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          ref={telefonoRef}
          placeholder="Ingrese su teléfono"
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="departamento_id" className="block text-sm font-medium text-gray-700">
          Departamento
        </label>
        <select
          id="departamento_id"
          name="departamento_id"
          ref={departamento_idRef}
          className="mt-1 block w-full h-10 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option>Seleccione un departamento</option>
          {departamentos.map((departamento) => (
            <option key={departamento.id} value={departamento.id}>
              {departamento.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Guardar Datos
        </button>
      </div>
    </form>
    </div>
  );
}
