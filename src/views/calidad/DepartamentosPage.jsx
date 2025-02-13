


import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGestionProcesos } from '../../hooks/useGestionProcesos';
import { Link } from 'react-router-dom'; 


function DepartamentosPage() {
  const { macroprocesos, departamentos } = useGestionProcesos();
  

  const {user}=useAuth({middleware:"auth"})

  console.log(user)
   // Función para determinar si el usuario tiene acceso al departamento
   const tieneAcceso = (departamentoId) => {
    // Permite acceso total si el usuario es admin
    if (user?.role_id === 2 || user?.role_id===1) return true;

    // Permite acceso si el departamento del usuario coincide con el ID del departamento
    return user?.departamento_id === departamentoId;
  };



  return (<>
  
 
    <div className="p-6 bg-gray-50 min-h-screen">
    <h1 className="text-3xl font-bold text-gray-700 mb-6">Mapa de Procesos</h1>

    <div className="grid grid-cols-1 gap-12">
      {macroprocesos.map((macroproceso) => (
        <div key={macroproceso.id} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center uppercase">
            {macroproceso.nombre}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {departamentos
              .filter((dep) => dep.macroprocesos_id === macroproceso.id)
              .map((departamento) => {
                const autorizado = tieneAcceso(departamento.id);

                if (autorizado) {
                  return (
         
                    
                    <Link
                      key={departamento.id}
                      to={`/auth/procesos/${departamento.id}`} // Ruta a la página de procesos
                    >
                      <div className="p-4 bg-white shadow-md rounded-lg transition cursor-pointer hover:shadow-lg hover:scale-105 transform duration-300 flex flex-col items-center">
                        <h3 className="text-lg font-bold text-center">
                          {departamento.nombre}
                        </h3>
                        <div className="p-4">
                          <img
                            className="w-16 h-16 animate-bounce"
                            src={departamento.icono}
                            alt={departamento.nombre}
                          />
                        </div>
                        <p>{departamento.descripcion}</p>
  
                      </div>
                    </Link>

               
           
                  
                  );
                } else {
                  return (
                    <div
                      key={departamento.id}
                      className="p-4 bg-gray-200 shadow-md rounded-lg flex flex-col items-center"
                    >
                      <h3 className="text-lg font-bold text-center">
                        {departamento.nombre}
                      </h3>
                      <div className="p-4">
                        <img
                          className="w-16 h-16"
                          src={departamento.icono}
                          alt={departamento.nombre}
                        />
                      </div>
                      <p>{departamento.descripcion}</p>
                      <p className="text-red-500 mt-2">Acceso restringido</p>
                    </div>
                  );
                }
              })}
          </div>
        </div>
      ))}
    </div>
  </div>
 </>

    // <div className="p-6 bg-gray-50 min-h-screen">
    //   <h1 className="text-3xl font-bold text-gray-700 mb-6">Mapa de Procesos</h1>

    //   <div className="grid grid-cols-1 gap-12">
    //     {macroprocesos.map((macroproceso) => (
    //       <div key={macroproceso.id} className="mb-8">
    //         <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center uppercase">
    //           {macroproceso.nombre}
    //         </h2>

    //         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    //           {departamentos
    //             .filter((dep) => dep.macroprocesos_id === macroproceso.id)
    //             .map((departamento) => (
    //               <Link
    //                 key={departamento.id}
    //                 to={`/auth/procesos/${departamento.id}`} // ruta a la página de procesos
    //               >
    //                 <div className="p-4 bg-white shadow-md rounded-lg transition cursor-pointer hover:shadow-lg hover:scale-105 transform duration-300 flex flex-col items-center">
    //                   <h3 className="text-lg font-bold text-center">
    //                     {departamento.nombre}
    //                   </h3>
    //                   <div className="p-4">
    //                     <img
    //                       className="w-16 h-16 animate-bounce"
    //                       src={departamento.icono}
    //                       alt={departamento.nombre}
    //                     />
    //                   </div>
    //                   <p>{departamento.descripcion}</p>
    //                 </div>
    //               </Link>
    //             ))}
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
}

export default DepartamentosPage;

