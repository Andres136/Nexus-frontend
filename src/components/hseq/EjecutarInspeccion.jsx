import { useState } from "react";
import { useGetPreguntasInspeccionById } from "../../hooks/hseq/useGetPreguntasInspeccionById";
import { useRegistrarRespuestasInspeccion } from "../../hooks/hseq/useRegistrarRespuestasInspecion";
import PropTypes from "prop-types";
import { ClipboardCheck, Loader2, AlertCircle, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import Swal from "sweetalert2";

export default function EjecutarInspeccion({ inspeccion }) {
  const [respuestas, setRespuestas] = useState({});
  const [observaciones, setObservaciones] = useState({});

  const { data: preguntas = [], isLoading, error } =
    useGetPreguntasInspeccionById(inspeccion.tipo_inspeccion_id);

  const { mutate, isPending } = useRegistrarRespuestasInspeccion();

  const handleChange = (preguntaId, value) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: value,
    }));
  };

  const handleObservacion = (preguntaId, value) => {
    setObservaciones((prev) => ({
      ...prev,
      [preguntaId]: value,
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(respuestas).length === 0) {
     Swal.fire({
        icon: 'warning',
        title: 'No hay respuestas',
        text: 'Por favor, responda al menos una pregunta antes de guardar.',
      });
      return;
    }

    const payload = {
      inspeccion_id: Number(inspeccion.fullData.id),
      respuestas: Object.entries(respuestas).map(([preguntaId, value]) => ({
        pregunta_inspeccion_id: Number(preguntaId),
        respuesta: value,
        observaciones: observaciones[preguntaId] || null,
      })),
    };

    mutate(payload);
  };

  const progreso = preguntas.length > 0 
    ? Math.round((Object.keys(respuestas).length / preguntas.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="mt-3 text-gray-600">Cargando preguntas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-600">
        <AlertCircle className="w-8 h-8" />
        <p className="mt-3">Error al cargar preguntas</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {inspeccion.tipo}
          </h2>
          <p className="text-sm text-gray-500">
            {preguntas.length} preguntas
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progreso</span>
          <span className="font-medium text-gray-900">{progreso}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Preguntas */}
      {preguntas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay preguntas configuradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {preguntas.map((p, index) => (
            <div 
              key={p.id} 
              className={`p-4 rounded-xl border transition-all ${
                respuestas[p.id] !== undefined 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <label className="block font-medium text-gray-800 mb-3">
                    {p.pregunta}
                  </label>

                  {/* Tipo SI/NO */}
                  {p.tipo_respuesta === 1 && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleChange(p.id, "1")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                          respuestas[p.id] === "1"
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Sí
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange(p.id, "0")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                          respuestas[p.id] === "0"
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        No
                      </button>
                    </div>
                  )}

                  {/* Tipo número */}
                  {p.tipo_respuesta === 2 && (
                    <input
                      type="number"
                      placeholder="Ingrese un número"
                      className="w-full sm:w-48 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={respuestas[p.id] || ''}
                      onChange={(e) => handleChange(p.id, e.target.value)}
                    />
                  )}

                  {/* Tipo texto */}
                  {p.tipo_respuesta === 3 && (
                    <input
                      type="text"
                      placeholder="Escriba su respuesta"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={respuestas[p.id] || ''}
                      onChange={(e) => handleChange(p.id, e.target.value)}
                    />
                  )}

                  {/* Campo de Observaciones */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Observaciones (opcional)</span>
                    </div>
                    <textarea
                      placeholder="Agregar observación..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      value={observaciones[p.id] || ''}
                      onChange={(e) => handleObservacion(p.id, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón Guardar */}
      <div className="sticky bottom-0 pt-4 pb-2 mt-6 bg-gradient-to-t from-white via-white">
        <button
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all"
          onClick={handleSubmit}
          disabled={isPending || Object.keys(respuestas).length === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Guardar respuestas
            </>
          )}
        </button>
      </div>
    </div>
  );
}

EjecutarInspeccion.propTypes = {
  inspeccion: PropTypes.shape({
    id: PropTypes.number,
    tipo_inspeccion_id: PropTypes.number.isRequired,
    tipo: PropTypes.string.isRequired,
    fullData: PropTypes.object,
  }).isRequired,
};