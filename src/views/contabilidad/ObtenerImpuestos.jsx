import { useState } from 'react';
import CreateImpuestos from '../../components/contabilidad/CreateImpuestos';
import { useGetImpuesto } from '../../hooks/contabilidad/useGetImpuesto';
import { PlusIcon, Edit2, Trash2, AlertCircle} from 'lucide-react';
import { useRegisterImpuesto } from '../../hooks/contabilidad/useRegisterImpuesto';

export default function ObtenerImpuestos() {
  const { impuestos, isLoading, error } = useGetImpuesto();
  const [modalOpen, setModalOpen] = useState(false);
  const [formaSeleccionada, setFormaSeleccionada] = useState(null);
  const{ handleDelete} = useRegisterImpuesto();

  const openModal = (forma = null) => {
    setFormaSeleccionada(forma);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormaSeleccionada(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Impuestos</h1>
          <p className="text-sm text-gray-500">Gestiona las tasas y porcentajes de impuestos.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm font-semibold"
        >
          <PlusIcon size={18} /> Nuevo Impuesto
        </button>
      </div>

      {/* ESTADO: ERROR */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <p className="text-red-700 text-sm font-medium">Error al cargar los impuestos. Por favor, intenta de nuevo.</p>
        </div>
      )}

      {/* TABLA / ESTADO: CARGANDO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Porcentaje</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              // Skeleton Loader
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                  <td className="px-6 py-4 flex justify-end gap-2"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                </tr>
              ))
            ) : impuestos?.length > 0 ? (
              impuestos.map((impuesto) => (
                <tr key={impuesto.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{impuesto.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-md font-mono text-xs">
                      {impuesto.porcentaje}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => openModal(impuesto)}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(impuesto.id)}
                      className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-semibold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-400 text-sm">
                  No hay impuestos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CON BACKDROP */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
             <CreateImpuestos
               forma={formaSeleccionada}
               onClose={closeModal}
             />
          </div>
        </div>
      )}
    </div>
  );
}