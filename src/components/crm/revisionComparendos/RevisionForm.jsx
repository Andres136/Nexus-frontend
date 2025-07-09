import { useState } from 'react';
import { toast } from 'react-toastify';
import clienteAxios from '../../../config/axios';

export default function RevisionForm({ conductorId, onSuccess }) {
  const [form, setForm] = useState({
    fecha_revision: '',
    archivo_soporte: null,
    observaciones: '',
  });
console.log('Conductor ID:', conductorId); // Para depuración
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'archivo_soporte') {
      setForm((prev) => ({
        ...prev,
        archivo_soporte: files[0],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('conductor_id', conductorId);
    data.append('fecha_revision', form.fecha_revision);
    data.append('archivo_soporte', form.archivo_soporte);
    data.append('observaciones', form.observaciones);

    try {
      const token = localStorage.getItem('token');
      const response = await clienteAxios.post('/api/revision-comparendos', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message);
      setForm({ fecha_revision: '', archivo_soporte: null, observaciones: '' });
      onSuccess();
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      if (error.response?.data?.errors) {
        setError(error.response.data.errors);
        toast.error('Verifica los campos del formulario');
      } else {
        toast.error('Error al registrar la revisión de comparendo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Registrar Revisión de Comparendo</h2>

      <div className="mb-4">
        <label htmlFor="fecha_revision" className="block text-sm font-medium mb-1">
          Fecha de Revisión
        </label>
        <input
          type="date"
          id="fecha_revision"
          name="fecha_revision"
          value={form.fecha_revision}
          onChange={handleChange}
          
          className="w-full p-2 border border-gray-300 rounded"
        />
        {error?.fecha_revision && (
          <p className="text-red-500 text-sm mt-1">{error.fecha_revision.join(', ')}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="archivo_soporte" className="block text-sm font-medium mb-1">
          Archivo Soporte (PDF, JPG, PNG)
        </label>
        <input
          type="file"
          id="archivo_soporte"
          name="archivo_soporte"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleChange}
          
          className="w-full p-2 border border-gray-300 rounded"
        />
        {error?.archivo_soporte && (
          <p className="text-red-500 text-sm mt-1">{error.archivo_soporte.join(', ')}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="observaciones" className="block text-sm font-medium mb-1">
          Observaciones
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
          rows="4"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`bg-green-700 text-white px-4 py-2 rounded hover:bg-blue-700 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Registrando...' : 'Registrar Revisión'}
      </button>
    </form>
  );
}

