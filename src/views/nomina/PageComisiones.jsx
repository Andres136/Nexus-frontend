import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import Select from "react-select";
import { showToast } from "../../helpers/utils/showToast";
import { useGetEmpleados } from "../../hooks/nomina/useGetEmpleados";
import { comisionService } from "../../services/nominaService";

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const lastDay = String(new Date(year, now.getMonth() + 1, 0).getDate()).padStart(2, "0");

const EMPTY = {
  user_id: "",
  periodo_inicio: `${year}-${month}-01`,
  periodo_fin: `${year}-${month}-${lastDay}`,
  concepto: "",
  valor: "",
  observacion: "",
};

function money(value) {
  return "$ " + Number(value || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function statusClass(status) {
  return {
    pendiente: "bg-yellow-100 text-yellow-700",
    aprobada: "bg-green-100 text-green-700",
    rechazada: "bg-red-100 text-red-700",
    aplicada: "bg-indigo-100 text-indigo-700",
  }[status] ?? "bg-gray-100 text-gray-600";
}

export default function PageComisiones() {
  const queryClient = useQueryClient();
  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados();
  const [showForm, setShowForm] = useState(false);
  const [editingUuid, setEditingUuid] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const params = useMemo(
    () => ({ search: search || undefined, status: status || undefined, per_page: 30 }),
    [search, status]
  );
  const { data, isLoading } = useQuery({
    queryKey: ["comisiones", params],
    queryFn: async () => (await comisionService.getAll(params)).data.data,
  });

  const items = data?.data ?? [];
  const empleadoSeleccionado = empleados.find((empleado) => empleado.value === Number(form.user_id)) ?? null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["comisiones"] });
    queryClient.invalidateQueries({ queryKey: ["nominas"] });
    queryClient.invalidateQueries({ queryKey: ["nominaSummary"] });
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingUuid(null);
    setEditingStatus(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm(EMPTY);
    setEditingUuid(null);
    setEditingStatus(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      user_id: item.user_id ?? "",
      periodo_inicio: String(item.periodo_inicio ?? "").slice(0, 10),
      periodo_fin: String(item.periodo_fin ?? "").slice(0, 10),
      concepto: item.concepto ?? "",
      valor: item.valor ?? "",
      observacion: item.observacion ?? "",
    });
    setEditingUuid(item.uuid);
    setEditingStatus(item.status);
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (editingUuid) return comisionService.update(editingUuid, payload);
      return comisionService.create(payload);
    },
    onSuccess: () => {
      showToast("success", editingUuid ? "Comisión actualizada." : "Comisión registrada.");
      resetForm();
      invalidate();
    },
    onError: (error) => showToast("error", error.response?.data?.message || "No se pudo guardar la comisión."),
  });

  const actionMutation = useMutation({
    mutationFn: ({ uuid, action }) => {
      if (action === "aprobar") return comisionService.aprobar(uuid);
      if (action === "rechazar") return comisionService.rechazar(uuid);
      return comisionService.delete(uuid);
    },
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Acción realizada.");
      invalidate();
    },
    onError: (error) => showToast("error", error.response?.data?.message || "No se pudo completar la acción."),
  });

  const submit = (event) => {
    event.preventDefault();
    saveMutation.mutate({ ...form, user_id: Number(form.user_id), valor: Number(form.valor) });
  };

  const remove = (uuid) => {
    if (!window.confirm("¿Eliminar esta comisión pendiente?")) return;
    actionMutation.mutate({ uuid, action: "delete" });
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Comisiones</h1>
          <p className="text-sm text-gray-500">Registra y aprueba comisiones salariales antes de liquidar nómina.</p>
          <p className="text-xs text-amber-600">Las comisiones aprobadas se toman si su período cruza el rango liquidado.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Nueva comisión
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {editingStatus === "aplicada" && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Esta comisión ya fue aplicada. La edición actualiza el registro, pero no recalcula automáticamente una nómina histórica ya liquidada.
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Select
              options={empleados}
              value={empleadoSeleccionado}
              onChange={(option) => setForm((prev) => ({ ...prev, user_id: option?.value ?? "" }))}
              isLoading={loadingEmpleados}
              isClearable
              placeholder={loadingEmpleados ? "Cargando empleados..." : "Buscar empleado..."}
              noOptionsMessage={() => "Sin resultados"}
              classNamePrefix="react-select"
            />
            <input required value={form.concepto} onChange={(event) => setForm((prev) => ({ ...prev, concepto: event.target.value }))} placeholder="Concepto, ejemplo: comisión ventas junio" className="h-10 rounded-md border border-gray-300 px-3 text-sm" />
            <input required type="number" min="0.01" step="0.01" value={form.valor} onChange={(event) => setForm((prev) => ({ ...prev, valor: event.target.value }))} placeholder="Valor" className="h-10 rounded-md border border-gray-300 px-3 text-sm" />
            <label className="text-xs text-gray-500">
              Inicio del período
              <input required type="date" value={form.periodo_inicio} onChange={(event) => setForm((prev) => ({ ...prev, periodo_inicio: event.target.value }))} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-700" />
            </label>
            <label className="text-xs text-gray-500">
              Fin del período
              <input required type="date" value={form.periodo_fin} onChange={(event) => setForm((prev) => ({ ...prev, periodo_fin: event.target.value }))} className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-700" />
            </label>
            <input value={form.observacion} onChange={(event) => setForm((prev) => ({ ...prev, observacion: event.target.value }))} placeholder="Observación opcional" className="h-10 self-end rounded-md border border-gray-300 px-3 text-sm" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">Cancelar</button>
            <button disabled={saveMutation.isPending} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
              {saveMutation.isPending ? "Guardando..." : editingUuid ? "Actualizar comisión" : "Guardar comisión"}
            </button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empleado o concepto..." className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm sm:max-w-xs" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-600">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobada">Aprobadas</option>
          <option value="aplicada">Aplicadas</option>
          <option value="rechazada">Rechazadas</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No hay comisiones registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Empleado</th>
                  <th className="px-4 py-3 text-left">Concepto</th>
                  <th className="px-4 py-3 text-left">Período</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.uuid} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.empleado?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{item.concepto}</td>
                    <td className="px-4 py-3 text-gray-500">{String(item.periodo_inicio).slice(0, 10)} / {String(item.periodo_fin).slice(0, 10)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">{money(item.valor)}</td>
                    <td className="px-4 py-3 text-center"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button type="button" title="Editar" onClick={() => openEdit(item)} className="text-indigo-600 hover:text-indigo-800"><Pencil className="h-4 w-4" /></button>
                        {item.status === "pendiente" && (
                          <>
                          <button type="button" title="Aprobar" onClick={() => actionMutation.mutate({ uuid: item.uuid, action: "aprobar" })} className="text-green-600 hover:text-green-800"><Check className="h-4 w-4" /></button>
                          <button type="button" title="Rechazar" onClick={() => actionMutation.mutate({ uuid: item.uuid, action: "rechazar" })} className="text-red-600 hover:text-red-800"><X className="h-4 w-4" /></button>
                          <button type="button" title="Eliminar" onClick={() => remove(item.uuid)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </>
                        )}
                        {item.status === "aplicada" && item.nomina?.uuid && <span className="text-xs text-gray-400">Nómina #{item.nomina.id}</span>}
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
