import { useParams } from "react-router-dom";
import { useEncuestaPublica } from "../../hooks/crm/useEncuestaPublica";
import { useState } from "react";
import { ClipboardList, CheckCircle2, AlertCircle, Loader2, Star } from "lucide-react";

// ─── Pregunta según tipo ──────────────────────────────────────────────────────
function PreguntaInput({ pregunta, valor, onChange }) {
  if (pregunta.tipo === "texto") {
    return (
      <textarea
        value={valor ?? ""}
        onChange={(e) => onChange(pregunta.id, e.target.value)}
        rows={3}
        placeholder="Escribe tu respuesta..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    );
  }

  if (pregunta.tipo === "escala") {
    const maxEscala = pregunta.max_escala ?? 5;
    return (
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: maxEscala }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(pregunta.id, String(n))}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-base transition-all
              ${valor === String(n)
                ? "border-emerald-600 bg-emerald-600 text-white scale-110 shadow-md"
                : "border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600"
              }`}
          >
            {n}
          </button>
        ))}
        <div className="w-full flex justify-between text-xs text-gray-400 px-1">
          <span>Muy malo</span>
          <span>Excelente</span>
        </div>
      </div>
    );
  }

  if (pregunta.tipo === "opcion_multiple") {
    return (
      <div className="space-y-2">
        {(pregunta.opciones ?? []).map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => onChange(pregunta.id, op)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-all
              ${valor === op
                ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-medium"
                : "border-gray-200 text-gray-700 hover:border-emerald-300"
              }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all
              ${valor === op ? "border-emerald-600 bg-emerald-600" : "border-gray-300"}`}
            />
            {op}
          </button>
        ))}
      </div>
    );
  }

  return null;
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export default function EncuestaPublica() {
  const { token } = useParams();
  const { encuesta, cliente, isLoading, isError, errorStatus, responder, isEnviando, respondida, yaRespondida } =
    useEncuestaPublica(token);

  const [respuestas, setRespuestas] = useState({});

  const handleChange = (preguntaId, valor) =>
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = Object.entries(respuestas).map(([pregunta_id, valor]) => ({
      pregunta_id: Number(pregunta_id),
      valor,
    }));
    responder(payload);
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // ── Error / token inválido ──
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-800">
            {errorStatus === 404 ? "Enlace no válido" : "Error al cargar la encuesta"}
          </h2>
          <p className="text-sm text-gray-500">
            {errorStatus === 404
              ? "Este enlace no existe o ya fue respondido."
              : "Intenta de nuevo más tarde."}
          </p>
        </div>
      </div>
    );
  }

  // ── Ya respondida (del servidor) o acaba de responder ──
  if (yaRespondida || respondida) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">¡Gracias por responder!</h2>
          <p className="text-sm text-gray-500">
            Tu opinión ha sido registrada. Nos ayuda a mejorar nuestro servicio.
          </p>
        </div>
      </div>
    );
  }

  const preguntas = encuesta?.preguntas ?? [];
  const totalRequeridas = preguntas.filter((p) => p.requerida).length;
  const respondidas = preguntas.filter((p) => p.requerida && respuestas[p.id]).length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 p-2.5 rounded-xl">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{encuesta?.titulo}</h1>
              {cliente?.nombre && (
                <p className="text-xs text-gray-400">Para: {cliente.nombre}</p>
              )}
            </div>
          </div>

          {encuesta?.descripcion && (
            <p className="text-sm text-gray-600 leading-relaxed">{encuesta.descripcion}</p>
          )}

          {/* Progreso */}
          {totalRequeridas > 0 && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progreso</span>
                <span>{respondidas}/{totalRequeridas} requeridas</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${totalRequeridas > 0 ? (respondidas / totalRequeridas) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Preguntas */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {preguntas.map((pregunta, i) => (
            <div key={pregunta.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-gray-400 mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-sm font-semibold text-gray-800 leading-snug">
                  {pregunta.texto}
                  {pregunta.requerida && <span className="text-red-400 ml-1">*</span>}
                </p>
              </div>

              <PreguntaInput
                pregunta={pregunta}
                valor={respuestas[pregunta.id]}
                onChange={handleChange}
              />
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={isEnviando || respondidas < totalRequeridas}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400
              text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isEnviando ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : (
              "Enviar respuestas"
            )}
          </button>

          {respondidas < totalRequeridas && (
            <p className="text-center text-xs text-gray-400">
              Responde las {totalRequeridas - respondidas} pregunta{totalRequeridas - respondidas !== 1 ? "s" : ""} requerida{totalRequeridas - respondidas !== 1 ? "s" : ""} restante{totalRequeridas - respondidas !== 1 ? "s" : ""}
            </p>
          )}
        </form>

        <p className="text-center text-xs text-gray-300 pb-4">
          Tus respuestas son confidenciales — este enlace expira una vez respondido.
        </p>
      </div>
    </div>
  );
}
