import { createRef, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";

export default function RegisterUsers({ onClose }) {
    const nameRef = createRef   ();
    const emailRef = createRef();
    const passwordRef = createRef();
    const role_idRef = createRef();
    const telefonoRef = createRef();
    const departamento_idRef = createRef();

    const [errores, setErrores] = useState({});
    const { register } = useAuth({ middleware: "guest" });

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
        };

        const success = await register(data, setErrores);
        if (success) {
            onClose(); // Cierra el modal en caso de éxito
        }
    };

    // Obtener departamentos y roles
    const obtenerDepartamentos = async () => {
        try {
            const response = await clienteAxios.get('/api/departamentos');
            setDepartamentos(response.data);
        } catch (error) {
            toast.error("No se pudieron cargar los departamentos.");
        }
    };

    const obtenerRoles = async () => {
        try {
            const response = await clienteAxios.get('/api/roles');
            setRoles(response.data);
        } catch (error) {
            toast.error("No se pudieron cargar los roles.");
        }
    };

    useEffect(() => {
        obtenerDepartamentos();
        obtenerRoles();
    }, []);

    return (
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
                {errores.name && <small className="text-red-500">{errores.name}</small>}
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
                {errores.email && <small className="text-red-500">{errores.email}</small>}
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
                {errores.password && <small className="text-red-500">{errores.password}</small>}
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
                {errores.role_id && <small className="text-red-500">{errores.role_id}</small>}
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
                {errores.telefono && <small className="text-red-500">{errores.telefono}</small>}
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
                {errores.departamento_id && <small className="text-red-500">{errores.departamento_id}</small>}
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
    );
}
