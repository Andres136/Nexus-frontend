import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { AlertCircle, Pencil, X } from "lucide-react";
import { useGetFormasPago } from "../../hooks/contabilidad/useGetFormasPago";
import { useRegisterAbonoFacturaCompra } from "../../hooks/contabilidad/useRegisterAbonoFacturaCompra";
import { useGetRegistroPagoFacturaById } from "../../hooks/contabilidad/useGetRegistroPagoFacturaById";

const inputBase =
  "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
const inputNormal = `${inputBase} border-gray-300`;
const inputError  = `${inputBase} border-red-400 bg-red-50`;

const FORM_VACIO = (facturaId) => ({
  factura_compras_id: facturaId,
  forma_pago_id: "",
  monto: "",
  fecha_pago: "",
  observaciones: "",
});

export default function ModalAbonos({ facturaId, onClose, pagoEditar }) {
  const [editingPagoId, setEditingPagoId] = useState(null);

  const { formasPago } = useGetFormasPago();
  const {
    formData,
    error,
    isLoading,
    handleChange,
    handleSubmit,
    setFormData,
    updateAbono,
  } = useRegisterAbonoFacturaCompra(facturaId);

  // Lista de pagos de la factura
  const { data: abonos, isLoading: loadingAbonos } =
    useGetRegistroPagoFacturaById(facturaId);

  // Datos frescos del pago específico que se va a editar
  useEffect(() => {
    if (!pagoEditar) return;
    handleEditarPago(pagoEditar);
  }, [pagoEditar]);

  // Los pagos vienen anidados dentro de la factura (abonos.pagos)


 const handleEditarPago = (pago) => {
    setEditingPagoId(pago.id);

    setFormData({
        factura_compras_id: facturaId,
        forma_pago_id: pago.forma_pago_id ?? "",
        monto: pago.monto ?? "",
        fecha_pago: pago.fecha_pago
            ? pago.fecha_pago.split("T")[0]
            : "",
        observaciones: pago.observaciones ?? "",
    });
};

  const handleCancelarEdicion = () => {
    setEditingPagoId(null);
    setFormData(FORM_VACIO(facturaId));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingPagoId) {
      await updateAbono(editingPagoId, formData);
      handleCancelarEdicion();
    } else {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {editingPagoId ? "Editar Pago" : "Registrar Abono"} —{" "}
              <span className="text-blue-600">Factura #{facturaId}</span>
            </h2>
            {editingPagoId && (
              <p className="text-xs text-gray-400 mt-0.5">Pago #{editingPagoId}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* ── Formulario ── */}
          <form onSubmit={handleFormSubmit} className="px-6 py-5 space-y-4">
            {error?.general && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div className="text-red-700 text-xs font-medium">
                  {error.general.map((msg, i) => (
                    <p key={i}>{msg}</p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de pago <span className="text-red-500">*</span>
              </label>
              <select
                name="forma_pago_id"
                value={formData.forma_pago_id}
                onChange={handleChange}
                className={error?.forma_pago_id ? inputError : inputNormal}
              >
                <option value="">Selecciona una forma de pago</option>
                {formasPago?.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
              {error?.forma_pago_id && (
                <p className="text-xs text-red-500 mt-1">{error.forma_pago_id[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={error?.monto ? inputError : inputNormal}
              />
              {error?.monto && (
                <p className="text-xs text-red-500 mt-1">{error.monto[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de pago <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_pago"
                value={formData.fecha_pago}
                onChange={handleChange}
                className={error?.fecha_pago ? inputError : inputNormal}
              />
              {error?.fecha_pago && (
                <p className="text-xs text-red-500 mt-1">{error.fecha_pago[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={2}
                placeholder="Opcional..."
                className={`${error?.observaciones ? inputError : inputNormal} resize-none`}
              />
              {error?.observaciones && (
                <p className="text-xs text-red-500 mt-1">{error.observaciones[0]}</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={editingPagoId ? handleCancelarEdicion : onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {editingPagoId ? "Cancelar edición" : "Cancelar"}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-[2] px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all ${
                  isLoading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Guardando...
                  </span>
                ) : editingPagoId ? "Actualizar Pago" : "Registrar Abono"}
              </button>
            </div>
          </form>



        </div>
      </div>
    </div>
  );
}

ModalAbonos.propTypes = {
  facturaId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};
