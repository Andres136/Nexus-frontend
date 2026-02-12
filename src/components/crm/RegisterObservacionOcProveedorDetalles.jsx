import { useDetalleObservaciones } from '../../hooks/crm/UseDetalleObservaciones';
import Select from 'react-select';
import { X, Save, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function RegisterObservacionOcProveedorDetalles({ isOpen, onClose, detalleId }) {
  const { formData, setFormData, loading, error, handleSubmit, proveedoresAll, procesos } = useDetalleObservaciones();
  


   useEffect(() => {
    if (detalleId) {
      setFormData(prev => ({
        ...prev,
        orden_detalle_id: detalleId
      }));
    }
  }, [detalleId, setFormData]);
  
  if (!isOpen || !detalleId) return null;

  // Estilos para react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: '#d1d5db',
      '&:hover': { borderColor: '#6366f1' },
      '&:focus-within': { 
        borderColor: '#6366f1', 
        boxShadow: '0 0 0 1px #6366f1' 
      }
    })
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    const success = await handleSubmit(e);
    if (success) {
      onClose();
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Registrar Observación
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmitForm} className="p-6 space-y-5">
          
     

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor
            </label>
            <Select
              options={proveedoresAll.map(p => ({ value: p.id, label: p.nombre }))}
              value={proveedoresAll.find(p => p.id === formData.proveedor_id) ? 
                { value: formData.proveedor_id, label: proveedoresAll.find(p => p.id === formData.proveedor_id)?.nombre } : null}
              onChange={(selected) => setFormData({ ...formData, proveedor_id: selected?.value || null })}
              placeholder="Seleccionar proveedor..."
              isClearable
              isSearchable
              styles={selectStyles}
              isDisabled={loading}
            />

           {error?.proveedor_id && (
             <div className="text-sm text-red-600">
               {error.proveedor_id.join(", ")}
             </div>
           )}
          </div>

          {/* Proceso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proceso
            </label>
            <Select
              options={procesos.map(p => ({ value: p.id, label: p.nombre }))}
              value={procesos.find(p => p.id === formData.proceso_bolsas_id) ? 
                { value: formData.proceso_bolsas_id, label: procesos.find(p => p.id === formData.proceso_bolsas_id)?.nombre } : null}
              onChange={(selected) => setFormData({ ...formData, proceso_bolsas_id: selected?.value || null })}
              placeholder="Seleccionar proceso..."
              isClearable
              isSearchable
              styles={selectStyles}
              isDisabled={loading}
            />

            {error?.proceso_bolsas_id && (
              <div className="text-sm text-red-600">
                {error.proceso_bolsas_id.join(", ")}
              </div>
            )}
          </div>

          {/* Observación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observación
            </label>
            <textarea
              value={formData.observacion || ''}
              onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
              placeholder="Escriba su observación..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              disabled={loading}
            />
            {error?.observacion && (
              <div className="text-sm text-red-600">
                {error.observacion.join(", ")}
              </div>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={formData.estado || ''}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            >
            <option value="pendiente">Pendiente</option>
<option value="completado">Completado</option>
<option value="cancelado">Cancelado</option>

            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <span>Error al guardar la observación. Intente nuevamente.</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}