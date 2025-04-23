import { useClientes } from "../../hooks/useClientes";

import ClientesList from "./ClientesList";
import { useFormatoFecha } from "../../hooks/useFormatoFecha";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";


export default function GestionClientes() {

  const {user}=useAuth({middleware:'auth'});
 

  const {
    registrarCliente,
    nombreRef,
    emailRef,
    telefonoRef,
    direccionRef,
    nitRef,
    error,
  
  } = useClientes();

  const [isOpen, setIsOpen] = useState(false);



  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
    <div className="grid grid-cols-1 ">

   
      <div className="">
   
          <button
            className="w-full flex justify-between items-center bg-green-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-all duration-300"
            onClick={toggleAccordion}
            aria-expanded={isOpen}
            aria-label={
              isOpen
                ? "Cerrar formulario de cliente"
                : "Abrir formulario de cliente"
            }
          >
            <span>{isOpen ? "Cerrar Formulario" : "Registrar Cliente"}</span>

            {/* Ícono animado */}
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (


             
            <form
              action=""
              onSubmit={registrarCliente}
              className="mt-4 bg-white p-4 rounded-md shadow-md"
            >

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="mb-4">
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Nombre"
                  name="nombre"
                  id="nombre"
                  ref={nombreRef}
                  autoComplete="given-name"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                {error.nombre && (
                  <span className="text-red-500">{error.nombre}</span>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  id="email"
                  ref={emailRef}
                  autoComplete="family-name"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                {error.email && (
                  <span className="text-red-500">{error.email}</span>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="Teléfono"
                  name="telefono"
                  id="telefono"
                  ref={telefonoRef}
                  autoComplete="tel"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                {error.telefono && (
                  <span className="text-red-500">{error.telefono}</span>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="direccion"
                  className="block text-sm font-medium text-gray-700"
                >
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Dirección"
                  name="direccion"
                  id="direccion"
                  ref={direccionRef}
                  autoComplete="address"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                {error.direccion && (
                  <span className="text-red-500">{error.direccion}</span>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="ciudad"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nit o Cedula
                </label>
                <input
                  type="text"
                  placeholder="Nit o Cedula"
                  name="nit"
                  id="nit"
                  ref={nitRef}
                  autoComplete="address"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                {error.nit && <span className="text-red-500">{error.nit}</span>}
              </div>
</div>
              <button className="w-full bg-green-700 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                <span>Guardar</span>
              </button>
            </form>
          )}

          <div className="mt-4 gap-3">
            <h2 className="text-3xl font-bold text text-gray-800">
              Gestionar Clientes
            </h2>
          </div>
    

       
      </div>

      <ClientesList/>
      </div>
    </>
  );
}
