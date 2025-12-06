import useAsigPermissions from "../../hooks/roles/useAsigPermissions";
import { Shield, Users, Settings, Check, X, Save, Search, Filter } from "lucide-react";
import { useState } from "react";

export default function AsignarPermisos() {
  const {
    roles,
    permisos,
    selectedRole,
    setSelectedRole,
    rolePerms,
    loadRolePerms,
    togglePermiso,
    agregarTodos,
    quitarTodos,
    guardar,
    setRolePerms,
  } = useAsigPermissions();

  // Estados locales para UI sin tocar lógica
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("");

  // Filtrar permisos para display
  const permisosFiltrados = permisos.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = !filterModule || p.module === filterModule;
    return matchSearch && matchModule;
  });

  // Obtener módulos únicos
  const modulos = [...new Set(permisos.map(p => p.module))].filter(Boolean);

  // Obtener estadísticas
  const totalPermisos = permisos.length;
  const permisosAsignados = rolePerms.length;
  const porcentajeAsignado = totalPermisos > 0 ? ((permisosAsignados / totalPermisos) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ✅ Header mejorado */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Asignar Permisos a Roles</h1>
              <p className="text-sm sm:text-base text-gray-600">Gestiona los permisos de acceso por rol de usuario</p>
            </div>
          </div>

          {/* ✅ Selector de rol mejorado */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              Seleccionar Rol
            </label>
            <select
              className="w-full sm:w-auto min-w-[300px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              value={selectedRole}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedRole(id);
                setRolePerms([]);
                loadRolePerms(id);
              }}
            >
              <option value="">Seleccione un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedRole && (
          <>
            {/* ✅ Panel de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Permisos</p>
                    <p className="text-2xl font-bold text-gray-900">{totalPermisos}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Asignados</p>
                    <p className="text-2xl font-bold text-green-700">{permisosAsignados}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progreso</p>
                    <p className="text-2xl font-bold text-purple-700">{porcentajeAsignado}%</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Controles mejorados */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                
                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={agregarTodos}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    <span>Agregar Todos</span>
                  </button>

                  <button
                    onClick={quitarTodos}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                    <span>Quitar Todos</span>
                  </button>
                </div>

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar permisos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm w-full sm:w-64"
                    />
                  </div>

                  {/* Filtro por módulo */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={filterModule}
                      onChange={(e) => setFilterModule(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm w-full sm:w-48"
                    >
                      <option value="">Todos los módulos</option>
                      {modulos.map((modulo) => (
                        <option key={modulo} value={modulo}>
                          {modulo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Tabla responsive mejorada */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Lista de Permisos</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Mostrando {permisosFiltrados.length} de {totalPermisos} permisos
                </p>
              </div>

              {/* Vista móvil - Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {permisosFiltrados.map((p) => (
                  <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{p.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{p.path}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.module}
                        </span>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rolePerms.includes(p.id)}
                            onChange={() => togglePermiso(p.id)}
                            className="sr-only"
                          />
                          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            rolePerms.includes(p.id) ? 'bg-blue-600' : 'bg-gray-300'
                          }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              rolePerms.includes(p.id) ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista desktop - Tabla */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Path
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Módulo
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {permisosFiltrados.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono bg-gray-50">
                          {p.path}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {p.module}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <label className="flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rolePerms.includes(p.id)}
                              onChange={() => togglePermiso(p.id)}
                              className="sr-only"
                            />
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              rolePerms.includes(p.id) ? 'bg-blue-600' : 'bg-gray-300'
                            }`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                rolePerms.includes(p.id) ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mensaje si no hay resultados */}
              {permisosFiltrados.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-gray-400 text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron permisos</h3>
                  <p className="text-sm text-gray-500">
                    Intenta cambiar los filtros de búsqueda
                  </p>
                </div>
              )}
            </div>

            {/* ✅ Botón guardar flotante */}
            <div className="fixed bottom-6 right-6 lg:relative lg:bottom-auto lg:right-auto">
              <button
                onClick={guardar}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full lg:rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-2xl lg:shadow-lg text-sm lg:text-base"
              >
                <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </>
        )}

        {/* ✅ Estado vacío */}
        {!selectedRole && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">👆</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Selecciona un rol</h3>
            <p className="text-gray-500">
              Elige un rol de la lista superior para gestionar sus permisos de acceso
            </p>
          </div>
        )}
      </div>
    </div>
  );
}