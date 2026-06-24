import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { Activity, AlertTriangle, Clock, Loader2, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { productsApi } from "../../services/api";
import { ticketService } from "../../services/ticService";

const today = new Date().toISOString().slice(0, 10);
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

function formatNumber(value, decimals = 2) {
  return Number(value ?? 0).toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function ParadasEquipos() {
  const [filters, setFilters] = useState({
    fecha_desde: firstDayOfMonth,
    fecha_hasta: today,
    producto_id: "",
  });

  const productosQuery = useQuery({
    queryKey: ["tic-paradas-productos"],
    queryFn: async () => {
      const response = await productsApi.getAll();
      return response.data?.data ?? response.data ?? [];
    },
  });

  const estadisticasQuery = useQuery({
    queryKey: ["tic-paradas-equipos", filters],
    queryFn: async () => {
      const response = await ticketService.getDowntimeStats(filters);
      return response.data?.data ?? null;
    },
  });

  const productosOptions = useMemo(
    () =>
      (productosQuery.data ?? []).map((producto) => ({
        value: producto.id,
        label: `${producto.name ?? "Producto"}${producto.code ? ` - ${producto.code}` : ""}`,
      })),
    [productosQuery.data]
  );

  const selectedProducto = productosOptions.find((option) => String(option.value) === String(filters.producto_id)) ?? null;
  const estadisticas = estadisticasQuery.data;
  const resumen = estadisticas?.resumen;
  const productos = estadisticas?.productos ?? [];

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const renderStatCard = (Icon, label, value, tone = "blue") => {
    const tones = {
      blue: "bg-blue-50 text-blue-700",
      amber: "bg-amber-50 text-amber-700",
      green: "bg-green-50 text-green-700",
      red: "bg-red-50 text-red-700",
    };

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`rounded-lg p-2 ${tones[tone]}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  const resetFilters = () => {
    setFilters({
      fecha_desde: firstDayOfMonth,
      fecha_hasta: today,
      producto_id: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paradas de equipos</h1>
            <p className="mt-0.5 text-xs text-gray-500">Disponibilidad calculada desde tickets asociados a productos.</p>
          </div>
          <Link
            to="/auth/tic"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-white"
          >
            Volver a TIC
          </Link>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[180px_180px_minmax(0,1fr)_auto]">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Desde</label>
            <input
              type="date"
              value={filters.fecha_desde}
              onChange={(event) => updateFilter("fecha_desde", event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Hasta</label>
            <input
              type="date"
              value={filters.fecha_hasta}
              onChange={(event) => updateFilter("fecha_hasta", event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Equipo</label>
            <Select
              value={selectedProducto}
              onChange={(option) => updateFilter("producto_id", option?.value ?? "")}
              options={productosOptions}
              isLoading={productosQuery.isFetching}
              isClearable
              placeholder="Todos los equipos"
              className="text-sm"
              classNamePrefix="react-select"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => estadisticasQuery.refetch()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              Consultar
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-3 text-gray-600 hover:bg-gray-50"
              title="Restablecer filtros"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          {renderStatCard(Clock, "Horas del periodo", `${formatNumber(estadisticas?.periodo?.horas_periodo)} h`)}
          {renderStatCard(AlertTriangle, "Horas parado total", `${formatNumber(resumen?.horas_parado_total)} h`, "amber")}
          {renderStatCard(Activity, "% parada total", `${formatNumber(resumen?.porcentaje_parada_total)}%`, "red")}
          {renderStatCard(ShieldCheck, "% disponibilidad", `${formatNumber(resumen?.porcentaje_disponibilidad_total)}%`, "green")}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {estadisticasQuery.isFetching ? (
            <div className="flex items-center justify-center p-12 text-sm text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-500" />
              Calculando paradas...
            </div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <Activity className="mb-2 h-10 w-10" />
              <p className="text-sm">No hay tickets con equipo para este periodo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Equipo</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Tickets</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Abiertos</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Cerrados</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Horas parado</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">% parada</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">% disponibilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productos.map((item) => (
                    <tr key={item.producto.id} className="hover:bg-blue-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{item.producto.name ?? `Equipo #${item.producto.id}`}</p>
                        <p className="text-xs text-gray-400">{item.producto.code ?? "-"}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.tickets_total}</td>
                      <td className="px-4 py-3 text-amber-700">{item.tickets_abiertos}</td>
                      <td className="px-4 py-3 text-green-700">{item.tickets_cerrados}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatNumber(item.horas_parado)} h</td>
                      <td className="px-4 py-3 text-red-600">{formatNumber(item.porcentaje_parada)}%</td>
                      <td className="px-4 py-3 text-green-700">{formatNumber(item.porcentaje_disponibilidad)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
