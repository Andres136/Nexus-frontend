
import { useParams } from 'react-router-dom'
import RevisionForm from '../../components/crm/revisionComparendos/RevisionForm'
import RevisionList from '../../components/crm/revisionComparendos/RevisionList';
import clienteAxios from '../../config/axios';
import { useEffect, useState } from 'react';

export default function RevisionesPage() {
    const conductorId = useParams()
    .conductorId; // ✅ obtenemos el ID del conductor desde los parámetros de la URL
  const id = parseInt(conductorId, 10); // ✅ lo convertimos a número
  const [nombreConductor, setNombreConductor] = useState(''); // Estado para manejar el nombre del conductor
  const [refreshRevisiones, setRefreshRevisiones] = useState(false);

  const obtenerConductor = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await clienteAxios.get(`/api/datos-conductores/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     // console.log('Conductor obtenido:', response.data); // Para depuración
     setNombreConductor(response.data.data.user.name);

    } catch (error) {
      console.error('Error al obtener el nombre del conductor:', error);
    }
  };
 
 useEffect(() => {
    obtenerConductor();
  }, [id]);
  return (
 <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        Historial de Comparendos {nombreConductor && `– ${nombreConductor}`}
      </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Columna 1: Formulario */}
    <div className="bg-white p-4 shadow rounded">
    <RevisionForm conductorId={id} onSuccess={() => setRefreshRevisiones(prev => !prev)} />

    </div>

    {/* Columna 2: Lista de Revisiones */}
    <div className="bg-white p-4 shadow rounded">
      <RevisionList conductorId={id} refresh={refreshRevisiones} />
    </div>
  </div>
</div>

  )
}
