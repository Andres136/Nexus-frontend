import { useState } from 'react';
import { useResponsabilidades } from "../hooks/responsabildades/useResponsabilidades";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,

} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function Responsabilidades() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const {
    data,
    pagination,
    filters,
    setFilters,
    loading,
    createResponsabilidad,
    updateResponsabilidad,
    deleteResponsabilidad,
    toggleActivoResponsabilidad
  } = useResponsabilidades();

  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setConfirmAction({
      type: 'delete',
      item,
      message: `¿Está seguro de eliminar la responsabilidad "${item.nombre}"?`,
      confirmText: 'Eliminar'
    });
    setShowConfirmDialog(true);
  };



  const handleConfirmAction = async () => {
    try {
      if (confirmAction.type === 'delete') {
        await deleteResponsabilidad(confirmAction.item.id);
      } else if (confirmAction.type === 'toggle') {
        await toggleActivoResponsabilidad(confirmAction.item.id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (modalMode === 'create') {
        await createResponsabilidad(formData);
      } else {
        await updateResponsabilidad(selectedItem.id, formData);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  {/* Título */}
  <div>
    <h1 className="text-3xl font-semibold text-gray-900">
      Responsabilidades
    </h1>
    <p className="mt-1 text-sm text-gray-600">
      Administra y asigna responsabilidades del sistema
    </p>
  </div>

  {/* Acciones */}
  <div className="flex gap-3">
    <Link
      to="/auth/asignar-responsabilidades"
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
    >
      <PlusIcon className="h-5 w-5" />
      Asignar responsabilidades
    </Link>

    <button
      onClick={handleCreate}
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm"
    >
      <PlusIcon className="h-5 w-5" />
      Nueva responsabilidad
    </button>
  </div>
</div>


      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar responsabilidades..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
       
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
             
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No se encontraron responsabilidades</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {filters.search ? 'Intenta con otros términos de búsqueda' : 'Comienza creando una nueva responsabilidad'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                      {item.descripcion && (
                        <div className="text-sm text-gray-500 mt-1">{item.descripcion}</div>
                      )}
                    </td>
                 
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              disabled={filters.page === pagination.last_page}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{pagination.from || 0}</span> a{' '}
                <span className="font-medium">{pagination.to || 0}</span> de{' '}
                <span className="font-medium">{pagination.total || 0}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  disabled={filters.page === pagination.last_page}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ResponsabilidadModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitForm}
          mode={modalMode}
          initialData={selectedItem}
        />
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && confirmAction && (
        <ConfirmDialog
          show={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmAction}
          title="Confirmar acción"
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          type={confirmAction.type === 'delete' ? 'danger' : 'warning'}
        />
      )}
    </div>
  );
}

// Modal Component
function ResponsabilidadModal({ show, onClose, onSubmit, mode, initialData }) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'create' ? 'Nueva Responsabilidad' : 'Editar Responsabilidad'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.nombre ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nombre de la responsabilidad"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
              placeholder="Descripción de la responsabilidad"
            />
          </div>

     

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirm Dialog Component
function ConfirmDialog({ show, onClose, onConfirm, title, message, confirmText, type = 'danger' }) {
  if (!show) return null;

  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 ${typeStyles[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}