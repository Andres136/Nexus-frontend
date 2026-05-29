import { useState, useEffect } from "react";
import { useEncuestas } from "../../hooks/crm/useEncuestas";
import { useEncuestaResultados } from "../../hooks/crm/useEncuestaResultados";
import { useEncuestaContext } from "../../context/EncuestaContext";
import GraficaResultados from "../../components/encuestas/GraficaResultados";
import { BarChart2, ChevronDown, Loader2, BarChart, Users, Send, Smile } from "lucide-react";

function nivelSatisfaccion(pct) {
  if (pct >= 80) return { label: "Excelente",  bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200" };
  if (pct >= 60) return { label: "Bueno",      bar: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200"    };
  if (pct >= 40) return { label: "Regular",    bar: "bg-amber-500",   text: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200"   };
  return           { label: "Bajo",         bar: "bg-red-500",     text: "text-red-600",     bg: "bg-red-50",      border: "border-red-200"     };
}

export default function ResultadosEncuesta() {
  const { encuestas, isLoading: cargandoLista } = useEncuestas();
  const { encuestaSeleccionada, limpiar } = useEncuestaContext();
  const [encuestaId, setEncuestaId] = useState(encuestaSeleccionada?.id ?? null);

  // Si viene con encuesta pre-seleccionada desde EncuestasPage, la limpia del contexto
  useEffect(() => {
    if (encuestaSeleccionada) limpiar();
  }, []);
  const { resultados, isLoading, isError } = useEncuestaResultados(encuestaId);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="bg-violet-100 p-2 rounded-lg">
          <BarChart2 className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Resultados de encuestas</h2>
          <p className="text-xs text-gray-400">Selecciona una encuesta para ver las respuestas</p>
        </div>
      </div>

      {/* Selector de encuesta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
          Encuesta
        </label>
        <div className="relative">
          <select
            value={encuestaId ?? ""}
            onChange={(e) => setEncuestaId(e.target.value ? Number(e.target.value) : null)}
            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
          >
            <option value="">— Selecciona una encuesta —</option>
            {encuestas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.titulo}
                {e.estado === "inactiva" ? " (inactiva)" : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Sin selección */}
      {!encuestaId && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300 gap-3">
          <BarChart className="w-10 h-10" />
          <p className="text-sm">Selecciona una encuesta para ver sus resultados</p>
        </div>
      )}

      {/* Loading */}
      {encuestaId && isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
        </div>
      )}

      {/* Error */}
      {encuestaId && isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-600 text-center">
          No se pudieron cargar los resultados.
        </div>
      )}

      {/* Resultados */}
      {resultados && (
        <div className="space-y-5">

          {/* Índice de satisfacción */}
          {resultados.indice_satisfaccion !== null && resultados.indice_satisfaccion !== undefined && (() => {
            const nivel = nivelSatisfaccion(resultados.indice_satisfaccion);
            return (
              <div className={`border ${nivel.border} ${nivel.bg} rounded-xl p-5`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-white shadow-sm`}>
                      <Smile className={`w-5 h-5 ${nivel.text}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Índice de satisfacción
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Respuestas con puntuación 4 o 5 sobre preguntas de escala
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-4xl font-black ${nivel.text}`}>
                      {resultados.indice_satisfaccion}%
                    </p>
                    <p className={`text-xs font-semibold ${nivel.text} mt-0.5`}>
                      {nivel.label}
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2.5 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${nivel.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${resultados.indice_satisfaccion}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total enviadas",
                valor: resultados.total_envios,
                icon: Send,
                color: "text-blue-600 bg-blue-50",
              },
              {
                label: "Respondidas",
                valor: resultados.total_respondidas,
                icon: Users,
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                label: "Tasa respuesta",
                valor: `${resultados.tasa_respuesta}%`,
                icon: BarChart2,
                color: "text-violet-600 bg-violet-50",
              },
              {
                label: "Preguntas",
                valor: resultados.preguntas?.length ?? 0,
                icon: BarChart,
                color: "text-amber-600 bg-amber-50",
              },
            ].map(({ label, valor, icon: Icono, color }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icono className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{valor}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progreso tasa */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Tasa de respuesta</span>
              <span className="font-bold text-violet-600">{resultados.tasa_respuesta}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${resultados.tasa_respuesta}%` }}
              />
            </div>
          </div>

          {/* Gráficas por pregunta */}
          <div className="space-y-4">
            {(resultados.preguntas ?? []).map((pregunta) => (
              <GraficaResultados key={pregunta.pregunta_id} pregunta={pregunta} />
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
