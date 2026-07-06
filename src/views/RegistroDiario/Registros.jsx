import { useState } from "react";
import { useGestionProcesos } from "../../hooks/useGestionProcesos";
import { usePreguntas } from "../../hooks/RegistroDiario/UsePreguntas";
import { useRegistroDiario } from "../../hooks/RegistroDiario/useRegistroDiario";
import Select from "react-select";
import RegisterPreguntas from "../../components/RegistroDiario/RegisterPreguntas";
import NovedadesCalidad from "../../components/calidad/NovedadesCalidad";
import { useNavigate, useLocation } from "react-router-dom";

export default function Registros() {
  const { departamentos } = useGestionProcesos();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPreguntaModal, setShowPreguntaModal] = useState(false);
  const [showRegistroModal, setShowRegistroModal] = useState(false);

  const {
    formData,
    handleChange,
    handleSelectChange,
    handleSubmit,
    loading,
    error,
  } = useRegistroDiario();

  const { preguntas, loading: loadingPreguntas } =
    usePreguntas(formData.departamento_id);

  const routes = [
    { path: '/auth/registro-diario', label: 'Dashboard Procesos' },
    { path: '/auth/registro-diario/verificacion', label: 'Verificación' },
    { path: '/auth/registro-diario/dashboard', label: 'Dashboard Verificación' },
    { path: '/auth/novedades', label: 'Novedades' },
  ];

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Header de navegación */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Registro Diario</h1>
          
          <div className="flex flex-wrap gap-2">
            {routes.map((route) => (
              <button
                key={route.path}
                onClick={() => navigate(route.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === route.path
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {route.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => setShowPreguntaModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            + Crear Pregunta
          </button>
          <button
            onClick={() => setShowRegistroModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + Nuevo Registro
          </button>
        </div>
      </div>

      {/* Listado de novedades como vista principal */}
      <NovedadesCalidad />

      {/* Modal para el formulario de Nuevo Registro */}
      {showRegistroModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Nuevo Registro</h2>
              <button
                onClick={() => setShowRegistroModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primera fila - Selectores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Departamento */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Departamento
              </label>
              <Select
                placeholder="Seleccione un departamento"
                options={departamentos.map(d => ({
                  value: d.id,
                  label: d.nombre,
                }))}
                onChange={(opt) =>
                  handleSelectChange("departamento_id", opt)
                }
                className="text-sm"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderColor: error?.errors?.departamento_id ? '#ef4444' : '#d1d5db',
                    '&:hover': {
                      borderColor: error?.errors?.departamento_id ? '#ef4444' : '#9ca3af',
                    },
                  }),
                }}
              />
              {error?.errors?.departamento_id && (
                <p className="text-sm text-red-600">
                  {error.errors.departamento_id[0]}
                </p>
              )}
            </div>

            {/* Pregunta */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pregunta
              </label>
              <Select
                placeholder={
                  formData.departamento_id
                    ? "Seleccione una pregunta"
                    : "Seleccione primero un departamento"
                }
                isDisabled={!formData.departamento_id}
                isLoading={loadingPreguntas}
                options={preguntas.map(p => ({
                  value: p.id,
                  label: p.pregunta,
                }))}
                onChange={(opt) =>
                  handleSelectChange("pregunta_id", opt)
                }
                className="text-sm"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderColor: error?.errors?.pregunta_id ? '#ef4444' : '#d1d5db',
                    '&:hover': {
                      borderColor: error?.errors?.pregunta_id ? '#ef4444' : '#9ca3af',
                    },
                  }),
                }}
              />
              {error?.errors?.pregunta_id && (
                <p className="text-sm text-red-600">
                  {error.errors.pregunta_id[0]}
                </p>
              )}
            </div>
          </div>

          {/* Segunda fila - Respuesta y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Respuesta */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Respuesta (Cantidad)
              </label>
              <input
                type="number"
                name="respuesta"
                value={formData.respuesta}
                onChange={handleChange}
                placeholder="Ingrese la cantidad"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione estado</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Tercera fila - Observaciones y Novedad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Observaciones */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Agregue observaciones adicionales..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Novedad */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Novedad
              </label>
              <textarea
                name="novedad"
                value={formData.novedad}
                onChange={handleChange}
                placeholder="Describa cualquier novedad encontrada..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Botón de envío */}
          <div className="pt-4 border-t border-gray-200">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para RegisterPreguntas */}
      {showPreguntaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Crear Nueva Pregunta</h2>
              <button
                onClick={() => setShowPreguntaModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <RegisterPreguntas />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}