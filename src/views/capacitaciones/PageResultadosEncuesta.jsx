import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  ClipboardList,
  Copy,
  Loader2,
  Search,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useCapacitacionEncuestaResultados } from "../../hooks/capacitaciones/useCapacitacionEncuestas";

function barColor(pct) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-blue-500";
  if (pct >= 40) return "bg-amber-400";
  return "bg-red-400";
}

function EficienciaBar({ valor, label }) {
  const color = barColor(valor);
  return (
    <div className="space-y-1">
      {label && <p className="text-xs text-slate-500">{label}</p>}
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${valor}%` }} />
        </div>
        <span className="w-10 text-right text-xs font-semibold text-slate-700">{Math.round(valor)}%</span>
      </div>
    </div>
  );
}

export default function PageResultadosEncuesta() {
  const { uuid } = useParams();
  const { data, isLoading } = useCapacitacionEncuestaResultados(uuid);
  const [search, setSearch] = useState("");
  const [copiado, setCopiado] = useState(null);

  const copiarLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/capacitacion-encuesta/${token}`);
    setCopiado(token);
    setTimeout(() => setCopiado(null), 2000);
  };

  const maxEscalaMap = useMemo(() => {
    const map = {};
    (data?.encuesta?.preguntas ?? []).forEach((p) => {
      map[p.id] = p.max_escala ?? 5;
    });
    return map;
  }, [data]);

  const eficienciaPorPregunta = useMemo(() => {
    return (data?.resultados ?? []).map((r) => {
      let eficiencia = null;
      if (r.tipo === "escala" && r.promedio !== null && r.total_respuestas > 0) {
        const max = maxEscalaMap[r.pregunta_id] ?? 5;
        eficiencia = (r.promedio / max) * 100;
      } else if (r.tipo === "opcion_multiple" && r.respuesta_correcta && r.total_respuestas > 0) {
        eficiencia = ((r.aciertos ?? 0) / r.total_respuestas) * 100;
      }
      return { ...r, eficiencia };
    });
  }, [data, maxEscalaMap]);

  const eficienciaGlobal = useMemo(() => {
    const conValor = eficienciaPorPregunta.filter((r) => r.eficiencia !== null);
    if (!conValor.length) return null;
    return conValor.reduce((sum, r) => sum + r.eficiencia, 0) / conValor.length;
  }, [eficienciaPorPregunta]);

  const tasaRespuesta = data?.total_envios
    ? Math.round((data.total_respondidas / data.total_envios) * 100)
    : 0;

  const searchLower = search.toLowerCase().trim();
  const respondieron = (data?.envios ?? []).filter((e) => e.estado === "respondida");
  const pendientes = (data?.envios ?? []).filter((e) => e.estado === "pendiente");

  const filtrarEnvios = (lista) =>
    searchLower
      ? lista.filter(
          (e) =>
            e.usuario?.name?.toLowerCase().includes(searchLower) ||
            e.usuario?.email?.toLowerCase().includes(searchLower)
        )
      : lista;

  const respondieronFiltrados = filtrarEnvios(respondieron);
  const pendientesFiltrados = filtrarEnvios(pendientes);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando resultados...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Header */}
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              to="/auth/capacitaciones/encuestas"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Encuestas
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {data?.encuesta?.titulo ?? "Resultados"}
            </h1>
            {data?.encuesta?.capacitacion?.titulo && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                <ClipboardList className="h-4 w-4" />
                {data.encuesta.capacitacion.titulo}
              </p>
            )}
          </div>
        </header>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Users className="h-4 w-4 text-blue-500" />
              Enviadas
            </div>
            <p className="mt-1 text-3xl font-bold text-slate-950">{data?.total_envios ?? 0}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              Respondidas
            </div>
            <p className="mt-1 text-3xl font-bold text-slate-950">{data?.total_respondidas ?? 0}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Tasa de respuesta
            </div>
            <p className="mt-1 text-3xl font-bold text-slate-950">{tasaRespuesta}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${barColor(tasaRespuesta)}`} style={{ width: `${tasaRespuesta}%` }} />
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Target className="h-4 w-4 text-amber-500" />
              Eficiencia global
            </div>
            {eficienciaGlobal !== null ? (
              <>
                <p className="mt-1 text-3xl font-bold text-slate-950">{Math.round(eficienciaGlobal)}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${barColor(eficienciaGlobal)}`} style={{ width: `${eficienciaGlobal}%` }} />
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-400">Sin preguntas medibles</p>
            )}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">

          {/* Resultados por pregunta */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Resultados por pregunta
            </h2>

            {eficienciaPorPregunta.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
                Sin preguntas registradas.
              </div>
            ) : (
              eficienciaPorPregunta.map((resultado, index) => (
                <div key={resultado.pregunta_id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {index + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-950">{resultado.texto}</h3>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{resultado.total_respuestas} resp.</span>
                  </div>

                  {resultado.eficiencia !== null && (
                    <div className="mt-3">
                      <EficienciaBar valor={resultado.eficiencia} label="Eficiencia" />
                    </div>
                  )}

                  {resultado.tipo === "escala" && resultado.promedio !== null && (
                    <p className="mt-2 text-sm text-slate-600">
                      Promedio:{" "}
                      <strong>{resultado.promedio}</strong>
                      <span className="text-slate-400"> / {maxEscalaMap[resultado.pregunta_id] ?? 5}</span>
                    </p>
                  )}

                  {resultado.distribucion?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {resultado.distribucion.map((item) => {
                        const esCorrecta = resultado.respuesta_correcta && item.valor === resultado.respuesta_correcta;
                        const pctItem = resultado.total_respuestas > 0
                          ? Math.round((item.total / resultado.total_respuestas) * 100)
                          : 0;
                        return (
                          <div key={item.valor} className={`rounded-md border px-3 py-2 ${esCorrecta ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                            <div className="flex items-center justify-between text-sm">
                              <span className={`flex items-center gap-1.5 font-medium ${esCorrecta ? "text-emerald-800" : "text-slate-700"}`}>
                                {esCorrecta && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                                {item.valor}
                              </span>
                              <span className="text-xs text-slate-500">{item.total} ({pctItem}%)</span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/70">
                              <div
                                className={`h-full rounded-full ${esCorrecta ? "bg-emerald-400" : "bg-slate-300"}`}
                                style={{ width: `${pctItem}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {resultado.aciertos !== null && resultado.total_respuestas > 0 && (
                        <p className="pt-1 text-xs text-slate-500">
                          Aciertos: {resultado.aciertos}/{resultado.total_respuestas}{" "}
                          ({Math.round((resultado.aciertos / resultado.total_respuestas) * 100)}%)
                        </p>
                      )}
                    </div>
                  )}

                  {resultado.respuestas_texto?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {resultado.respuestas_texto.map((texto, i) => (
                        <p key={i} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{texto}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

          {/* Participantes */}
          <aside className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Users className="h-4 w-4 text-blue-600" />
              Participantes
            </h2>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o correo"
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Respondieron */}
            <div className="rounded-md border border-emerald-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-emerald-100 px-4 py-3">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  Respondieron ({respondieronFiltrados.length}{search ? ` de ${respondieron.length}` : ""})
                </span>
              </div>
              <div className="max-h-72 divide-y divide-slate-100 overflow-auto">
                {respondieronFiltrados.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    {search ? "Sin resultados." : "Ninguno respondió aún."}
                  </p>
                ) : (
                  respondieronFiltrados.map((envio) => (
                    <div key={envio.id} className="flex items-center justify-between px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{envio.usuario?.name}</p>
                        <p className="truncate text-xs text-slate-500">{envio.usuario?.email}</p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pendientes */}
            <div className="rounded-md border border-amber-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-amber-100 px-4 py-3">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  Pendientes ({pendientesFiltrados.length}{search ? ` de ${pendientes.length}` : ""})
                </span>
              </div>
              <div className="max-h-72 divide-y divide-slate-100 overflow-auto">
                {pendientesFiltrados.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    {search ? "Sin resultados." : "Todos respondieron."}
                  </p>
                ) : (
                  pendientesFiltrados.map((envio) => (
                    <div key={envio.id} className="flex items-center gap-2 px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{envio.usuario?.name}</p>
                        <p className="truncate text-xs text-slate-500">{envio.usuario?.email}</p>
                      </div>
                      <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                      {envio.token && (
                        <button
                          type="button"
                          onClick={() => copiarLink(envio.token)}
                          title="Copiar link de encuesta"
                          className="shrink-0 rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                        >
                          {copiado === envio.token
                            ? <Check className="h-3.5 w-3.5 text-emerald-600" />
                            : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
