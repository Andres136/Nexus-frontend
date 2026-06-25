import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCapacitaciones } from "../../hooks/capacitaciones/useCapacitaciones";
import {
  useCapacitacionEncuestaResultados,
  useCapacitacionEncuestaUsuarios,
  useCapacitacionEncuestas,
} from "../../hooks/capacitaciones/useCapacitacionEncuestas";

const preguntaBase = () => ({
  _key: crypto.randomUUID(),
  texto: "",
  tipo: "escala",
  opciones: [],
  requerida: true,
  max_escala: 5,
  respuesta_correcta: null,
});

const estadoBadge = {
  activa: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactiva: "bg-slate-100 text-slate-700 border-slate-200",
};

const emptyForm = {
  capacitacion_uuid: "",
  titulo: "",
  descripcion: "",
  estado: "activa",
  preguntas: [preguntaBase()],
};

function normalizePreguntas(preguntas) {
  return preguntas.map((pregunta, index) => {
    const opcionesLimpias = pregunta.tipo === "opcion_multiple"
      ? (pregunta.opciones ?? []).filter((opcion) => opcion.trim())
      : null;
    return {
      texto: pregunta.texto,
      tipo: pregunta.tipo,
      opciones: opcionesLimpias,
      requerida: Boolean(pregunta.requerida),
      max_escala: pregunta.tipo === "escala" ? Number(pregunta.max_escala ?? 5) : null,
      respuesta_correcta: pregunta.tipo === "opcion_multiple"
        ? (opcionesLimpias?.includes(pregunta.respuesta_correcta) ? pregunta.respuesta_correcta : null)
        : null,
      orden: index,
    };
  });
}

function ModalEncuesta({ encuesta, capacitaciones, onClose, onSave, isSaving }) {
  const opcionesCapacitaciones = useMemo(
    () =>
      capacitaciones.map((cap) => ({
        value: cap.uuid,
        label: `${cap.titulo} — ${cap.fecha_realizacion}`,
      })),
    [capacitaciones]
  );

  const [form, setForm] = useState(() => {
    if (!encuesta) return emptyForm;
    return {
      capacitacion_uuid: encuesta.capacitacion?.uuid ?? "",
      titulo: encuesta.titulo ?? "",
      descripcion: encuesta.descripcion ?? "",
      estado: encuesta.estado ?? "activa",
      preguntas: encuesta.preguntas?.length
        ? encuesta.preguntas.map((pregunta) => ({ ...pregunta, _key: crypto.randomUUID() }))
        : [preguntaBase()],
    };
  });

  const updatePregunta = (index, patch) => {
    setForm((current) => ({
      ...current,
      preguntas: current.preguntas.map((pregunta, preguntaIndex) =>
        preguntaIndex === index ? { ...pregunta, ...patch } : pregunta
      ),
    }));
  };

  const removePregunta = (index) => {
    setForm((current) => ({
      ...current,
      preguntas: current.preguntas.filter((_, preguntaIndex) => preguntaIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...(encuesta ? { uuid: encuesta.uuid } : {}),
      data: {
        ...form,
        preguntas: normalizePreguntas(form.preguntas),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-3 py-6">
      <form onSubmit={handleSubmit} className="max-h-full w-full max-w-3xl overflow-auto rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{encuesta ? "Editar encuesta" : "Nueva encuesta"}</h2>
            <p className="text-sm text-slate-500">Asocia la evaluación a una capacitación.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Capacitación
              <Select
                options={opcionesCapacitaciones}
                value={opcionesCapacitaciones.find((o) => o.value === form.capacitacion_uuid) ?? null}
                onChange={(opcion) => setForm((current) => ({ ...current, capacitacion_uuid: opcion?.value ?? "" }))}
                placeholder="Buscar capacitación..."
                isClearable
                isSearchable
                noOptionsMessage={() => "Sin resultados"}
                classNamePrefix="rselect"
                styles={{
                  control: (base) => ({ ...base, minHeight: "38px", fontSize: "0.875rem", borderColor: "#cbd5e1", borderRadius: "6px" }),
                  option: (base) => ({ ...base, fontSize: "0.875rem" }),
                }}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Estado
              <select
                value={form.estado}
                onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Título
            <input
              value={form.titulo}
              onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))}
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Descripción
            <textarea
              value={form.descripcion}
              onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
              rows={3}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-950">Preguntas</h3>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, preguntas: [...current.preguntas, preguntaBase()] }))}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>

            {form.preguntas.map((pregunta, index) => (
              <div key={pregunta._key} className="rounded-md border border-slate-200 p-3">
                <div className="grid gap-3 md:grid-cols-[1fr_170px_auto_auto]">
                  <input
                    value={pregunta.texto}
                    onChange={(event) => updatePregunta(index, { texto: event.target.value })}
                    placeholder={`Pregunta ${index + 1}`}
                    required
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <select
                    value={pregunta.tipo}
                    onChange={(event) => updatePregunta(index, { tipo: event.target.value })}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="escala">Escala</option>
                    <option value="texto">Texto</option>
                    <option value="opcion_multiple">Opción múltiple</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={pregunta.requerida}
                      onChange={(event) => updatePregunta(index, { requerida: event.target.checked })}
                    />
                    Req.
                  </label>
                  <button
                    type="button"
                    onClick={() => removePregunta(index)}
                    disabled={form.preguntas.length === 1}
                    className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {pregunta.tipo === "escala" && (
                  <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    Escala máxima
                    <select
                      value={pregunta.max_escala ?? 5}
                      onChange={(event) => updatePregunta(index, { max_escala: Number(event.target.value) })}
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                    >
                      {[3, 4, 5, 6, 7, 8, 10].map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                )}

                {pregunta.tipo === "opcion_multiple" && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      Opciones — selecciona <span className="text-emerald-700">la respuesta correcta</span>
                    </p>
                    {(pregunta.opciones ?? []).map((opcion, opcionIndex) => (
                      <div key={`${pregunta._key}-${opcionIndex}`} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correcta-${pregunta._key}`}
                          checked={pregunta.respuesta_correcta === opcion && opcion !== ""}
                          onChange={() => updatePregunta(index, { respuesta_correcta: opcion })}
                          className="h-4 w-4 accent-emerald-600"
                          title="Marcar como respuesta correcta"
                        />
                        <input
                          value={opcion}
                          onChange={(event) => {
                            const opciones = [...(pregunta.opciones ?? [])];
                            const esCorrecta = pregunta.respuesta_correcta === opcion;
                            opciones[opcionIndex] = event.target.value;
                            updatePregunta(index, {
                              opciones,
                              ...(esCorrecta ? { respuesta_correcta: event.target.value } : {}),
                            });
                          }}
                          placeholder={`Opción ${opcionIndex + 1}`}
                          className={`flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 ${
                            pregunta.respuesta_correcta === opcion && opcion !== ""
                              ? "border-emerald-400 bg-emerald-50 focus:border-emerald-500"
                              : "border-slate-300 focus:border-blue-500"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const opciones = (pregunta.opciones ?? []).filter((_, i) => i !== opcionIndex);
                            updatePregunta(index, {
                              opciones,
                              ...(pregunta.respuesta_correcta === opcion ? { respuesta_correcta: null } : {}),
                            });
                          }}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => updatePregunta(index, { opciones: [...(pregunta.opciones ?? []), ""] })}
                      className="text-sm font-semibold text-blue-700"
                    >
                      + Agregar opción
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || !form.capacitacion_uuid}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

ModalEncuesta.propTypes = {
  encuesta: PropTypes.shape({
    uuid: PropTypes.string,
    titulo: PropTypes.string,
    descripcion: PropTypes.string,
    estado: PropTypes.string,
    capacitacion: PropTypes.shape({
      uuid: PropTypes.string,
    }),
    preguntas: PropTypes.arrayOf(PropTypes.object),
  }),
  capacitaciones: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

function ModalEnviar({ encuesta, onClose, onEnviar, isEnviando }) {
  const [search, setSearch] = useState("");
  const [selectedMap, setSelectedMap] = useState({});

  const buscarActivo = search.trim().length >= 2;
  const { data: usuarios = [], isLoading } = useCapacitacionEncuestaUsuarios(
    buscarActivo ? { search: search.trim() } : {},
    buscarActivo,
  );

  const toggle = (usuario) => {
    setSelectedMap((current) => {
      const next = { ...current };
      if (next[usuario.id]) {
        delete next[usuario.id];
      } else {
        next[usuario.id] = usuario;
      }
      return next;
    });
  };

  const deseleccionar = (id) => {
    setSelectedMap((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const selectedList = Object.values(selectedMap);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-3 py-6">
      <div className="max-h-full w-full max-w-2xl overflow-auto rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Enviar encuesta</h2>
            <p className="text-sm text-slate-500">{encuesta.titulo}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          {selectedList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 rounded-md border border-blue-100 bg-blue-50 p-2">
              {selectedList.map((u) => (
                <span key={u.id} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2 py-0.5 text-xs font-medium text-blue-800">
                  {u.name}
                  <button type="button" onClick={() => deseleccionar(u.id)} className="ml-0.5 text-blue-400 hover:text-blue-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Escribe nombre o correo para buscar"
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="max-h-80 divide-y divide-slate-100 overflow-auto rounded-md border border-slate-200">
            {!buscarActivo ? (
              <div className="p-4 text-sm text-slate-400">
                Escribe al menos 2 caracteres para buscar usuarios.
              </div>
            ) : isLoading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            ) : usuarios.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No se encontraron usuarios.</div>
            ) : (
              usuarios.map((usuario) => (
                <label key={usuario.id} className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedMap[usuario.id])}
                    onChange={() => toggle(usuario)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-950">{usuario.name}</span>
                    <span className="block truncate text-xs text-slate-500">{usuario.email}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-4">
          <span className="text-sm text-slate-500">
            {selectedList.length} seleccionado{selectedList.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            disabled={selectedList.length === 0 || isEnviando}
            onClick={() => onEnviar(selectedList.map((u) => u.id))}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isEnviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

ModalEnviar.propTypes = {
  encuesta: PropTypes.shape({
    uuid: PropTypes.string,
    titulo: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onEnviar: PropTypes.func.isRequired,
  isEnviando: PropTypes.bool.isRequired,
};

function ModalResultados({ encuesta, onClose }) {
  const { data, isLoading } = useCapacitacionEncuestaResultados(encuesta?.uuid);
  const porcentaje = data?.total_envios ? Math.round((data.total_respondidas / data.total_envios) * 100) : 0;
  const [copiado, setCopiado] = useState(null);

  const copiarLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/capacitacion-encuesta/${token}`);
    setCopiado(token);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-3 py-6">
      <div className="max-h-full w-full max-w-3xl overflow-auto rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Resultados</h2>
            <p className="text-sm text-slate-500">{encuesta?.titulo}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando resultados
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Enviadas</p>
                  <p className="text-2xl font-semibold text-slate-950">{data?.total_envios ?? 0}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Respondidas</p>
                  <p className="text-2xl font-semibold text-slate-950">{data?.total_respondidas ?? 0}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Tasa</p>
                  <p className="text-2xl font-semibold text-slate-950">{porcentaje}%</p>
                </div>
              </div>
              {data?.envios?.length > 0 && (() => {
                const respondieron = data.envios.filter((e) => e.estado === "respondida");
                const pendientes = data.envios.filter((e) => e.estado === "pendiente");
                return (
                  <div className="space-y-2">
                    {respondieron.length > 0 && (
                      <details open className="rounded-md border border-emerald-200 bg-emerald-50">
                        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-semibold text-emerald-800">
                          <UserCheck className="h-4 w-4" />
                          Respondieron ({respondieron.length})
                        </summary>
                        <div className="divide-y divide-emerald-100 border-t border-emerald-200">
                          {respondieron.map((e) => (
                            <div key={e.id} className="flex items-center justify-between px-3 py-2">
                              <span className="text-xs font-medium text-emerald-900">{e.usuario?.name}</span>
                              <span className="text-xs text-emerald-600">{e.usuario?.email}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    {pendientes.length > 0 && (
                      <details className="rounded-md border border-amber-200 bg-amber-50">
                        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-800">
                          <Clock className="h-4 w-4" />
                          Pendientes ({pendientes.length})
                        </summary>
                        <div className="divide-y divide-amber-100 border-t border-amber-200">
                          {pendientes.map((e) => (
                            <div key={e.id} className="flex items-center gap-2 px-3 py-2">
                              <span className="flex-1 truncate text-xs font-medium text-amber-900">{e.usuario?.name}</span>
                              <span className="shrink-0 truncate text-xs text-amber-600">{e.usuario?.email}</span>
                              {e.token && (
                                <button
                                  type="button"
                                  onClick={() => copiarLink(e.token)}
                                  title="Copiar link de encuesta"
                                  className="shrink-0 rounded p-1 text-amber-500 hover:bg-amber-100"
                                >
                                  {copiado === e.token
                                    ? <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-3">
                {(data?.resultados ?? []).map((resultado) => (
                  <div key={resultado.pregunta_id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-slate-950">{resultado.texto}</h3>
                      <span className="text-xs text-slate-500">{resultado.total_respuestas} respuestas</span>
                    </div>
                    {resultado.promedio !== null && (
                      <p className="mt-2 text-sm text-slate-700">Promedio: <strong>{resultado.promedio}</strong></p>
                    )}
                    {resultado.distribucion?.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {resultado.distribucion.map((item) => {
                          const esCorrecta = resultado.respuesta_correcta && item.valor === resultado.respuesta_correcta;
                          return (
                            <div
                              key={item.valor}
                              className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-sm ${
                                esCorrecta
                                  ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-800"
                                  : "border-slate-200 bg-slate-50 text-slate-700"
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {esCorrecta && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                                {item.valor}
                              </span>
                              <span className="text-xs">{item.total}</span>
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
                      <div className="mt-2 space-y-2">
                        {resultado.respuestas_texto.map((texto, index) => (
                          <p key={`${resultado.pregunta_id}-${index}`} className="rounded-md bg-slate-50 p-2 text-sm text-slate-700">
                            {texto}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

ModalResultados.propTypes = {
  encuesta: PropTypes.shape({
    uuid: PropTypes.string,
    titulo: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default function PageCapacitacionEncuestas() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: "", capacitacion_uuid: "", estado: "", page: 1 });

  const updateFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const [modalEncuesta, setModalEncuesta] = useState(false);
  const [editando, setEditando] = useState(null);
  const [enviando, setEnviando] = useState(null);

  const queryFilters = useMemo(() => ({
    search: filters.search || undefined,
    capacitacion_uuid: filters.capacitacion_uuid || undefined,
    estado: filters.estado || undefined,
    page: filters.page,
  }), [filters]);

  const { capacitaciones } = useCapacitaciones({ propias: 1 });
  const {
    encuestas,
    paginacion,
    isLoading,
    isFetching,
    crear,
    isCreando,
    actualizar,
    isActualizando,
    eliminar,
    enviar,
    isEnviando,
  } = useCapacitacionEncuestas(queryFilters);

  const handleSave = ({ uuid, data }) => {
    if (uuid) {
      actualizar({ uuid, data }, { onSuccess: () => { setModalEncuesta(false); setEditando(null); } });
      return;
    }
    crear(data, { onSuccess: () => setModalEncuesta(false) });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <ClipboardList className="h-4 w-4 text-blue-600" />
              Capacitaciones
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Encuestas de capacitación</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/auth/capacitaciones" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
              Calendario
            </Link>
            <button
              type="button"
              onClick={() => { setEditando(null); setModalEncuesta(true); }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nueva encuesta
            </button>
          </div>
        </header>

        <section className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[1fr_1fr_180px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Buscar encuesta o capacitación"
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <select
            value={filters.capacitacion_uuid}
            onChange={(event) => updateFilter("capacitacion_uuid", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Todas las capacitaciones</option>
            {capacitaciones.map((capacitacion) => (
              <option key={capacitacion.uuid} value={capacitacion.uuid}>{capacitacion.titulo}</option>
            ))}
          </select>
          <select
            value={filters.estado}
            onChange={(event) => updateFilter("estado", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
          </select>
        </section>

        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-950">Encuestas</h2>
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando encuestas
            </div>
          ) : encuestas.length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-500">No hay encuestas con estos filtros.</div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {encuestas.map((encuesta) => (
                  <article key={encuesta.uuid} className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-950">{encuesta.titulo}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${estadoBadge[encuesta.estado] ?? estadoBadge.inactiva}`}>
                          {encuesta.estado}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{encuesta.capacitacion?.titulo}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{encuesta.preguntas?.length ?? 0} preguntas</span>
                        <span>{encuesta.envios_count ?? 0} enviadas</span>
                        <span>{encuesta.respondidas_count ?? 0} respondidas</span>
                        <span>{encuesta.porcentaje_respuesta ?? 0}% respuesta</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEnviando(encuesta)}
                        className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        <Mail className="h-4 w-4" />
                        Enviar
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/auth/capacitaciones/encuestas/${encuesta.uuid}/resultados`)}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Resultados
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditando(encuesta); setModalEncuesta(true); }}
                        className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(encuesta.uuid)}
                        className="rounded-md border border-red-200 p-2 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {paginacion && paginacion.ultimaPagina > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    {paginacion.total} encuesta{paginacion.total !== 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters((c) => ({ ...c, page: c.page - 1 }))}
                      className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[80px] text-center text-sm text-slate-700">
                      {filters.page} / {paginacion.ultimaPagina}
                    </span>
                    <button
                      type="button"
                      disabled={filters.page >= paginacion.ultimaPagina}
                      onClick={() => setFilters((c) => ({ ...c, page: c.page + 1 }))}
                      className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {modalEncuesta && (
        <ModalEncuesta
          encuesta={editando}
          capacitaciones={capacitaciones}
          onClose={() => { setModalEncuesta(false); setEditando(null); }}
          onSave={handleSave}
          isSaving={isCreando || isActualizando}
        />
      )}

      {enviando && (
        <ModalEnviar
          encuesta={enviando}
          onClose={() => setEnviando(null)}
          isEnviando={isEnviando}
          onEnviar={(userIds) => enviar({ uuid: enviando.uuid, userIds }, { onSuccess: () => setEnviando(null) })}
        />
      )}

    </div>
  );
}
