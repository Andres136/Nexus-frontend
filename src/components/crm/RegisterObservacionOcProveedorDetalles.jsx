import { useDetalleObservaciones } from '../../hooks/crm/UseDetalleObservaciones';
import Select from 'react-select';
import { X, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useEntregasProveedores } from '../../hooks/useEntregasProveedores';

export default function RegisterObservacionOcProveedorDetalles({
  isOpen,
  onClose,
  detalleId = null,
  modo = "api",    
  onSave = null,    
}) {

  //  MODO API
  const apiHook = useDetalleObservaciones();

  //  MODO LOCAL
  const { proveedoresAll, procesos } = useEntregasProveedores();
  const [localData, setLocalData] = useState({
    proceso_bolsas_id: null,
    proveedor_id: null,
    observacion: "",
    estado: "pendiente",
  });

  const isApi = modo === "api";

  // Solo usar hook API si es modo api
  const formData = isApi ? apiHook.formData : localData;
  const setFormData = isApi ? apiHook.setFormData : setLocalData;
  const loading = isApi ? apiHook.loading : false;
  const error = isApi ? apiHook.error : null;
  const handleSubmit = isApi ? apiHook.handleSubmit : null;

  useEffect(() => {
    if (isApi && detalleId) {
      setFormData(prev => ({
        ...prev,
        orden_detalle_id: detalleId
      }));
    }
  }, [detalleId]);

   useEffect(() => {
  if (isOpen && !isApi) {
    setLocalData({
      proceso_bolsas_id: null,
      proveedor_id: null,
      observacion: "",
      estado: "pendiente",
    });
  }
}, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // 🟢 MODO LOCAL
    if (!isApi) {
      if (!formData.proceso_bolsas_id || !formData.proveedor_id) return;

   const procesoSeleccionado = procesos.find(
  p => p.id === formData.proceso_bolsas_id
);

const proveedorSeleccionado = proveedoresAll.find(
  p => p.id === formData.proveedor_id
);

onSave?.({
  proceso_bolsas_id: formData.proceso_bolsas_id,
  proceso_nombre: procesoSeleccionado?.nombre || "",
  proveedor_id: formData.proveedor_id,
  proveedor_nombre: proveedorSeleccionado?.nombre || "",
  observacion: formData.observacion,
  estado: "pendiente"
});

setLocalData({
  proceso_bolsas_id: null,
  proveedor_id: null,
  observacion: "",
  estado: "pendiente",
});

      onClose();
      return;
    }

    //  MODO API (comportamiento actual)
    const success = await handleSubmit(e);
    if (success) onClose();
  };

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

 

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Registrar Proceso
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmitForm} className="p-6 space-y-5">

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor que realizará el proceso
            </label>
            <Select
              options={proveedoresAll.map(p => ({ value: p.id, label: p.nombre }))}
              value={proveedoresAll.find(p => p.id === formData.proveedor_id)
                ? { value: formData.proveedor_id, label: proveedoresAll.find(p => p.id === formData.proveedor_id)?.nombre }
                : null}
              onChange={(selected) =>
                setFormData(prev => ({
                  ...prev,
                  proveedor_id: selected?.value || null
                }))
              }
              styles={selectStyles}
            />
          </div>

          {/* Proceso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proceso
            </label>
            <Select
              options={procesos.map(p => ({ value: p.id, label: p.nombre }))}
              value={procesos.find(p => p.id === formData.proceso_bolsas_id)
                ? { value: formData.proceso_bolsas_id, label: procesos.find(p => p.id === formData.proceso_bolsas_id)?.nombre }
                : null}
              onChange={(selected) =>
                setFormData(prev => ({
                  ...prev,
                  proceso_bolsas_id: selected?.value || null
                }))
              }
              styles={selectStyles}
            />
          </div>

          {/* Observación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observación
            </label>
       <textarea
  value={formData.observacion || ""}
  onChange={(e) =>
    setFormData({ ...formData, observacion: e.target.value })
  }
  rows={3}
  className={`w-full px-3 py-2 border rounded-lg resize-none
    ${
      error?.observacion
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-indigo-500"
    }`}
  disabled={loading}
/>
{error?.observacion && (
  <p className="text-red-500 text-sm mt-1">{error.observacion[0]}</p>
)}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              <Save size={16} />
              Guardar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}