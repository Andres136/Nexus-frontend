import React from 'react'
import { useNavigate } from 'react-router-dom';
import { BriefcaseIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { departamentos } from '../../data/departamentos';
import { macroproceso } from '../../data/macroprocesos';
export default function ProcesosEstrategicos() {

       const navigate = useNavigate();
         // Datos estáticos de los departamentos con iconos
     
  return (
     <div className="bg-gray-50 py-10">
      <h2 className="text-center text-3xl font-bold text-gray-700 mb-7 animate-fade-in">
         {macroproceso[0].name}
      </h2>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 px-6 lg:px-20">
          {departamentos.map((department) => (
              <div
                  key={department.id}
                  className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition cursor-pointer hover:scale-105 transform duration-300"
                  onClick={() => navigate(`/auth/${department.macroproceso_id}/${department.id}`)}
              >
                  <div className="mb-4 animate-bounce">
                      {department.id === 1 && <BriefcaseIcon className="h-12 w-12 text-green-500 mx-auto" />}
                      {department.id === 2 && <ShieldCheckIcon className="h-12 w-12 text-blue-500 mx-auto" />}
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
