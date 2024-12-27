import React from 'react'
import { useNavigate } from 'react-router-dom';
import { BriefcaseIcon, ShieldCheckIcon, CogIcon } from '@heroicons/react/24/solid';
import { ArchiveBoxIcon, ShoppingCartIcon, TruckIcon } from '@heroicons/react/16/solid';
export default function ProcesosMisionales() {

    const navigate = useNavigate();
    // Datos estáticos de los departamentos con iconos
 const departmentos = [
   {
     id: 1,
     name: 'COMERCIAL',
     macroproceso_id: 'PROCESOS MISIONALES',
     description: 'Gestión de las ventas y el mercadeo de la empresa.',

   },
   {
     id: 2,
     name: 'INVETARIOS',
        macroproceso_id: 'PROCESOS MISIONALES',
     description: 'Gestión de los productos y materiales de la empresa.',
 
   },
   {
    id: 3,
   macroproceso_id: 'PROCESOS MISIONALES',
    name: 'TRANSPORTE',
    description: 'Gestión de la logística y distribución de la empresa.',
   }
   
   
 ];
return (
    <div className="bg-gray-50 py-10">
        <h2 className="text-center text-3xl font-bold text-gray-700 mb-7 animate-fade-in">
           {departmentos[0].macroproceso_id}
        </h2>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-6 lg:px-20">
            {departmentos.map((department) => (
                <div
                    key={department.id}
                    className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition cursor-pointer hover:scale-105 transform duration-300"
                    onClick={() => navigate(`/auth/department/${department.id}`)}
                >
                    <div className="mb-4 animate-bounce">
                        {department.id === 1 && <ShoppingCartIcon className="h-12 w-12 text-green-500 mx-auto" />}
                        {department.id === 2 && < ArchiveBoxIcon className="h-12 w-12 text-blue-500 mx-auto" />}
                        {department.id === 3 && <TruckIcon className="h-12 w-12 text-yellow-500 mx-auto" />}
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
