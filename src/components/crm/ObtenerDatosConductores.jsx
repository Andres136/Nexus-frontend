import { useEffect, useState } from 'react';
import clienteAxios from '../../config/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function ObtenerDatosConductores() {
  const [conductores, setConductores] = useState([]);
  const [archivos, setArchivos] = useState({});

  useEffect(() => {
    obtenerConductoresNuevamente();
  }, []);

  const obtenerConductoresNuevamente = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await clienteAxios.get('/api/datos-conductores', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConductores(response.data.data);
    } catch (error) {
      console.error('Error al obtener los datos de los conductores:', error);
      toast.error('Error al cargar la lista de conductores');
    }
  };

  const handleFileChange = (e, id, tipoArchivo) => {
    const file = e.target.files[0];
    setArchivos((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [tipoArchivo]: file,
      },
    }));
  };

  const actualizarArchivos = async (id) => {
    const formData = new FormData();
    const archivosConductor = archivos[id] || {};

    Object.entries(archivosConductor).forEach(([key, file]) => {
      formData.append(key, file);
    });

    if (
      formData.has('rut_archivo') ||
      formData.has('licencia_archivo') ||
      formData.has('comparendo_archivo')
    ) {
      try {
        const token = localStorage.getItem('token');
        const response = await clienteAxios.post(
          `/api/datos-conductores/${id}?_method=PUT`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        toast.success(response.data.message);
        obtenerConductoresNuevamente();
      } catch (error) {
        console.error('Error actualizando archivos:', error);
        toast.error('Error al actualizar archivos');
      }
    } else {
      toast.info('No se han seleccionado archivos para actualizar');
    }
  };

  return (
    <div className="overflow-x-auto p-4">

        <h1 className="text-2xl font-bold mb-4">Datos de Conductores</h1>
        <Link
          to="/auth/crm/crear-datos-conductores"
          className="bg-gray-700 text-white px-4 py-2 rounded mb-4 inline-block hover:bg-gray-800 transition-colors">
             Registrar Nuevo Conductor  
        </Link>
       

        {conductores.length === 0 ?(
          <p className="text-gray-500">No hay Datos de conductores registrados.</p>
        ):(    
      <table className="min-w-full text-sm border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Conductor</th>
            <th className="border p-2">Cédula</th>
            <th className="border p-2">Licencia</th>
            <th className="border p-2">Tipo</th>
            <th className="border p-2">F. Exp</th>
            <th className="border p-2">F. Venc</th>
            <th className="border p-2">Categoría</th>
            <th className="border p-2">Grupo</th>
            <th className="border p-2">RUT</th>
            <th className="border p-2">Licencia</th>
            <th className="border p-2">Comparendo</th>
            <th className="border p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {conductores.map((conductor) => (
            <tr key={conductor.id}>
              <td className="border p-2">{conductor.id}</td>
            <td className="border p-2">
  {conductor.user ? `${conductor.user.name} ${conductor.user.last_name ?? ''}` : 'Sin usuario'}
</td>

              <td className="border p-2">{conductor.cedula}</td>
              <td className="border p-2">{conductor.licencia_conduccion}</td>
              <td className="border p-2">{conductor.tipo_licencia}</td>
              <td className="border p-2">
                {new Date(conductor.fecha_expedicion).toLocaleDateString()}
              </td>
              <td className="border p-2">
                {new Date(conductor.fecha_vencimiento).toLocaleDateString()}
              </td>
              <td className="border p-2">{conductor.categoria}</td>
              <td className="border p-2">{conductor.grupo_sanguineo}</td>
              {/* RUT */}
              <td className="border p-2">
                {conductor.rut_archivo && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}/storage/${conductor.rut_archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline block"
                  >
                    Ver RUT
                  </a>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, conductor.id, 'rut_archivo')}
                  className="text-xs mt-1"
                />
              </td>
              {/* Licencia */}
              <td className="border p-2">
                {conductor.licencia_archivo && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}/storage/${conductor.licencia_archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline block"
                  >
                    Ver Licencia
                  </a>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, conductor.id, 'licencia_archivo')}
                  className="text-xs mt-1"
                />
              </td>
              {/* Comparendo */}
              <td className="border p-2">
                {conductor.comparendo_archivo && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}/storage/${conductor.comparendo_archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline block"
                  >
                    Ver Comparendo
                  </a>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, conductor.id, 'comparendo_archivo')}
                  className="text-xs mt-1"
                />
              </td>
              {/* Botón */}
              <td className="border p-2 text-center">
                <button
                  onClick={() => actualizarArchivos(conductor.id)}
                  className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
                >
                  Actualizar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>)}
    </div>
  );
}
