import { usePreguntas } from '../../hooks/RegistroDiario/UsePreguntas'
import { useGestionProcesos } from '../../hooks/useGestionProcesos'
import Select from 'react-select'

export default function RegisterPreguntas() {
  const {
    formData,
    loading,
    error,
    handleChange,
    handlePreguntaChange,
    handleSubmit,
    addPregunta,
    removePregunta,
  } = usePreguntas()

  const { departamentos } = useGestionProcesos()

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Registrar Preguntas</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Departamento */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Departamento
          </label>
          <Select
            options={departamentos.map(d => ({
              value: d.id,
              label: d.nombre,
            }))}
            placeholder="Seleccione un departamento"
            onChange={(opt) =>
              handleChange({
                target: {
                  name: 'departamento_id',
                  value: opt.value,
                },
              })
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

        {/* Preguntas dinámicas */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Preguntas
          </label>
          
          {formData.preguntas.map((p, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={p.pregunta}
                  onChange={(e) =>
                    handlePreguntaChange(index, e.target.value)
                  }
                  placeholder={`Pregunta ${index + 1}`}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    error?.errors?.[`preguntas.${index}.pregunta`] 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                />
                {error?.errors?.[`preguntas.${index}.pregunta`] && (
                  <p className="text-sm text-red-600 mt-1">
                    {error.errors[`preguntas.${index}.pregunta`][0]}
                  </p>
                )}
              </div>

              {formData.preguntas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePregunta(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar pregunta"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button 
            type="button" 
            onClick={addPregunta}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
          >
            <span>+</span>
            Agregar pregunta
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Guardando...' : 'Guardar Preguntas'}
          </button>
        </div>
      </form>
    </div>
  )
}