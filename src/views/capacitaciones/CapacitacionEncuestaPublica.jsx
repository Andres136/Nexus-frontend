import { useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, ClipboardList, Loader2 } from "lucide-react";
import { useCapacitacionEncuestaPublica } from "../../hooks/capacitaciones/useCapacitacionEncuestas";

function PreguntaInput({ pregunta, valor, onChange }) {
  if (pregunta.tipo === "texto") {
    return (
      <textarea
        value={valor ?? ""}
        onChange={(event) => onChange(pregunta.id, event.target.value)}
        rows={3}
        className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        placeholder="Escribe tu respuesta"
      />
    );
  }

  if (pregunta.tipo === "opcion_multiple") {
    return (
      <div className="space-y-2">
        {(pregunta.opciones ?? []).map((opcion) => (
          <button
            key={opcion}
            type="button"
            onClick={() => onChange(pregunta.id, opcion)}
            className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
              valor === opcion ? "border-green-700 bg-green-50 text-green-800" : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {opcion}
          </button>
        ))}
      </div>
    );
  }

  const max = pregunta.max_escala ?? 5;
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: max }, (_, index) => index + 1).map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onChange(pregunta.id, String(number))}
          className={`h-11 w-11 rounded-full border text-sm font-semibold transition ${
            valor === String(number) ? "border-green-700 bg-green-700 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {number}
        </button>
      ))}
      <div className="flex w-full justify-between text-xs text-slate-400">
        <span>Muy bajo</span>
        <span>Excelente</span>
      </div>
    </div>
  );
}

PreguntaInput.propTypes = {
  pregunta: PropTypes.shape({
    id: PropTypes.number.isRequired,
    tipo: PropTypes.string.isRequired,
    opciones: PropTypes.arrayOf(PropTypes.string),
    max_escala: PropTypes.number,
  }).isRequired,
  valor: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default function CapacitacionEncuestaPublica() {
  const { token } = useParams();
  const { encuesta, usuario, isLoading, isError, errorStatus, responder, isEnviando, respondida } =
    useCapacitacionEncuestaPublica(token);
  const [respuestas, setRespuestas] = useState({});

  const preguntas = encuesta?.preguntas ?? [];
  const requeridas = preguntas.filter((pregunta) => pregunta.requerida);
  const respondidas = requeridas.filter((pregunta) => respuestas[pregunta.id]).length;
  const lista = Object.entries(respuestas).map(([pregunta_id, valor]) => ({
    pregunta_id: Number(pregunta_id),
    valor,
  }));

  const handleSubmit = (event) => {
    event.preventDefault();
    responder(lista);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-lg font-semibold text-slate-950">
            {errorStatus === 410 ? "Encuesta ya respondida" : "Enlace no válido"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">Este enlace ya no está disponible.</p>
        </div>
      </div>
    );
  }

  if (respondida) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-4 text-xl font-semibold text-slate-950">Gracias por responder</h1>
          <p className="mt-2 text-sm text-slate-500">Tu evaluación quedó registrada correctamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-green-50 p-2 text-green-700">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-950">{encuesta?.titulo}</h1>
              <p className="mt-1 text-sm text-slate-500">Para: {usuario?.name}</p>
              {encuesta?.capacitacion?.titulo && (
                <p className="mt-1 text-sm text-slate-600">Capacitación: {encuesta.capacitacion.titulo}</p>
              )}
            </div>
          </div>
          {encuesta?.descripcion && <p className="mt-4 text-sm leading-6 text-slate-600">{encuesta.descripcion}</p>}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-green-700 transition-all"
              style={{ width: `${requeridas.length ? (respondidas / requeridas.length) * 100 : 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">{respondidas}/{requeridas.length} requeridas</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-4">
          {preguntas.map((pregunta, index) => (
            <section key={pregunta.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-slate-950">
                {index + 1}. {pregunta.texto}
                {pregunta.requerida && <span className="ml-1 text-red-500">*</span>}
              </p>
              <PreguntaInput
                pregunta={pregunta}
                valor={respuestas[pregunta.id]}
                onChange={(preguntaId, valor) => setRespuestas((current) => ({ ...current, [preguntaId]: valor }))}
              />
            </section>
          ))}
          <button
            type="submit"
            disabled={isEnviando || respondidas < requeridas.length}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:bg-slate-300"
          >
            {isEnviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Enviar respuestas
          </button>
        </form>
      </div>
    </div>
  );
}
