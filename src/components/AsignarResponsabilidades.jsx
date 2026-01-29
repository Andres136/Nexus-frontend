import { useEffect, useState } from 'react';
import { useResponsabilidadesAsignadas } from "../hooks/responsabildades/ResponsabilidadesAsignadas";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  HomeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useResponsabilidades } from '../hooks/responsabildades/useResponsabilidades';

import { useAuth } from '../hooks/useAuth';
import { useSedes } from '../hooks/useSedes';
import Select  from 'react-select';

export default function AsignarResponsabilidades() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data,
    pagination,
    loading,
    fetchResponsabilidades,
    assignResponsabilidad,
    updateAsignacion,
    removeAsignacion
  } = useResponsabilidadesAsignadas({
    activo: 1,
  });

  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (responsabilidad, usuario) => {
    setModalMode('edit');
    setSelectedItem({ responsabilidad, usuario });
    setShowModal(true);
  };

  const handleDelete = (responsabilidad, usuario) => {
    setConfirmAction({
      type: 'delete',
      responsabilidad,

      usuario,
      message: `¿Está seguro de desactivar la responsabilidad "${responsabilidad.nombre}" del usuario "${usuario.name}"?`,
      confirmText: 'Desactivar'
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction.type === 'delete') {
       // console.log('Removing assignment with pivot ID:', confirmAction.usuario.pivot.id);
      await removeAsignacion(confirmAction.usuario.pivot.id);
         
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
        await assignResponsabilidad(formData);
      } else {
  

      await updateAsignacion(
  Number(selectedItem.usuario.pivot.id), // ✅ cast a int
  {
    sede_id: Number(formData.sede_id),
    bodega_id: Number(formData.bodega_id),
    activo: Boolean(formData.activo),
  }
);

      }
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Filtrar datos por búsqueda
  const filteredData = data.filter(resp =>
    resp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resp.usuarios.some(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Cargando responsabilidades...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asignar Responsabilidades</h1>
          <p className="mt-2 text-gray-600">Gestiona las asignaciones de responsabilidades a usuarios</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Asignación
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por responsabilidad o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No hay asignaciones</p>
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Comienza asignando responsabilidades a usuarios'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredData.map((resp) => (
              <ResponsabilidadCard
                key={resp.id}
                responsabilidad={resp}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              disabled={pagination.current_page === 1}
              onClick={() => fetchResponsabilidades({ page: pagination.current_page - 1 })}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => fetchResponsabilidades({ page: pagination.current_page + 1 })}
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
                  disabled={pagination.current_page === 1}
                  onClick={() => fetchResponsabilidades({ page: pagination.current_page - 1 })}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => fetchResponsabilidades({ page: pagination.current_page + 1 })}
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
        <AsignacionModal
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
          title="Confirmar eliminación"
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          type="danger"
        />
      )}
    </div>
  );
}

// Responsabilidad Card Component
function ResponsabilidadCard({ responsabilidad, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
const usuarios = Array.isArray(responsabilidad.usuarios)
  ? responsabilidad.usuarios
  : [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <UserGroupIcon className="h-8 w-8 text-indigo-500" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{responsabilidad.nombre}</h3>
            <p className="text-sm text-gray-500">
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} asignado{usuarios.length !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
        >
          {isExpanded ? 'Ocultar' : 'Ver detalles'}
        </button>
      </div>

      {isExpanded && (
        <div className="ml-12 space-y-3">
          {usuarios.length === 0 ? (
            <p className="text-gray-500 italic">No hay usuarios asignados</p>
          ) : (
            usuarios.map((usuario) => (
              <UsuarioAsignado
                key={usuario.id}
                responsabilidad={responsabilidad}
                usuario={usuario}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Usuario Asignado Component
function UsuarioAsignado({ responsabilidad, usuario, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {usuario.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{usuario.name}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>Sede: {usuario.sede_nombre || 'No asignada'}</span>
            </div>
            <div className="flex items-center">
              <HomeIcon className="h-4 w-4 mr-1" />
              <span>Bodega: {usuario.bodega_nombre || 'No asignada'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(responsabilidad, usuario)}
          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
          title="Editar asignación"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(responsabilidad, usuario)}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
          title="Remover asignación"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Modal Component
function AsignacionModal({ show, onClose, onSubmit, mode, initialData }) {
  const [formData, setFormData] = useState({
    user_id: initialData?.usuario?.id || '',
    responsabilidad_id: initialData?.responsabilidad?.id || '',
    sede_id: initialData?.usuario?.pivot?.sede_id || '',
    bodega_id: initialData?.usuario?.pivot?.bodega_id || '',
    activo: initialData?.usuario?.pivot?.activo ?? true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Aquí deberías cargar la lista de usuarios, responsabilidades, sedes y bodegas
   const { usuarios,obtenerUsuariosAll,  } = useAuth({'middleware': 'auth'});
   //console.log('Usuarios cargados:', usuarios);
  const { data: responsabilidades } = useResponsabilidades();
   const { sedes, bodegasAll } = useSedes();
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    const newErrors = {};
    if (!formData.user_id) {
      newErrors.user_id = 'El usuario es requerido';
    }
    if (!formData.responsabilidad_id) {
      newErrors.responsabilidad_id = 'La responsabilidad es requerida';
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

  useEffect(() => {
  obtenerUsuariosAll();
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'create' ? 'Nueva Asignación' : 'Editar Asignación'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario *
            </label>
          <Select
            options={usuarios.map(user => ({ value: user.id, label: user.name }))}
            value={formData.user_id ? { value: formData.user_id, label: usuarios.find(user => user.id === formData.user_id)?.name } : null}
            onChange={(selected) => setFormData({ ...formData, user_id: selected?.value || '' })}
            className={`w-full ${
              errors.user_id ? 'border-red-300' : 'border-gray-300'
            }`}
          />
            {errors.user_id && (
              <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsabilidad *
            </label>
            <select
              value={formData.responsabilidad_id}
              onChange={(e) => setFormData({ ...formData, responsabilidad_id: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.responsabilidad_id ? 'border-red-300' : 'border-gray-300'
              }`}
              
            >
              <option value="">Seleccionar responsabilidad</option>
              {responsabilidades.map((resp) => (
                <option key={resp.id} value={resp.id}>
                  {resp.nombre}
                </option>
              ))}
            </select>
            {errors.responsabilidad_id && (
              <p className="mt-1 text-sm text-red-600">{errors.responsabilidad_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sede
            </label>
            <select
              value={formData.sede_id}
              onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Seleccionar sede</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bodega
            </label>
            <select
              value={formData.bodega_id}
              onChange={(e) => setFormData({ ...formData, bodega_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Seleccionar bodega</option>
              {bodegasAll.map((bodega) => (
                <option key={bodega.id} value={bodega.id}>
                  {bodega.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
              Asignación activa
            </label>
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
              {loading ? 'Guardando...' : (mode === 'create' ? 'Asignar' : 'Actualizar')}
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