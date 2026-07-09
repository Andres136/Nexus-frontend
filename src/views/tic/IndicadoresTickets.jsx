import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { Activity, CheckCircle2, Clock, Loader2, RotateCcw, Search, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { departamentosApi } from "../../services/api";
import { ticketService } from "../../services/ticService";

const today = new Date().toISOString().slice(0, 10);
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

function formatNumber(value, decimals = 2) {
  return Number(value ?? 0).toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function IndicadoresTickets() {
  const [filters, setFilters] = useState({
    fecha_desde: firstDayOfMonth,
    fecha_hasta: today,
    departamento_id: "",
  });

  const departamentosQuery = useQuery({
    queryKey: ["tic-indicadores-departamentos"],
    queryFn: async () => {
      const response = await departamentosApi.getAll();
      return response.data?.data ?? response.data ?? [];
    },
  });

  const estadisticasQuery = useQuery({
    queryKey: ["tic-indicadores-tickets", filters],
    queryFn: async () => {
      const response = await ticketService.getTicketStats(filters);
      return response.data?.data ?? null;
    },
  });

  const departamentosOptions = useMemo(
    () =>
      (departamentosQuery.data ?? []).map((departamento) => ({
        value: departamento.id,
        label: departamento.nombre ?? `Departamento #${departamento.id}`,
      })),
    [departamentosQuery.data]
  );

  const selectedDepartamento = departamentosOptions.find((option) => String(option.value) === String(filters.departamento_id)) ?? null;
  const estadisticas = estadisticasQuery.data;
  const resumen = estadisticas?.resumen;
  const departamentos = estadisticas?.departamentos ?? [];

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
      departamento_id: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Indicadores de tickets</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Total de tickets y tiempo promedio de resolución por proceso/departamento, con o sin equipo asociado.
            </p>
          </div>
          <Link
            to="/auth/tic/tickets"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-white"
          >
            Volver a Tickets
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
            <label className="mb-1 block text-xs font-semibold text-gray-600">Departamento</label>
            <Select
              value={selectedDepartamento}
              onChange={(option) => updateFilter("departamento_id", option?.value ?? "")}
              options={departamentosOptions}
              isLoading={departamentosQuery.isFetching}
              isClearable
              placeholder="Todos los departamentos"
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
          {renderStatCard(Ticket, "Total tickets", resumen?.tickets_total ?? 0)}
          {renderStatCard(Activity, "Abiertos", resumen?.tickets_abiertos ?? 0, "amber")}
          {renderStatCard(CheckCircle2, "Cerrados", resumen?.tickets_cerrados ?? 0, "green")}
          {renderStatCard(Clock, "Tiempo promedio resolución", `${formatNumber(resumen?.tiempo_promedio_resolucion)} h`, "red")}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {estadisticasQuery.isFetching ? (
            <div className="flex items-center justify-center p-12 text-sm text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-500" />
              Calculando indicadores...
            </div>
          ) : departamentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <Activity className="mb-2 h-10 w-10" />
              <p className="text-sm">No hay tickets para este periodo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Departamento</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Tickets</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Abiertos</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Cerrados</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Tiempo promedio resolución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departamentos.map((item) => (
                    <tr key={item.departamento.id} className="hover:bg-blue-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{item.departamento.nombre ?? `Departamento #${item.departamento.id}`}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.tickets_total}</td>
                      <td className="px-4 py-3 text-amber-700">{item.tickets_abiertos}</td>
                      <td className="px-4 py-3 text-green-700">{item.tickets_cerrados}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatNumber(item.tiempo_promedio_resolucion)} h</td>
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
