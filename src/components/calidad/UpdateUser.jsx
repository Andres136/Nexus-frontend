import { useEffect, useRef, useState, useId } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import { useSedes } from "../../hooks/useSedes";
import Select from 'react-select';
import PropTypes from "prop-types";

export default function UpdateUser({ onClose, userId }) {
  // IDs únicos por instancia del componente
  const uid = useId();
  const nameId = `${uid}-name`;
  const apellidosId = `${uid}-apellidos`;
  const emailId = `${uid}-email`;
  const passId = `${uid}-password`;
  const roleId = `${uid}-role`;
  const telId = `${uid}-telefono`;
  const depId = `${uid}-departamento`;
  const imgId = `${uid}-imagen`;

  // Refs
  const nameRef = useRef(null);
  const apellidosRef = useRef(null);
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
    formData.append("apellidos", apellidosRef.current.value);
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
        if (apellidosRef.current) apellidosRef.current.value = usuario.apellidos ?? "";
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

  // Estilos personalizados para react-select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
      '&:hover': { borderColor: '#6366f1' },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#e0e7ff' : 'white',
    }),
  };

  const inputClasses = "mt-1 block w-full h-11 px-4 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm";
  const selectClasses = "mt-1 block w-full h-11 py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm cursor-pointer";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="p-6 w-full max-w-2xl mx-auto">
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        
        {/* Sección: Información Personal */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información Personal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre */}
            <div>
              <label htmlFor={nameId} className={labelClasses}>Nombre</label>
              <input
                type="text" id={nameId} name="name" ref={nameRef}
                placeholder="Ingrese su nombre"
                className={inputClasses}
              />
              {errores.name && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span>⚠</span>{errores.name}</p>}
            </div>

            {/* Apellidos */}
            <div>
              <label htmlFor={apellidosId} className={labelClasses}>Apellidos</label>
              <input
                type="text" id={apellidosId} name="apellidos" ref={apellidosRef}
                placeholder="Ingrese sus apellidos"
                className={inputClasses}
              />
              {errores.apellidos && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span>⚠</span>{errores.apellidos}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor={telId} className={labelClasses}>Teléfono</label>
              <input
                type="tel" id={telId} name="telefono" ref={telefonoRef}
                placeholder="Ingrese su teléfono"
                className={inputClasses}
              />
              {errores.telefono && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span>⚠</span>{errores.telefono}</p>}
            </div>
          </div>

          {/* Correo - ancho completo */}
          <div>
            <label htmlFor={emailId} className={labelClasses}>Correo Electrónico</label>
            <input
              type="email" id={emailId} name="email" ref={emailRef}
              placeholder="correo@ejemplo.com"
              className={inputClasses}
            />
            {errores.email && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span>⚠</span>{errores.email}</p>}
          </div>
        </div>

        {/* Sección: Seguridad */}
        <div className="bg-amber-50 rounded-xl p-5 space-y-5 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Seguridad
          </h3>
          
          <div>
            <label htmlFor={passId} className={labelClasses}>Nueva Contraseña</label>
            <input
              type="password" id={passId} name="password" ref={passwordRef}
              placeholder="Dejar vacío para mantener la actual"
              className={`${inputClasses} bg-white`}
            />
            <p className="mt-1 text-xs text-gray-500">Solo complete si desea cambiar la contraseña</p>
            {errores.password && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span>⚠</span>{errores.password}</p>}
          </div>
        </div>

        {/* Sección: Organización */}
        <div className="bg-indigo-50 rounded-xl p-5 space-y-5 border border-indigo-200">
          <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Organización
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Rol */}
            <div>
              <label htmlFor={roleId} className={labelClasses}>Rol</label>
              <select id={roleId} name="role_id" ref={role_idRef} className={selectClasses} defaultValue="">
                <option value="" disabled>Seleccionar un rol</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                ))}
              </select>
              {errores.role_id && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span>⚠</span>{errores.role_id}</p>}
            </div>

            {/* Departamento */}
            <div>
              <label htmlFor={depId} className={labelClasses}>Departamento</label>
              <select id={depId} name="departamento_id" ref={departamento_idRef} className={selectClasses} defaultValue="">
                <option value="" disabled>Seleccione un departamento</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
              {errores.departamento_id && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span>⚠</span>{errores.departamento_id}</p>}
            </div>
          </div>

          {/* Sede */}
          <div>
            <label htmlFor={sedeInputId} className={labelClasses}>Sede</label>
            <Select
              inputId={sedeInputId}
              name="sede_id"
              options={(sedes ?? []).map(s => ({ value: s.id, label: s.nombre }))}
              value={sede}
              onChange={setSede}
              placeholder="Seleccione una sede..."
              styles={selectStyles}
              className="mt-1"
            />
            {errores.sede_id && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><span>⚠</span>{errores.sede_id}</p>}
          </div>
        </div>

        {/* Sección: Foto de Perfil */}
        <div className="bg-white rounded-xl p-5 border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
          <label htmlFor={imgId} className="cursor-pointer block">
            <div className="flex flex-col items-center justify-center py-4">
              <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-gray-700">Foto de Perfil</p>
              <p className="text-xs text-gray-500 mt-1">Clic para seleccionar una imagen</p>
            </div>
            <input
              type="file" id={imgId} name="imagen" accept="image/*" ref={imagenRef}
              className="hidden"
            />
          </label>
          {errores.imagen && <p className="mt-2 text-sm text-red-500 text-center flex items-center justify-center gap-1"><span>⚠</span>{errores.imagen}</p>}
        </div>

        {/* Botón Submit */}
        <div className="pt-2">
          <button type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}

UpdateUser.propTypes = {
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
