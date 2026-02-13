import { useState } from "react";
import Select from "react-select";
import { useGestionProcesos } from "../../hooks/useGestionProcesos";
import { useRegistrosProcesoshoy } from "../../hooks/RegistroDiario/useRegistrosProcesoshoy";
import { useVerificacionDiaria } from "../../hooks/RegistroDiario/useVerificacionDiaria";
import DashboardRegistroDiario from "./DashboardRegistroDiario";
import DashboardProcesosAnuales from "./DashboardProcesosAnuales";

export default function VerificacionDiaria() {
  const { departamentos } = useGestionProcesos();

  const [departamentoId, setDepartamentoId] = useState(null);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  // 🔹 LECTURA
  const { registros, loading: loadingRegistros } =
    useRegistrosProcesoshoy(departamentoId);
  // 🔹 Registro elegido (YA VIENE EN registros)
  const registro = registros.find(
    r => r.id === registroSeleccionado?.value
  );
  // 🔹 ESCRITURA (POST)
  const {
    formData,
    handleChange,
    handleSelectChange,
    handleSubmit,
    loading: loadingSubmit,
    error,
  } = useVerificacionDiaria(registro);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Verificación Diaria</h1>

        <div className="space-y-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                onChange={(opt) => {
                  setDepartamentoId(opt?.value || null);
                  setRegistroSeleccionado(null);
                }}
                className="text-sm"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#9ca3af' },
                  }),
                }}
              />
            </div>

            {/* Registro del día */}
            {departamentoId && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Registro del día
                </label>
                <Select
                  placeholder="Seleccione un registro del día"
                  isLoading={loadingRegistros}
                  options={registros.map(r => ({
                    value: r.id,
                    label: `${r.usuario.name} - ${r.pregunta.pregunta}`,
                  }))}
                  onChange={setRegistroSeleccionado}
                  className="text-sm"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#9ca3af' },
                    }),
                  }}
                />
              </div>
            )}
          </div>

          {/* Detalle del registro */}
          {registro && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-4">Información del registro</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Usuario:</span>
                  <p className="mt-1">{registro.usuario.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Departamento:</span>
                  <p className="mt-1">{registro.departamento.nombre}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Respuesta:</span>
                  <p className="mt-1">{registro.respuesta}</p>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="font-medium text-gray-600">Pregunta:</span>
                  <p className="mt-1">{registro.pregunta.pregunta}</p>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="font-medium text-gray-600">Observaciones del registro:</span>
                  <p className="mt-1">{registro.observaciones ?? '—'}</p>
                </div>
              </div>

              {/* Estado de verificación */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                {registro.verificaciones.length > 0 ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="text-lg">✓</span>
                    <span className="font-medium">Registro ya verificado</span>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">Verificación</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Estado */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Estado
                          </label>
                          <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Seleccione estado</option>
                            <option value="si">Correcto</option>
                            <option value="no">Incorrecto</option>
                          </select>
                        </div>

                        {/* Observaciones - siempre habilitado */}
                        <div className="space-y-2 md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Observaciones de verificación
                          </label>
                          <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            placeholder="Agregue observaciones si es necesario..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                        </div>
                      </div>

                      {/* Errores */}
                      {error?.errors && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">
                            {Object.values(error.errors).flat().join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Botón */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loadingSubmit || !formData.estado}
                          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          {loadingSubmit ? 'Guardando...' : 'Registrar verificación'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
  
      </div>
    </div>
  );
}