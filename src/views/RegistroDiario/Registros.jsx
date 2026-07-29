import { useState } from "react";
import { useGestionProcesos } from "../../hooks/useGestionProcesos";
import { useRegistroDiario } from "../../hooks/RegistroDiario/useRegistroDiario";
import Select from "react-select";
import NovedadesCalidad from "../../components/calidad/NovedadesCalidad";
import { useNavigate, useLocation } from "react-router-dom";
import { OPCIONES_FUENTES, OPCIONES_TIPO_ACCION } from "../../constants/novedadesCalidad";

export default function Registros() {
  const { departamentos } = useGestionProcesos();
  const navigate = useNavigate();
  const location = useLocation();

  const [showRegistroModal, setShowRegistroModal] = useState(false);
  // Se incrementa tras registrar con éxito para forzar que <NovedadesCalidad />
  // vuelva a pedir sus datos sin recargar la página (los filtros/página que
  // persisten en la URL no se pierden al remontar).
  const [novedadesRefreshKey, setNovedadesRefreshKey] = useState(0);

  const {
    formData,
    handleChange,
    handleSelectChange,
    handleSubmit,
    loading,
    error,
  } = useRegistroDiario();

  const onSubmitRegistro = async (e) => {
    const ok = await handleSubmit(e);
    if (ok) {
      setShowRegistroModal(false);
      setNovedadesRefreshKey((k) => k + 1);
    }
  };

  const routes = [
    { path: '/auth/registro-diario', label: 'Dashboard Procesos' },

  ];

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Listado de novedades como vista principal, con las acciones de Registro Diario en su header */}
      <NovedadesCalidad
        key={novedadesRefreshKey}
        headerActions={
          <>
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
            <button
              onClick={() => setShowRegistroModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              + Nuevo Registro
            </button>
          </>
        }
      />

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
        <form onSubmit={onSubmitRegistro} className="space-y-6">
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

          {/* Novedad */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                No Conformidad
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

          {/* Cuarta fila - Detalle de la novedad (solo si hay novedad) */}
          {formData.novedad?.trim() && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
              <p className="text-sm font-semibold text-amber-800">Detalle de la novedad</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    N° de No Conformidad
                  </label>
                  <input
                    type="text"
                    name="numero_no_conformidad"
                    value={formData.numero_no_conformidad}
                    onChange={handleChange}
                    placeholder="Ej: NC-2026-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fuente
                  </label>
                  <select
                    name="fuentes"
                    value={formData.fuentes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {OPCIONES_FUENTES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Acción
                </label>
                <select
                  name="tipo_accion"
                  value={formData.tipo_accion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {OPCIONES_TIPO_ACCION.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
    </div>
  );
}