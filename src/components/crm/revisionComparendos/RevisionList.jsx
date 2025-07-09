import React, { useEffect, useState } from 'react'
import clienteAxios from '../../../config/axios';
import { se } from 'date-fns/locale';

export default function RevisionList({conductorId, refresh}) {
    // Aquí podrías implementar la lógica para obtener y mostrar la lista de revisiones
    console.log('Conductor ID:', conductorId); // Para depuración
    const [revisiones, setRevisiones]=useState([]); // Estado para almacenar las revisiones
    const [loading, setLoading] = useState(false); // Estado para manejar la carga
    const [pagina, setPagina] = useState(1); // Estado para manejar la paginación
    const [lastPage, setLastPage] = useState(1); // Estado para manejar la última página
   const [nombreConductor, setNombreConductor] = useState(''); // Estado para manejar el nombre del conductorº

    const obtenerRevisiones = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await clienteAxios.get(`/api/revision-comparendos/conductor/${conductorId}?page=${pagina}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
       // console.log('Revisiones obtenidas:', response); // Para depuración
        setRevisiones(response.data.data); // Actualiza el estado con las revisiones obtenidas
        // Si hay datos, tomamos el nombre del primer registro
if (response.data.data.length > 0) {
  const user = response.data.data[0].conductor?.user;
  setNombreConductor(`${user?.name || ''}`);
}
        setLastPage(response.data.last_page); // Actualiza el estado con la última página
    } catch (error) {
        console.error('Error al obtener las revisiones:', error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    obtenerRevisiones();
    setPagina(1); // Reinicia la página a 1 al obtener nuevas revisiones
}, [conductorId, pagina, refresh]); // Vuelve a obtener las revisiones cuando cambie el conductorId o la página

return (
    <div>
     <h3 className="text-lg font-semibold mb-2">Historial de Revisiones</h3>

 
          <ul className="space-y-4">
      {loading ? (  <li>Cargando...</li>
        ) : revisiones.length === 0 ? (
            <li>No hay revisiones registradas para este conductor.</li>
        ) : (
            revisiones.map((revision) => (
                <li key={revision.id} className="border p-4 rounded-md">
                    <p><strong>Fecha de Revisión:</strong> {new Date(revision.fecha_revision).toLocaleDateString()}</p>
                    <p><strong>Observaciones:</strong> {revision.observaciones}</p>
                    {revision.archivo_soporte && (
                      <a
  href={`${import.meta.env.VITE_API_URL}/storage/${revision.archivo_soporte}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-green-700 hover:underline"
>
  Ver Archivo Soporte
</a>

                    )}
                </li>
            ))
        )}
    </ul>

    {lastPage > 1 && (
  <div className="flex gap-2 mt-4">
    {Array.from({ length: lastPage }, (_, i) => i + 1).map((num) => (
      <button
        key={num}
        onClick={() => setPagina(num)}
        className={`px-3 py-1 border rounded ${
          num === pagina ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
        }`}
      >
        {num}
      </button>
    ))}
  </div>
)}
    {loading && <p>Cargando más revisiones...</p>}
</div>
);
}
