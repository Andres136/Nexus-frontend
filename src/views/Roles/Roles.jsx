import { useEffect, useState } from 'react'

import Swal from 'sweetalert2'
import { Shield, Plus, Users, Badge, UserCheck, Edit, Trash2, Save, X } from 'lucide-react'
import { actualizarRolApi, crearRolApi, eliminarRolApi, obtenerRolesApi } from '../../services/Roles'

export default function Roles() {
    const [roles, setRoles] = useState([])
    const [errores, setErrores] = useState({})
    const [formdata, setFormdata] = useState({
        nombre: ''
    })
    // ✅ NUEVOS ESTADOS PARA EDICIÓN
    const [editingId, setEditingId] = useState(null)
    const [editValue, setEditValue] = useState('')

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        const response = await obtenerRolesApi.getAll()
        setRoles(response.data)
    }

    const handleCreateRole = async () => {
        try {
            const response = await crearRolApi.create({ nombre: formdata.nombre })

            // Limpiar
            fetchRoles()
            setFormdata({ nombre: '' })
            setErrores({})

            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Rol creado',
                    text: `El rol "${formdata.nombre}" ha sido creado exitosamente.`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            }

        } catch (error) {
            // SI ES ERROR 422 → VALIDACIÓN
            if (error.response?.status === 422) {
                setErrores(error.response.data.errors)
                return
            }

            console.error("Error creating role:", error)

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear el rol. Intente nuevamente.'
            })
        }
    }

    // ✅ FUNCIÓN PARA INICIAR EDICIÓN
    const startEdit = (rol) => {
        setEditingId(rol.id)
        setEditValue(rol.nombre)
    }

    // ✅ FUNCIÓN PARA CANCELAR EDICIÓN
    const cancelEdit = () => {
        setEditingId(null)
        setEditValue('')
    }

    // ✅ FUNCIÓN PARA GUARDAR EDICIÓN
    const saveEdit = async (id) => {
        try {
            await actualizarRolApi.update(id, { nombre: editValue })
            
            // Actualizar la lista
            fetchRoles()
            setEditingId(null)
            setEditValue('')

            Swal.fire({
                icon: 'success',
                title: 'Rol actualizado',
                text: 'El rol ha sido actualizado exitosamente.',
                timer: 2000,
                showConfirmButton: false,
            });

        } catch (error) {
            console.error("Error updating role:", error)
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el rol. Intente nuevamente.'
            })
        }
    }

    // ✅ FUNCIÓN PARA ELIMINAR ROL
    const deleteRole = async (id, nombre) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el rol "${nombre}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                await eliminarRolApi.delete(id)
                fetchRoles()

                Swal.fire({
                    icon: 'success',
                    title: 'Rol eliminado',
                    text: 'El rol ha sido eliminado exitosamente.',
                    timer: 2000,
                    showConfirmButton: false,
                });

            } catch (error) {
                console.error("Error deleting role:", error)
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el rol. Intente nuevamente.'
                })
            }
        }
    }

    const handleChange = (e) => {
        setFormdata({
            ...formdata,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6">
            <div className="max-w-4xl mx-auto">
                
                {/* ✅ Header mejorado */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Gestión de Roles</h1>
                            <p className="text-sm sm:text-base text-gray-600">Crea, edita y administra los roles del sistema</p>
                        </div>
                    </div>

                    {/* ✅ Estadísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500 p-2 rounded-full">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg sm:text-xl font-bold text-blue-700">{roles.length}</p>
                                    <p className="text-xs sm:text-sm text-blue-600">Total de Roles</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500 p-2 rounded-full">
                                    <UserCheck className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg sm:text-xl font-bold text-green-700">Activos</p>
                                    <p className="text-xs sm:text-sm text-green-600">Sistema Funcionando</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ Formulario mejorado */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Crear Nuevo Rol</h2>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleCreateRole()
                        }}
                        className="space-y-4"
                    >
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Rol
                                </label>
                                <div className="relative">
                                    <Badge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formdata.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej: Administrador, Editor, Usuario..."
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                            errores.nombre 
                                                ? 'border-red-300 bg-red-50' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    />
                                </div>
                                
                                {/* ✅ Mensaje de error mejorado */}
                                {errores.nombre && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errores.nombre[0]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg w-full sm:w-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Crear Rol</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* ✅ Lista de roles mejorada CON EDICIÓN */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-600" />
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Roles Existentes</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                {roles.length}
                            </span>
                        </div>
                    </div>

                    {/* Lista responsive */}
                    {roles.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 text-5xl mb-4">👥</div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No hay roles creados</h3>
                            <p className="text-sm text-gray-500">
                                Crea tu primer rol usando el formulario de arriba
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {roles.map((r, index) => (
                                <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        
                                        <div className="flex-1">
                                            {/* ✅ MODO EDICIÓN O VISTA */}
                                            {editingId === r.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="flex-1 px-3 py-1 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => saveEdit(r.id)}
                                                            className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                                            title="Guardar"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                                                            title="Cancelar"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                                                        {r.nombre}
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-gray-500">
                                                        ID: {r.id}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {/* ✅ ACCIONES */}
                                        {editingId !== r.id && (
                                            <div className="flex items-center gap-2">
                                                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    <span className="text-xs font-medium">Activo</span>
                                                </div>
                                                
                                                <button
                                                    onClick={() => startEdit(r)}
                                                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                                                    title="Editar rol"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => deleteRole(r.id, r.nombre)}
                                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                                    title="Eliminar rol"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ✅ Footer informativo */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-yellow-100 p-2 rounded-full">
                            <Shield className="w-4 h-4 text-yellow-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800">Información Importante</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                                <strong>Editar:</strong> Haz clic en el ícono de edición para modificar el nombre del rol
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                            <div>
                                <strong>Eliminar:</strong> Ten cuidado al eliminar roles, esta acción no se puede deshacer
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                                <strong>Permisos:</strong> Después de crear roles, asigna permisos desde el menú correspondiente
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}