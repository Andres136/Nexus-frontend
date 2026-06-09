import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { prestacionService } from "../../services/nominaService";
import ModalLiquidarPrestacion from "../../components/nomina/ModalLiquidarPrestacion";

function money(value) {
  return "$ " + Number(value || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

const TIPOS = {
  prima:                  { label: "Prima",      color: "bg-green-100 text-green-700" },
  cesantias:              { label: "Cesantías",  color: "bg-blue-100 text-blue-700" },
  vacaciones_compensadas: { label: "Vacaciones", color: "bg-violet-100 text-violet-700" },
};

export default function PageLiquidacionesPrestaciones() {
  const [search, setSearch]         = useState("");
  const [tipo, setTipo]             = useState("");
  const [anio, setAnio]             = useState("");
  const [page, setPage]             = useState(1);
  const [showModal, setShowModal]   = useState(false);

  const params = useMemo(() => ({
    search:   search || undefined,
    tipo:     tipo   || undefined,
    anio:     anio   || undefined,
    page,
    per_page: 20,
  }), [search, tipo, anio, page]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["liquidacionesPrestaciones", params],
    queryFn: async () => (await prestacionService.getAll(params)).data.data,
  });

  const items = data?.data ?? [];
  const meta  = data ?? {};

  const anioActual = new Date().getFullYear();
  const aniosDisponibles = Array.from({ length: 5 }, (_, i) => anioActual - i);

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden p-4 sm:p-6">
      {/* Encabezado */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Prestaciones Sociales</h1>
          <p className="text-sm text-gray-500">
            Historial de primas, cesantías e intereses, y vacaciones compensadas liquidadas.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + Liquidar prestación
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar empleado..."
          className="h-9 w-56 rounded-lg border border-gray-200 px-3 text-sm"
        />
        <select
          value={tipo}
          onChange={(e) => { setTipo(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm"
        >
          <option value="">Todos los tipos</option>
          <option value="prima">Prima de servicios</option>
          <option value="cesantias">Cesantías</option>
          <option value="vacaciones_compensadas">Vacaciones compensadas</option>
        </select>
        <select
          value={anio}
          onChange={(e) => { setAnio(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm"
        >
          <option value="">Todos los años</option>
          {aniosDisponibles.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
            <span className="text-4xl">📋</span>
            <p className="text-sm">No hay prestaciones liquidadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Empleado</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Período</th>
                  <th className="px-4 py-3 text-right">Días</th>
                  <th className="px-4 py-3 text-right">Base cálculo</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-right">Intereses</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Liquidado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const tipoMeta = TIPOS[item.tipo] ?? { label: item.tipo, color: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.empleado?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoMeta.color}`}>
                          {tipoMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {String(item.periodo_inicio).slice(0, 10)} / {String(item.periodo_fin).slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{item.dias_liquidados}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{money(item.base_calculo)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{money(item.valor_calculado)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {item.tipo === "cesantias" ? money(item.intereses_cesantias) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{money(item.total_liquidado)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {item.fecha_liquidacion ? String(item.fecha_liquidacion).slice(0, 10) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {(meta.last_page ?? 1) > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Página {meta.current_page} de {meta.last_page}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-gray-200 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="rounded border border-gray-200 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <ModalLiquidarPrestacion
              onClose={() => {
                setShowModal(false);
                refetch();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
