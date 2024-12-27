import React from 'react'
import { useNavigate } from 'react-router-dom';
import {  ShieldCheckIcon } from '@heroicons/react/24/solid';
import { ChartBarIcon, ComputerDesktopIcon, PresentationChartLineIcon, UserGroupIcon} from '@heroicons/react/16/solid';
import useSystem from '../../hooks/useSystem';
export default function ProcesosApoyo() {

    const { darkMode, toggleDarkMode } = useSystem();
    const navigate = useNavigate();
    // Datos estáticos de los departamentos con iconos
 const departmentos = [
  {
    id: 1,
    macroproceso_id: 'PROCESOS DE APOYO',
    name: 'RECURSOS HUMANOS',
    description: 'Gestión del talento humano de la empresa.',
  
  },
  {
    id: 2,
    macroproceso_id: 'PROCESOS DE APOYO',
    name: 'MARKETING',
    description: 'Gestión de la imagen y comunicación de la empresa.',
   
  },
   {
  id: 3,
  macroproceso_id: 'PROCESOS DE APOYO',
  name: 'CONTABILIDAD',
  description: 'Control de los recursos financieros de la empresa.',
   },{
  id: 4,
  macroproceso_id: 'PROCESOS DE APOYO',
  name: 'TECNOLOGIA',
  description: 'Gestión de la infraestructura tecnológica de la empresa.',
   },
   {
  id: 5,
  macroproceso_id: 'PROCESOS DE APOYO',
  name: "JURIDICA",
  description: "Asesoramiento legal y cumplimiento normativo de la empresa."
   }
 ];
  return (
    <div className={"bg-gray-50 py-10"}>
    <h2 className="text-center text-3xl font-bold text-gray-700 mb-7 animate-fade-in">
        {departmentos[0].macroproceso_id}
    </h2>
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 px-6 lg:px-20">
        {departmentos.map((department) => (
            <div
                key={department.id}
                className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition cursor-pointer hover:scale-105 transform duration-300"
                onClick={() => navigate(`/auth/department/${department.id}`)}
            >
                <div className="mb-4 animate-bounce">
                    {department.id === 1 && <UserGroupIcon className="h-12 w-12 text-green-500 mx-auto" />}
                    {department.id === 2 && <PresentationChartLineIcon className="h-12 w-12 text-blue-500 mx-auto" />}
                    {department.id === 3 && <ChartBarIcon className="h-12 w-12 text-yellow-500 mx-auto" />}
                    {department.id === 4 && <ComputerDesktopIcon className="h-12 w-12 text-gray-500 mx-auto" />}
                    {department.id === 5 && <ShieldCheckIcon className="h-12 w-12 text-gray-500 mx-auto" />}
                </div>
                <h3 className="text-xl font-bold text-gray-700 text-center mb-2">
                    {department.name}
                </h3>
                <p className="text-gray-500 text-center">{department.description}</p>
            </div>
        ))}
    </div>
</div>
  )
}
