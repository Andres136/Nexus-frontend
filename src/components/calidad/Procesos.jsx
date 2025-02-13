import { useEffect } from "react";
import { useGestionProcesos } from "../../hooks/useGestionProcesos"
import { useParams } from "react-router-dom";

export default function Procesos() {

const { departamentoId } = useParams();
    const {
        procesos,
        cargarDocumentacion,
        cargarProcesos,
      
  
    }= useGestionProcesos()

useEffect(() => {
    if (departamentoId) {
      cargarProcesos(departamentoId);
    }
    // eslint-disable-next-line
  }, [departamentoId]);
  return (
    <div>     
        
        
         {procesos.length > 0 ? (
        <ul className="space-y-4">
          {procesos.map((proceso) => (
            <li
              key={proceso.id}
              className="p-4 bg-gray-100 shadow-sm rounded-lg flex justify-between items-center"
            >
              <p className="font-bold text-gray-700">{proceso.nombre}</p>
              <button
                onClick={() => cargarDocumentacion(proceso.id)}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
              >
                Ver Documentación
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay procesos registrados.</p>
      )}</div>
  )
}
