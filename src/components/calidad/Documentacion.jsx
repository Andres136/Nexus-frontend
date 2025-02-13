import { useGestionProcesos } from "../../hooks/useGestionProcesos"

export default function Documentacion({}) {

  const{
    documentacion,
    procesoActual,
    formatDate
  }=useGestionProcesos()
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold mb-4 text-gray-800">Documentacion del Proceso: {procesoActual?.nombre || 'No har procesos'}</h3>
    {documentacion.length > 0 ? (
      <ul className="space-y-4">
        {documentacion.map((doc) => (
          <li
            key={doc.id}
            className="p-4 bg-gray-100 shadow-sm rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-lg text-gray-700">{doc.nombre}</p>
              <p className="text-gray-500">Versión: {doc.version}</p>
              <p className="text-gray-500">Subido por: {doc.usuarios.name}</p>
              <p className="text-gray-500">
                Fecha de subida: {formatDate(doc.created_at)}
              </p>
            </div>
            <a
              href={`http://127.0.0.1:8000/api/documentos/descargar/${doc.id}`}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Descargar
            </a>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">No hay documentación disponible.</p>
    )}
  </div>
  )
}
