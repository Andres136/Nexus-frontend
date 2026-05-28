import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, X, Trash2 } from "lucide-react";
import { novedadRetroactivaService } from "../../services/nominaService";
import { useGetEmpleados } from "../../hooks/nomina/useGetEmpleados";
import { showToast } from "../../helpers/utils/showToast";

const EMPTY = {
  user_id: "",
  fecha_origen: "",
  aplicar_desde: "",
  aplicar_hasta: "",
  tipo: "devengo",
  concepto: "",
  valor: "",
  observacion: "",
};

function money(value) {
  return "$ " + Number(value || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function badge(status) {
  const map = {
    pendiente: "bg-yellow-100 text-yellow-700",
    aprobada: "bg-green-100 text-green-700",
    aplicada: "bg-indigo-100 text-indigo-700",
    rechazada: "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export default function PageNovedadesRetroactivas() {
  const queryClient = useQueryClient();
  const { empleados } = useGetEmpleados();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");

  const params = useMemo(() => ({ search: search || undefined, per_page: 20 }), [search]);
  const { data, isLoading } = useQuery({
    queryKey: ["novedadesRetroactivas", params],
    queryFn: async () => (await novedadRetroactivaService.getAll(params)).data.data,
  });

  const items = data?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["novedadesRetroactivas"] });
    queryClient.invalidateQueries({ queryKey: ["nominas"] });
    queryClient.invalidateQueries({ queryKey: ["nominaSummary"] });
  };

  const createMutation = useMutation({
    mutationFn: novedadRetroactivaService.create,
    onSuccess: () => {
      showToast("success", "Novedad registrada");
      setForm(EMPTY);
      setShowForm(false);
      invalidate();
    },
    onError: (err) => showToast("error", err.response?.data?.message || "No se pudo guardar"),
  });

  const actionMutation = useMutation({
    mutationFn: ({ uuid, action }) => action === "aprobar"
      ? novedadRetroactivaService.aprobar(uuid)
      : action === "rechazar"
        ? novedadRetroactivaService.rechazar(uuid)
        : novedadRetroactivaService.delete(uuid),
    onSuccess: (res) => {
      showToast("success", res.data.message || "Acción realizada");
      invalidate();
    },
    onError: (err) => showToast("error", err.response?.data?.message || "No se pudo completar la acción"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Novedades Retroactivas</h1>
          <p className="text-sm text-gray-500">Registra ajustes aprobables para períodos posteriores.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Nueva
        </button>
      </div>

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar empleado o concepto..." className="h-9 w-full max-w-xs rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <select required value={form.user_id} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm">
              <option value="">Empleado...</option>
              {empleados.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm">
              <option value="devengo">Devengo</option>
              <option value="deduccion">Deducción</option>
            </select>
            <input required type="number" min="0.01" step="0.01" value={form.valor} onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))} placeholder="Valor" className="h-10 rounded-md border border-gray-300 px-3 text-sm" />
            <input required type="date" value={form.fecha_origen} onChange={(e) => setForm((p) => ({ ...p, fecha_origen: e.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm" />
            <input required type="date" value={form.aplicar_desde} onChange={(e) => setForm((p) => ({ ...p, aplicar_desde: e.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm" />
            <input type="date" value={form.aplicar_hasta} onChange={(e) => setForm((p) => ({ ...p, aplicar_hasta: e.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm" />
          </div>
          <input required value={form.concepto} onChange={(e) => setForm((p) => ({ ...p, concepto: e.target.value }))} placeholder="Concepto" className="mt-3 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" />
          <textarea value={form.observacion} onChange={(e) => setForm((p) => ({ ...p, observacion: e.target.value }))} placeholder="Observación" className="mt-3 min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">Cancelar</button>
            <button disabled={createMutation.isPending} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">Guardar</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No hay novedades registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Empleado</th>
                  <th className="px-4 py-3 text-left">Concepto</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-left">Aplicación</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.uuid} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.empleado?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{item.concepto}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{item.tipo}</td>
                    <td className="px-4 py-3 text-right font-medium">{money(item.valor)}</td>
                    <td className="px-4 py-3 text-gray-600">{String(item.aplicar_desde).slice(0, 10)} / {item.aplicar_hasta ? String(item.aplicar_hasta).slice(0, 10) : "abierta"}</td>
                    <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge(item.status)}`}>{item.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        {item.status === "pendiente" && (
                          <>
                            <button title="Aprobar" onClick={() => actionMutation.mutate({ uuid: item.uuid, action: "aprobar" })} className="text-green-600 hover:text-green-800"><Check className="h-4 w-4" /></button>
                            <button title="Rechazar" onClick={() => actionMutation.mutate({ uuid: item.uuid, action: "rechazar" })} className="text-red-600 hover:text-red-800"><X className="h-4 w-4" /></button>
                          </>
                        )}
                        {item.status !== "aplicada" && (
                          <button title="Eliminar" onClick={() => actionMutation.mutate({ uuid: item.uuid, action: "delete" })} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
