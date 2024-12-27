import React from 'react'

export default function RegisterUsers() {
return (
    <form className="grid grid-cols-1 gap-6">
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" id="name" name="name" placeholder="Ingrese su nombre" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
        </div>
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input type="email" id="email" name="email" autoComplete="email" placeholder="Ingrese su correo electrónico" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
        </div>
        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" id="password" name="password" autoComplete="current-password" placeholder="Ingrese su contraseña" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
        </div>
        <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
            <select id="role" name="role" autoComplete="role" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option>Administrador</option>
                <option>Editor</option>
                <option>Invitado</option>
            </select>
        </div>
        <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" id="phone" name="phone" placeholder="Ingrese su teléfono" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
        </div>
        <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
            <select id="department" name="department" autoComplete="department" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option>Tecnología</option>
                <option>Gerencia</option>
                <option>HSQE</option>
                <option>Comercial</option>
                <option>Contabilidad</option>
            </select>
        </div>
        <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Registrar Usuario
            </button>
        </div>
    </form>
)
}
