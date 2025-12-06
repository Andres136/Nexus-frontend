import { useState } from "react";
import { Plus, Trash2, Route, Save, Settings, Globe, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import Swal from "sweetalert2";
import clienteAxios from "../../config/axios";

export default function RegistrarRutas() {
  const [rutas, setRutas] = useState([
    { path: "", name: "", module: "", enabled: true }
  ]);

  // Agregar fila
  const agregarFila = () => {
    setRutas([
      ...rutas,
      { path: "", name: "", module: "", enabled: true }
    ]);
  };

  // Eliminar fila
  const eliminarFila = (index) => {
    if (rutas.length === 1) return;
    setRutas(rutas.filter((_, i) => i !== index));
  };

  // Cambios en inputs
  const handleChange = (index, campo, valor) => {
    const nuevas = [...rutas];
    nuevas[index][campo] = valor;
    setRutas(nuevas);
  };

  // Guardar en el backend
  const guardarRutas = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await clienteAxios.post(
        "/api/guardar-rutas",
        { rutas },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Guardado", data.message, "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo guardar",
        "error"
      );
    }
  };

  // Estadísticas
  const rutasHabilitadas = rutas.filter(r => r.enabled).length;
  const rutasCompletas = rutas.filter(r => r.path && r.name && r.module).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* ✅ Header mejorado */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
              <Route className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Registrar Rutas del Sistema</h1>
              <p className="text-sm sm:text-base text-gray-600">Configura las rutas y permisos de navegación</p>
            </div>
          </div>

          {/* ✅ Panel de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-full">
                  <Route className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-blue-700">{rutas.length}</p>
                  <p className="text-xs sm:text-sm text-blue-600">Total Rutas</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-full">
                  <ToggleRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-green-700">{rutasHabilitadas}</p>
                  <p className="text-xs sm:text-sm text-green-600">Habilitadas</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-full">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-purple-700">{rutasCompletas}</p>
                  <p className="text-xs sm:text-sm text-purple-600">Completas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Controles principales */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-700">Gestión de Rutas</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={agregarFila}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Ruta</span>
              </button>

              <button
                onClick={guardarRutas}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Tabla responsive mejorada */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Configuración de Rutas</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Define las rutas, nombres y módulos del sistema
            </p>
          </div>

          {/* Vista móvil - Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {rutas.map((ruta, index) => (
              <div key={index} className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Ruta #{index + 1}</h4>
                  <button
                    onClick={() => eliminarFila(index)}
                    disabled={rutas.length === 1}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      rutas.length === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-100 hover:bg-red-200 text-red-600"
                    }`}
                    title="Eliminar ruta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Path */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Globe className="w-3 h-3 text-blue-600" />
                      Path de la Ruta
                    </label>
                    <input
                      type="text"
                      value={ruta.path}
                      placeholder="/auth/crm/clientes"
                      onChange={(e) => handleChange(index, "path", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-mono"
                    />
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Route className="w-3 h-3 text-green-600" />
                      Nombre de la Ruta
                    </label>
                    <input
                      type="text"
                      value={ruta.name}
                      placeholder="Gestión de Clientes"
                      onChange={(e) => handleChange(index, "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>

                  {/* Módulo */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Tag className="w-3 h-3 text-purple-600" />
                      Módulo
                    </label>
                    <input
                      type="text"
                      value={ruta.module}
                      placeholder="CRM"
                      onChange={(e) => handleChange(index, "module", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>

                  {/* Estado */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Estado de la Ruta</span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ruta.enabled}
                        onChange={(e) => handleChange(index, "enabled", e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        ruta.enabled ? 'bg-green-600' : 'bg-gray-300'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                          ruta.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                      <span className={`ml-2 text-sm font-medium ${ruta.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {ruta.enabled ? 'Habilitada' : 'Deshabilitada'}
                      </span>
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
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Path
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4" />
                      Nombre
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Módulo
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <ToggleRight className="w-4 h-4" />
                      Estado
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rutas.map((ruta, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={ruta.path}
                        placeholder="/auth/crm/clientes"
                        onChange={(e) => handleChange(index, "path", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-mono bg-gray-50"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={ruta.name}
                        placeholder="Gestión de Clientes"
                        onChange={(e) => handleChange(index, "name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={ruta.module}
                        placeholder="CRM"
                        onChange={(e) => handleChange(index, "module", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ruta.enabled}
                          onChange={(e) => handleChange(index, "enabled", e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          ruta.enabled ? 'bg-green-600' : 'bg-gray-300'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            ruta.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => eliminarFila(index)}
                        disabled={rutas.length === 1}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          rutas.length === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-red-100 hover:bg-red-200 text-red-600 transform hover:scale-110"
                        }`}
                        title="Eliminar ruta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mensaje si no hay rutas */}
          {rutas.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">🛣️</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No hay rutas configuradas</h3>
              <p className="text-sm text-gray-500">
                Agrega rutas para configurar los permisos del sistema
              </p>
            </div>
          )}
        </div>

        {/* ✅ Footer informativo */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Settings className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Información Importante</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Path:</strong> Debe coincidir exactamente con las rutas de React Router
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <strong>Nombre:</strong> Se mostrará en la interfaz de permisos
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <strong>Módulo:</strong> Agrupa las rutas por funcionalidad
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <strong>Estado:</strong> Solo rutas habilitadas aparecen en permisos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}