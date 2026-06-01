import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEncuestas } from "../../hooks/crm/useEncuestas";
import { useEncuestaResultados } from "../../hooks/crm/useEncuestaResultados";
import { useEncuestaContext } from "../../context/EncuestaContext";
import { useAuth } from "../../hooks/useAuth";
import GraficaResultados from "../../components/encuestas/GraficaResultados";
import { encuestaService } from "../../services/encuestaService";
import {
  BarChart2, ChevronDown, Loader2, BarChart, Users, Send, Smile,
  Clock, ChevronUp, Filter, TrendingUp,
} from "lucide-react";

const ROLES_RESULTADOS = [1, 4]; // ADMINISTRADOR, ADMINISTRATIVO

function nivelSatisfaccion(pct) {
  if (pct >= 80) return { label: "Excelente",  bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200" };
  if (pct >= 60) return { label: "Bueno",      bar: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200"    };
  if (pct >= 40) return { label: "Regular",    bar: "bg-amber-500",   text: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200"   };
  return           { label: "Bajo",         bar: "bg-red-500",     text: "text-red-600",     bg: "bg-red-50",      border: "border-red-200"     };
}

export default function ResultadosEncuesta() {
  const { user } = useAuth({ middleware: "auth" });
  const { encuestas, isLoading: cargandoLista } = useEncuestas();
  const { encuestaSeleccionada, limpiar } = useEncuestaContext();
  const [encuestaId, setEncuestaId]     = useState(encuestaSeleccionada?.id ?? null);
  const [filtroUserId, setFiltroUserId] = useState(null);
  const [mostrarPendientes, setMostrarPendientes] = useState(false);

  useEffect(() => {
    if (encuestaSeleccionada) limpiar();
  }, []);

  // Reset filtro al cambiar encuesta
  useEffect(() => {
    setFiltroUserId(null);
    setMostrarPendientes(false);
  }, [encuestaId]);

  const { resultados, isLoading, isError } = useEncuestaResultados(encuestaId, filtroUserId);

  const puedeVerResultados = ROLES_RESULTADOS.includes(user?.role_id);

  const { data: indiceGen } = useQuery({
    queryKey: ["encuestas-indice-general"],
    queryFn: async () => {
      const res = await encuestaService.getIndiceGeneral();
      return res.data;
    },
    enabled: puedeVerResultados,
    staleTime: 2 * 60 * 1000,
  });

  // Guard de rol
  if (user && !puedeVerResultados) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <div className="bg-red-100 p-4 rounded-full">
          <BarChart2 className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-800">Acceso restringido</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Solo el Administrador y el Administrativo pueden ver los resultados de encuestas.
        </p>
      </div>
    );
  }

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

      {/* Índice general de satisfacción */}
      {indiceGen && (() => {
        const sinDatos = indiceGen.indice_general === null;
        const nivel    = sinDatos ? null : nivelSatisfaccion(indiceGen.indice_general);
        return (
          <div className={`rounded-xl border p-5 ${sinDatos ? "bg-gray-50 border-gray-200" : `${nivel.bg} ${nivel.border}`}`}>
            <div className="flex items-center justify-between gap-6">

              {/* Ícono + etiqueta */}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shadow-sm ${sinDatos ? "bg-white" : "bg-white"}`}>
                  <TrendingUp className={`w-6 h-6 ${sinDatos ? "text-gray-400" : nivel.text}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Satisfacción general
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sinDatos
                      ? "Aún no hay respuestas de escala registradas"
                      : `${indiceGen.respuestas_positivas} de ${indiceGen.total_respuestas} respuestas positivas en ${indiceGen.encuestas_con_datos} encuesta${indiceGen.encuestas_con_datos !== 1 ? "s" : ""}`
                    }
                  </p>
                </div>
              </div>

              {/* Porcentaje */}
              {!sinDatos && (
                <div className="text-right shrink-0">
                  <p className={`text-5xl font-black ${nivel.text}`}>
                    {indiceGen.indice_general}%
                  </p>
                  <p className={`text-xs font-bold ${nivel.text} mt-0.5`}>
                    {nivel.label}
                  </p>
                </div>
              )}
            </div>

            {/* Barra */}
            {!sinDatos && (
              <div className="mt-4 h-3 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${nivel.bar} rounded-full transition-all duration-700`}
                  style={{ width: `${indiceGen.indice_general}%` }}
                />
              </div>
            )}
          </div>
        );
      })()}

      {/* Selector de encuesta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <div>
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

        {/* Filtro por usuario que envió */}
        {resultados?.usuarios_remitentes?.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Filter className="w-3.5 h-3.5" /> Filtrar por usuario que envió
            </label>
            <div className="relative">
              <select
                value={filtroUserId ?? ""}
                onChange={(e) => setFiltroUserId(e.target.value ? Number(e.target.value) : null)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm
                  focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
              >
                <option value="">— Todos los usuarios —</option>
                {resultados.usuarios_remitentes.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
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

      {/* Error (403 incluido) */}
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
                    <div className="p-2.5 rounded-xl bg-white shadow-sm">
                      <Smile className={`w-5 h-5 ${nivel.text}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Índice de satisfacción
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Respuestas en el tramo alto de las preguntas de escala
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
                label: "Pendientes",
                valor: resultados.clientes_pendientes?.length ?? 0,
                icon: Clock,
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

          {/* Clientes pendientes */}
          {resultados.clientes_pendientes?.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setMostrarPendientes((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">
                    Clientes que no han respondido ({resultados.clientes_pendientes.length})
                  </span>
                </div>
                {mostrarPendientes
                  ? <ChevronUp className="w-4 h-4 text-amber-400" />
                  : <ChevronDown className="w-4 h-4 text-amber-400" />
                }
              </button>

              {mostrarPendientes && (
                <ul className="divide-y divide-amber-50 max-h-64 overflow-y-auto">
                  {resultados.clientes_pendientes.map((c, i) => (
                    <li key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{c.nombre}</p>
                        {c.email && (
                          <p className="text-xs text-gray-400 truncate">{c.email}</p>
                        )}
                      </div>
                      {c.enviado_el && (
                        <span className="text-xs text-gray-400 shrink-0">
                          Enviado: {c.enviado_el}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

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
