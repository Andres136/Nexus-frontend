import { useState } from "react";
import { CreditCard, Loader2, Plus } from "lucide-react";
import { useCreatePortalPrestamo, useGetPortalPrestamos } from "../../hooks/nomina/useSolicitudesPrestamos";

const STATUS_BADGE = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobada: "bg-green-100 text-green-700",
  rechazada: "bg-red-100 text-red-700",
};

const EMPTY_FORM = {
  monto_solicitado: "",
  frecuencia_pago_solicitada: "quincenal",
  motivo: "",
};

const formatCOP = (value) =>
  value != null
    ? `$ ${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`
    : "-";

export default function PagePrestamosPortal() {
  const { prestamos, isLoading } = useGetPortalPrestamos();
  const createPrestamo = useCreatePortalPrestamo();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const lista = prestamos?.data?.data ?? [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createPrestamo.mutateAsync(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Préstamos</h1>
          <p className="mt-0.5 text-sm text-gray-500">Solicita un préstamo para revisión de Nómina.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Solicitar
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-md border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="monto_solicitado" className="mb-1 block text-sm font-medium text-gray-700">
                Monto solicitado
              </label>
              <input
                id="monto_solicitado"
                name="monto_solicitado"
                type="number"
                min="1"
                value={form.monto_solicitado}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="frecuencia_pago_solicitada" className="mb-1 block text-sm font-medium text-gray-700">
                Frecuencia
              </label>
              <select
                id="frecuencia_pago_solicitada"
                name="frecuencia_pago_solicitada"
                value={form.frecuencia_pago_solicitada}
                onChange={handleChange}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="motivo" className="mb-1 block text-sm font-medium text-gray-700">
              Motivo
            </label>
            <textarea
              id="motivo"
              name="motivo"
              rows={3}
              value={form.motivo}
              onChange={handleChange}
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createPrestamo.isPending}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {createPrestamo.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar solicitud
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-14 text-sm text-gray-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-500" />
            Cargando...
          </div>
        ) : lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center text-sm text-gray-400">
            <CreditCard className="mb-3 h-8 w-8 text-gray-300" />
            No tienes solicitudes de préstamo.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cuotas</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Interés</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {lista.map((item) => (
                <tr key={item.uuid} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-800">{formatCOP(item.monto_solicitado)}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {item.numero_cuotas_aprobadas
                      ? `${item.numero_cuotas_aprobadas} ${item.frecuencia_pago_aprobada ?? item.frecuencia_pago_solicitada}`
                      : "Pendiente de aprobación"}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{Number(item.tasa_interes_porcentaje ?? 0)}%</td>
                  <td className="px-5 py-4 text-gray-600">{formatCOP(item.total_a_descontar ?? item.monto_solicitado)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
