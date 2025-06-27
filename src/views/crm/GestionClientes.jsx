import { useClientes } from "../../hooks/useClientes";
import * as XLSX from "xlsx";
import ClientesList from "./ClientesList";
import { useFormatoFecha } from "../../hooks/useFormatoFecha";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";


export default function GestionClientes() {

  const {user}=useAuth({middleware:'auth'});
   // …tus estados existentes
  const [excelError, setExcelError] = useState("");



const normaliza = (txt) =>
  txt
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")      // quita tildes
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_"); // espacios → guion bajo


  

const handleExcelChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const buffer    = await file.arrayBuffer();
    const workbook  = XLSX.read(buffer, { type: "array" });
    const sheet     = workbook.Sheets[workbook.SheetNames[0]];
  
const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });


    if (!rawRows.length) throw new Error("El archivo está vacío");

    // ⇨ aplica normalización a todas las claves

    // 1. Fuerza que XLSX devuelva strings
// 2. O, si prefieres raw:true, hazlo a mano:

const rows = rawRows.map(r => ({
  ...r,
  telefono: r.telefono ? String(r.telefono) : "",
  nit:      r.nit      ? String(r.nit)      : "",
}));
    const requeridos = ["nombre", "email", "telefono", "direccion", "nit"];
    const faltan     = requeridos.filter((c) => !(c in rows[0]));
    if (faltan.length) throw new Error(`Faltan columnas: ${faltan.join(", ")}`);

    /* ───────── envío al backend ───────── */
    const token = localStorage.getItem("token");
    await clienteAxios.post(
      "/api/clientes/importar-excel",
      { clientes: rows },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Clientes importados correctamente");
    setExcelError("");
  } catch (err) {
    console.error(err);
    setExcelError(
      err?.response?.data?.message ?? err.message ?? "Error en la importación"
    );
  }
};

    


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
{/* --- Carga masiva desde Excel ----------------------------------- */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Importar clientes desde Excel (.xlsx)
  </label>

  <input
    type="file"
    accept=".xlsx,.xls"
    onChange={handleExcelChange}
    className="block w-full text-sm text-gray-900
               file:mr-4 file:py-2 file:px-4
               file:rounded file:border-0
               file:text-sm file:font-semibold
               file:bg-green-50 file:text-green-700
               hover:file:bg-green-100"
  />

  {excelError && <p className="text-red-500 text-xs mt-1">{excelError}</p>}
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
