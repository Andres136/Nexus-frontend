import { useParams } from "react-router-dom"
import { createRef, useState} from "react"
import clienteAxios from "../../config/axios"
import { toast } from "react-toastify"
import { useAuth } from "../../hooks/useAuth"




export default function EstrategicosGerencia() {
const {id} = useParams();
const {user} = useAuth({middleware: 'auth'});
console.log(user);


const [nombreProceso, setNombreProceso] = useState("");
const nombreRef = createRef();
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = {
    nombre: nombreRef.current.value,
    departamento_id: id,
    user_id: user.id
  }
  console.log(data);
}

  return (
    
<div className="bg-gray-50 min-h-screen p-6">
  {/* Formulario como Encabezado */}

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >

    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
    <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Registrar un nuevo Proceso</h2>
    <form  onSubmit={handleSubmit} noValidate>
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Nombre del Proceso</label>
        <input
          type="text"
          id="nombre"
          placeholder="Nombre del Proceso"
          ref={nombreRef}
          className="w-full p-3 border rounded-lg focus:ring focus:ring-green-300"
        />

      </div>
      <div className="text-right">
        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Registrar Proceso
        </button>
      </div>
    </form>
  </div>
  </div>

  

  {/* Tablas en un Grid de 2 Columnas */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Tabla 1 */}
    <div className="bg-white shadow-lg rounded-lg p-4">
      <h3 className="text-lg font-bold text-gray-700 mb-4">Procesos</h3>
      <div className="overflow-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Id</th> 
               <th className="border border-gray-300 px-4 py-2">Departamento</th>
              <th className="border border-gray-300 px-4 py-2">Nombre de Proceso</th>
              <th className="border border-gray-300 px-4 py-2">Subir Archivo</th>
              <th className="border border-gray-300 px-4 py-2">Registrar Errores</th>
              <th className="border border-gray-300 px-4 py-2">Asignar Tarea</th>
           
            
            </tr>
          </thead>
          <tbody>
            {/* Contenido dinámico */}
          </tbody>
        </table>
      </div>
    </div>

    {/* Tabla 2 */}
    <div className="bg-white shadow-lg rounded-lg p-4">
      <h3 className="text-lg font-bold text-gray-700 mb-4">Documentacion: Proceso</h3>
      <div className="overflow-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Id</th>
              <th className="border border-gray-300 px-4 py-2">Usuario</th>
              <th className="border border-gray-300 px-4 py-2">Nombre Documento</th>
              <th className="border border-gray-300 px-4 py-2">Version</th>
              <th className="border border-gray-300 px-4 py-2">Fecha de Creacion</th>
              <th className="border border-gray-300 px-4 py-2">Descargar</th>
            </tr>
          </thead>
          <tbody>
            {/* Contenido dinámico */}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>



  
  )

}