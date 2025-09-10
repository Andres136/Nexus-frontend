import { useEffect, useRef, useState, useId } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import { useSedes } from "../../hooks/useSedes";
import Select from 'react-select';

export default function UpdateUser({ onClose, userId }) {
  // IDs únicos por instancia del componente
  const uid = useId();
  const nameId = `${uid}-name`;
  const emailId = `${uid}-email`;
  const passId = `${uid}-password`;
  const roleId = `${uid}-role`;
  const telId = `${uid}-telefono`;
  const depId = `${uid}-departamento`;
  const imgId = `${uid}-imagen`;

  // Refs
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const role_idRef = useRef(null);
  const telefonoRef = useRef(null);
  const departamento_idRef = useRef(null);
  const imagenRef = useRef(null);

  const [errores, setErrores] = useState({});
  const { users, updateUsuario, obtenerUsuarios } = useAuth({ middleware: "guest" });
  const [departamentos, setDepartamentos] = useState([]);
  const [roles, setRoles] = useState([]);

  const { sedes } = useSedes();
  const [sede, setSede] = useState(null);
  const sedeInputId = useId();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!sede?.value){
      setErrores(prev => ({ ...prev, sede_id: "Seleccione una sede" }));
    }
    setErrores({});
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", nameRef.current.value);
    formData.append("email", emailRef.current.value);
    formData.append("sede_id", sede?.value);
    if (passwordRef.current.value) {
      formData.append("password", passwordRef.current.value);
      formData.append("password_confirmation", passwordRef.current.value);
    }
    formData.append("role_id", role_idRef.current.value);
    formData.append("telefono", telefonoRef.current.value);
    formData.append("departamento_id", departamento_idRef.current.value);
    if (imagenRef.current.files[0]) formData.append("imagen", imagenRef.current.files[0]);

    const ok = await updateUsuario(userId, formData, setErrores);
    if (ok) onClose();
  };

  const obtenerDepartamentos = async () => {
    try {
      const { data } = await clienteAxios.get("/api/departamentos");
      setDepartamentos(data);
    } catch { toast.error("No se pudieron cargar los departamentos."); }
  };
  const obtenerRoles = async () => {
    try {
      const { data } = await clienteAxios.get("/api/roles");
      setRoles(data);
    } catch { toast.error("No se pudieron cargar los roles."); }
  };
  const obtenerUsuarioPorId = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await clienteAxios.get(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (e) { console.error("Error al obtener el usuario por ID", e); return null; }
  };

  useEffect(() => {
    let usuario = users.find((u) => u.id === userId);
    const cargar = async () => {
      if (!usuario) usuario = await obtenerUsuarioPorId();
      if (usuario) {
        if (nameRef.current) nameRef.current.value = usuario.name ?? "";
        if (emailRef.current) emailRef.current.value = usuario.email ?? "";
        if (telefonoRef.current) telefonoRef.current.value = usuario.telefono ?? "";
        if (role_idRef.current) role_idRef.current.value = usuario.role_id ?? "";
        if (departamento_idRef.current) departamento_idRef.current.value = usuario.departamento_id ?? "";
        if (usuario.sede_id && sedes) {
          const sedeUsuario = sedes.find(s => s.id === usuario.sede_id);
          if (sedeUsuario) setSede({ value: sedeUsuario.id, label: sedeUsuario.nombre });
        }
      }
    };
    cargar();
    obtenerDepartamentos();
    obtenerRoles();
  }, [users, userId]);

  useEffect(() => { obtenerUsuarios(); /* eslint-disable-next-line */ }, [errores]);

  return (
    <div className="p-4 w-full">
      <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit} noValidate>

        {/* Nombre */}
        <div>
          <label htmlFor={nameId} className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text" id={nameId} name="name" ref={nameRef}
            placeholder="Ingrese su nombre"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        {/* Correo */}
        <div>
          <label htmlFor={emailId} className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
          <input
            type="email" id={emailId} name="email" ref={emailRef}
            placeholder="Ingrese su correo electrónico"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor={passId} className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password" id={passId} name="password" ref={passwordRef}
            placeholder="Ingrese su contraseña"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        {/* Rol */}
        <div>
          <label htmlFor={roleId} className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            id={roleId} name="role_id" ref={role_idRef}
            className="mt-1 block w-full h-10 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue=""
          >
            <option value="" disabled>Seleccionar un rol</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>{rol.nombre}</option>
            ))}
          </select>
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor={telId} className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel" id={telId} name="telefono" ref={telefonoRef}
            placeholder="Ingrese su teléfono"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full h-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        {/* Departamento */}
        <div>
          <label htmlFor={depId} className="block text-sm font-medium text-gray-700">Departamento</label>
          <select
            id={depId} name="departamento_id" ref={departamento_idRef}
            className="mt-1 block w-full h-10 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue=""
          >
            <option value="" disabled>Seleccione un departamento</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </div>

        {/* Imagen */}
        <div>
          <label htmlFor={imgId} className="block text-sm font-medium text-gray-700">Foto</label>
          <input
            type="file" id={imgId} name="imagen" accept="image/*" ref={imagenRef}
            className="mt-1 block w-full text-sm text-gray-700"
          />
          {errores.imagen && <small className="text-red-500">{errores.imagen}</small>}
        </div>

        <div>
          <label htmlFor={sedeInputId} className="block text-sm font-medium text-gray-700">
            Sede
          </label>
          <Select
            inputId={sedeInputId}                 // asocia el label
            name="sede_id"
            options={(sedes ?? []).map(s => ({ value: s.id, label: s.nombre }))}
            value={sede}                          // controlado
            onChange={setSede}                    // guarda {value,label}
            className="mt-1"
          />
          {errores.sede_id && <small className="text-red-500">{errores.sede_id}</small>}
        </div>

        <div>
          <button type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Guardar Datos
          </button>
        </div>
      </form>
    </div>
  );
}
