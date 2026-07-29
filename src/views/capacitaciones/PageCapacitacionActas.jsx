import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileSignature, Loader2, Search, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { capacitacionActaService } from "../../services/capacitacionActaService";

function estadoActa(acta) {
  if (!acta.envios_count) {
    return { label: "Sin enviar", className: "bg-slate-100 text-slate-700" };
  }
  if (acta.pendientes_count > 0) {
    return { label: "Firmas pendientes", className: "bg-amber-100 text-amber-800" };
  }
  return { label: "Firmada completa", className: "bg-emerald-100 text-emerald-800" };
}

export default function PageCapacitacionActas() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: "", estado: "", empresa_id: "", page: 1 });
  const [data, setData] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    capacitacionActaService.list({
      search: filters.search || undefined,
      estado: filters.estado || undefined,
      empresa_id: filters.empresa_id || undefined,
      page: filters.page,
      per_page: 20,
    }).then((response) => {
      if (active) setData(response.data);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [filters]);

  useEffect(() => {
    capacitacionActaService.companies()
      .then((response) => setEmpresas(response.data ?? []))
      .catch(() => setEmpresas([]));
  }, []);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const actas = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/auth/capacitaciones" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Capacitaciones
            </Link>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-950">
              <FileSignature className="h-6 w-6 text-blue-600" />
              Actas de capacitación
            </h1>
            <p className="mt-1 text-sm text-slate-500">Consulta las actas creadas y el avance de sus firmas.</p>
          </div>
          <span className="text-sm font-medium text-slate-500">{data?.total ?? 0} actas</span>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Buscar por número, título o capacitación"
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <select
            value={filters.estado}
            onChange={(event) => updateFilter("estado", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Todos los estados</option>
            <option value="sin_enviar">Sin enviar</option>
            <option value="pendiente">Firmas pendientes</option>
            <option value="completa">Firma completa</option>
          </select>
          <select
            value={filters.empresa_id}
            onChange={(event) => updateFilter("empresa_id", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Todas las empresas</option>
            {empresas.map((empresa) => (
              <option key={empresa.empresa_id} value={empresa.empresa_id}>{empresa.empresa_nombre}</option>
            ))}
          </select>
        </section>

        <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Cargando actas...
            </div>
          ) : actas.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">No hay actas que coincidan con los filtros.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Acta", "Capacitación", "Fecha", "Elaborada por", "Firmas", "Estado", ""].map((title) => (
                    <th key={title} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actas.map((acta) => {
                  const estado = estadoActa(acta);
                  return (
                    <tr key={acta.uuid} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-blue-700">No. {acta.numero}</p>
                        <p className="mt-0.5 max-w-sm font-medium text-slate-900">{acta.titulo}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{acta.capacitacion?.titulo}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{acta.capacitacion?.fecha_realizacion}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{acta.elaborador?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span><strong>{acta.firmadas_count}</strong> / {acta.envios_count}</span>
                          {acta.envios_count > 0 && acta.firmadas_count === acta.envios_count && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${estado.className}`}>{estado.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/auth/capacitaciones/${acta.capacitacion?.uuid}/acta`)}
                          className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          Abrir acta
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {data?.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <span className="text-xs text-slate-500">{data.from}-{data.to} de {data.total}</span>
              <div className="flex items-center gap-2">
                <button disabled={filters.page <= 1 || loading} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-40">Anterior</button>
                <span className="text-xs text-slate-500">Página {data.current_page} de {data.last_page}</span>
                <button disabled={filters.page >= data.last_page || loading} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
