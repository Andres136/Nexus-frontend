import PropTypes from "prop-types";
import { Calendar, Search } from "lucide-react";

export function SolicitudesFiltros({
  filtros,
  empleados,
  sedes,
  estados,
  total,
}) {
  const { values, actions } = filtros;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={values.search}
          onChange={(event) => actions.setSearch(event.target.value)}
          placeholder="Buscar empleado..."
          className="h-9 w-56 rounded-lg border border-gray-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <select
        value={values.userId}
        onChange={(event) => actions.setUserId(event.target.value)}
        className="h-9 max-w-64 rounded-lg border border-gray-200 bg-white px-3 text-sm"
      >
        <option value="">Todos los empleados</option>
        {empleados.map((empleado) => (
          <option key={empleado.value} value={empleado.value}>{empleado.label}</option>
        ))}
      </select>

      <select
        value={values.sedeId}
        onChange={(event) => actions.setSedeId(event.target.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm"
      >
        <option value="">Todas las sedes</option>
        {sedes.map((sede) => (
          <option key={sede.id} value={sede.id}>{sede.nombre ?? sede.name}</option>
        ))}
      </select>

      <div className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3">
        <Calendar className="h-3.5 w-3.5 text-gray-400" />
        <input type="date" value={values.fechaDesde} onChange={(event) => actions.setFechaDesde(event.target.value)} className="border-none bg-transparent text-sm outline-none" />
      </div>
      <span className="text-sm text-gray-400">→</span>
      <div className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3">
        <Calendar className="h-3.5 w-3.5 text-gray-400" />
        <input type="date" value={values.fechaHasta} onChange={(event) => actions.setFechaHasta(event.target.value)} className="border-none bg-transparent text-sm outline-none" />
      </div>

      <select
        value={values.estado}
        onChange={(event) => actions.setEstado(event.target.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm"
      >
        <option value="">Todos los estados</option>
        {estados.map((estado) => (
          <option key={estado.value} value={estado.value}>{estado.label}</option>
        ))}
      </select>

      {total != null && <span className="text-xs text-gray-400">{total} registros</span>}
    </div>
  );
}

export function SolicitudesPaginacion({ meta, page, onPage }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
      <span className="text-xs text-gray-500">
        Mostrando {meta.from ?? 0} a {meta.to ?? 0} de {meta.total}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className="rounded border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-40">Anterior</button>
        <span className="text-xs text-gray-500">Página {meta.current_page} de {meta.last_page}</span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= meta.last_page} className="rounded border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-40">Siguiente</button>
      </div>
    </div>
  );
}

SolicitudesFiltros.propTypes = {
  filtros: PropTypes.object.isRequired,
  empleados: PropTypes.array.isRequired,
  sedes: PropTypes.array.isRequired,
  estados: PropTypes.array.isRequired,
  total: PropTypes.number,
};

SolicitudesPaginacion.propTypes = {
  meta: PropTypes.object,
  page: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
};
