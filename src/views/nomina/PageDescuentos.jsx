import { useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import RegisterDescuento from "../../components/nomina/RegisterDescuento";
import { showToast } from "../../helpers/utils/showToast";
import { useGetDescuentos } from "../../hooks/nomina/useGetDescuentos";
import { useGestionSolicitudPrestamo, useGetSolicitudesPrestamos } from "../../hooks/nomina/useSolicitudesPrestamos";

const EMPTY_GESTION = {
  monto_aprobado: "",
  tasa_interes_porcentaje: "0",
  numero_cuotas_aprobadas: "",
  frecuencia_pago_aprobada: "quincenal",
  inicio_descuento: "",
  observacion_nomina: "",
};

const STATUS_BADGE = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobada: "bg-green-100 text-green-700",
  rechazada: "bg-red-100 text-red-700",
};

function ModalGestionPrestamo({ solicitud, accion, onClose, onConfirm, loading }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_GESTION,
    monto_aprobado: solicitud?.monto_solicitado ?? "",
    frecuencia_pago_aprobada: solicitud?.frecuencia_pago_solicitada ?? "quincenal",
  }));

  const monto = Number(form.monto_aprobado || 0);
  const tasa = Number(form.tasa_interes_porcentaje || 0);
  const cuotas = Number(form.numero_cuotas_aprobadas || 0);
  const valorInteres = monto > 0 ? monto * (tasa / 100) : 0;
  const total = monto + valorInteres;
  const valorCuota = cuotas > 0 ? total / cuotas : 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    if (accion === "aprobar" && (!form.numero_cuotas_aprobadas || !form.inicio_descuento)) {
      showToast("warning", "Indica el plazo en cuotas y la fecha de inicio.");
      return;
    }

    onConfirm(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-xl rounded-md bg-white p-6 shadow-xl">
        <h3 className="mb-1 text-base font-semibold text-gray-800">
          {accion === "aprobar" ? "Aprobar préstamo" : "Rechazar préstamo"}
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Empleado: <span className="font-medium text-gray-700">{solicitud?.empleado?.name ?? "-"}</span>
        </p>

        {accion === "aprobar" ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="monto_aprobado" className="mb-1 block text-sm font-medium text-gray-700">Monto aprobado</label>
                <input id="monto_aprobado" name="monto_aprobado" type="number" min="1" value={form.monto_aprobado} onChange={handleChange} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label htmlFor="tasa_interes_porcentaje" className="mb-1 block text-sm font-medium text-gray-700">Interés %</label>
                <input id="tasa_interes_porcentaje" name="tasa_interes_porcentaje" type="number" min="0" max="100" step="0.01" value={form.tasa_interes_porcentaje} onChange={handleChange} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label htmlFor="numero_cuotas_aprobadas" className="mb-1 block text-sm font-medium text-gray-700">Plazo en cuotas</label>
                <input id="numero_cuotas_aprobadas" name="numero_cuotas_aprobadas" type="number" min="1" max="60" value={form.numero_cuotas_aprobadas} onChange={handleChange} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label htmlFor="frecuencia_pago_aprobada" className="mb-1 block text-sm font-medium text-gray-700">Frecuencia</label>
                <select id="frecuencia_pago_aprobada" name="frecuencia_pago_aprobada" value={form.frecuencia_pago_aprobada} onChange={handleChange} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
              <div>
                <label htmlFor="inicio_descuento" className="mb-1 block text-sm font-medium text-gray-700">Inicio descuento</label>
                <input id="inicio_descuento" name="inicio_descuento" type="date" value={form.inicio_descuento} onChange={handleChange} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
            </div>
            <div className="grid gap-3 rounded-md border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800 md:grid-cols-3">
              <div>Interés: <span className="font-semibold">{formatCurrency(valorInteres)}</span></div>
              <div>Total: <span className="font-semibold">{formatCurrency(total)}</span></div>
              <div>Cuota: <span className="font-semibold">{formatCurrency(valorCuota)}</span></div>
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <label htmlFor="observacion_nomina" className="mb-1 block text-sm font-medium text-gray-700">Observación</label>
          <textarea id="observacion_nomina" name="observacion_nomina" rows={3} value={form.observacion_nomina} onChange={handleChange} className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium text-white disabled:opacity-60 ${accion === "aprobar" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {accion === "aprobar" ? "Aprobar y crear descuento" : "Rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
}

ModalGestionPrestamo.propTypes = {
  solicitud: PropTypes.shape({
    monto_solicitado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    frecuencia_pago_solicitada: PropTypes.string,
    empleado: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  accion: PropTypes.oneOf(["aprobar", "rechazar"]).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

const formatCurrency = (value) =>
  value != null
    ? `$${Number(value).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : "—";

export default function PageDescuentos() {
  const { descuentos, isLoading } = useGetDescuentos();
  const { solicitudes, isLoading: isLoadingSolicitudes } = useGetSolicitudesPrestamos({ status: "pendiente" });
  const gestionPrestamo = useGestionSolicitudPrestamo();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [gestionSolicitud, setGestionSolicitud] = useState(null);

  const lista = descuentos?.data?.data ?? [];
  const solicitudesPendientes = solicitudes?.data?.data ?? [];

  const openCreate = () => {
    setSelectedUuid(null);
    setModalOpen(true);
  };

  const openEdit = (uuid) => {
    setSelectedUuid(uuid);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUuid(null);
  };

  const formatCurrency = (value) =>
    value != null
      ? `$${Number(value).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`
      : "—";

  const handleGestionSolicitud = async (form) => {
    if (gestionSolicitud.accion === "aprobar") {
      await gestionPrestamo.aprobar.mutateAsync({
        uuid: gestionSolicitud.item.uuid,
        payload: form,
      });
    } else {
      await gestionPrestamo.rechazar.mutateAsync({
        uuid: gestionSolicitud.item.uuid,
        payload: { observacion_nomina: form.observacion_nomina },
      });
    }
    setGestionSolicitud(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Descuentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona los descuentos por nómina de los empleados.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      <div className="mb-6 rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Solicitudes de préstamos</h2>
            <p className="mt-0.5 text-sm text-gray-500">Aprueba con interés, cuotas y fecha de inicio para crear el descuento.</p>
          </div>
          {solicitudesPendientes.length > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">{solicitudesPendientes.length}</span>
          )}
        </div>
        {isLoadingSolicitudes ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-500" />
            Cargando solicitudes...
          </div>
        ) : solicitudesPendientes.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">No hay préstamos pendientes.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Empleado</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Frecuencia</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Motivo</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {solicitudesPendientes.map((item) => (
                  <tr key={item.uuid} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">{item.empleado?.name ?? "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{formatCurrency(item.monto_solicitado)}</td>
                    <td className="px-5 py-4 capitalize text-gray-600">{item.frecuencia_pago_solicitada}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-gray-500">{item.motivo || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button type="button" onClick={() => setGestionSolicitud({ item, accion: "aprobar" })} className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Aprobar
                        </button>
                        <button type="button" onClick={() => setGestionSolicitud({ item, accion: "rechazar" })} className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                          <XCircle className="h-3.5 w-3.5" />
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-sm text-gray-400">
            <svg className="animate-spin h-5 w-5 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Cargando...
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            No hay descuentos registrados.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuotas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor cuota</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frecuencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {lista.map((item) => (
                <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.empleado?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{item.concepto_descuento}</td>
                  <td className="px-6 py-4 text-gray-600">{formatCurrency(item.monto)}</td>
                  <td className="px-6 py-4 text-gray-600">{item.numero_cuotas}</td>
                  <td className="px-6 py-4 text-gray-600">{formatCurrency(item.valor_cuota)}</td>
                  <td className="px-6 py-4 capitalize text-gray-600">{item.frecuencia_pago}</td>
                  <td className="px-6 py-4 text-gray-500">{item.inicio?.slice(0, 10) ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{item.fin?.slice(0, 10) ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.status ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(item.uuid)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-8 animate-slide-in">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <RegisterDescuento uuid={selectedUuid} onClose={closeModal} />
          </div>
        </div>
      )}
      {gestionSolicitud && (
        <ModalGestionPrestamo
          solicitud={gestionSolicitud.item}
          accion={gestionSolicitud.accion}
          onClose={() => setGestionSolicitud(null)}
          onConfirm={handleGestionSolicitud}
          loading={gestionPrestamo.aprobar.isPending || gestionPrestamo.rechazar.isPending}
        />
      )}
    </div>
  );
}
