import React from 'react'
import { PencilIcon,TrashIcon } from '@heroicons/react/16/solid';
import useSystem from '../hooks/useSystem';


export default function TableUsers() {

  const { darkMode, toggleDarkMode } = useSystem();
    // Datos estáticos para la tabla
  const data = [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan.perez@example.com",
      phone: "123456789",
      role: "Administrador",
      department: "Ventas",
    },
    {
      id: 2,
      name: "María Gómez",
      email: "maria.gomez@example.com",
      phone: "987654321",
      role: "Usuario",
      department: "Recursos Humanos",
    },
    {
      id: 3,
      name: "Carlos López",
      email: "carlos.lopez@example.com",
      phone: "456789123",
      role: "Supervisor",
      department: "Producción",
    },
  ];
  return (
<div className="overflow-x-auto">
      <table className={ darkMode ? "bg-gray-800 text-white p-4 table-auto w-full border-collapse " : "bg-white text-gray-900 shadow-md p-4  table-auto w-full border-collapse border border-gray-300 bg-white rounded-md shadow-md"}>
        <thead>
          <tr className={darkMode ? " bg-gray-800 text-white p-4" : "bg-white text-gray-900 shadow-md bg-gray-100  "}>
            <th className="border border-gray-300 px-4 py-2">Editar</th>
            <th className="border border-gray-300 px-4 py-2">Eliminar</th>
            <th className="border border-gray-300 px-4 py-2">Nombre</th>
            <th className="border border-gray-300 px-4 py-2">Correo</th>
            <th className="border border-gray-300 px-4 py-2">Teléfono</th>
            <th className="border border-gray-300 px-4 py-2">Rol</th>
            <th className="border border-gray-300 px-4 py-2">Departamento</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {/* Botón Editar */}
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  className="flex items-center bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={() => alert(`Editar registro de: ${row.name}`)}
                >
                  <PencilIcon className="h-5 w-5 mr-1" />
                  Editar
                </button>
              </td>
              {/* Botón Eliminar */}
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => alert(`Eliminar registro de: ${row.name}`)}
                >
                  <TrashIcon className="h-5 w-5 mr-1" />
                  Eliminar
                </button>
              </td>
              {/* Datos */}
              <td className="border border-gray-300 px-4 py-2">{row.name}</td>
              <td className="border border-gray-300 px-4 py-2">{row.email}</td>
              <td className="border border-gray-300 px-4 py-2">{row.phone}</td>
              <td className="border border-gray-300 px-4 py-2">{row.role}</td>
              <td className="border border-gray-300 px-4 py-2">{row.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
