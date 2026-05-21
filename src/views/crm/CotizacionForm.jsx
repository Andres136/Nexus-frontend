import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import Select from "react-select";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useClientes } from "../../hooks/useClientes";
import { useAuth } from "../../hooks/useAuth";
import useCotizacionForm from "../../hooks/crm/useCotizacionForm";
import { formatCurrency } from "../../helpers";

const inp = "border border-gray-300 px-1.5 py-0.5 rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-400";
const calcCls = "text-xs text-center text-gray-600 bg-gray-50";
const errP = (msg) => msg ? <p className="text-xs text-red-500 mt-0.5">{msg}</p> : null;

export default function CotizacionForm({ modo }) {
  const { id } = useParams();
  const { clientesTodos } = useClientes();
  useAuth({ middleware: "auth" });

  const {
    formData,
    setFormData,
    rows,
    errores,
    erroresDetalles,
    loading,
    totalSubtotal,
    totalIva,
    totalGeneral,
    updateItem,
    addItem,
    removeItem,
    handleChange,
    handleSubmit,
  } = useCotizacionForm({ modo, id });

  const opcionesClientes = clientesTodos.map((c) => ({ value: c.id, label: c.nombre }));

  return (
    <div className="mx-auto p-3 bg-white">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {modo === "edicion" ? "Editar Cotización" : "Nueva Cotización"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {modo === "edicion" ? "Modifica los datos de la cotización" : "Completa la información requerida"}
          </p>
        </div>
        <Link
          to="/auth/crm/mis-cotizaciones"
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          ← Mis Cotizaciones
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Datos generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <Select
              options={opcionesClientes}
              value={opcionesClientes.find((o) => o.value === formData.cliente_id) || null}
              onChange={(opt) => setFormData((prev) => ({ ...prev, cliente_id: opt ? opt.value : "" }))}
              isClearable
              placeholder="Buscar o seleccionar cliente..."
              className="text-sm"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: errores.cliente_id ? "#dc2626" : state.isFocused ? "#3b82f6" : "#d1d5db",
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.2)" : "none",
                  "&:hover": { borderColor: "#3b82f6" },
                }),
                dropdownIndicator: (b) => ({ ...b, padding: "4px" }),
                valueContainer: (b) => ({ ...b, padding: "2px 8px" }),
              }}
            />
            {errP(errores.cliente_id)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="setasplast">Setasplast</option>
              <option value="global">Global</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
        </div>

        {/* Tabla de ítems */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Detalles de la Cotización</h3>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="px-2 py-2 text-left w-8">#</th>
                  <th className="px-2 py-2 w-6"></th>
                  <th className="px-2 py-2 text-left">Ancho</th>
                  <th className="px-2 py-2 text-left">Largo</th>
                  <th className="px-2 py-2 text-left">Cal.</th>
                  <th className="px-2 py-2 text-left">Clte Clb</th>
                  <th className="px-2 py-2 text-center">Peso/B</th>
                  <th className="px-2 py-2 text-center"># Bolsas</th>
                  <th className="px-2 py-2 text-left">$/Kg</th>
                  <th className="px-2 py-2 text-left min-w-[120px]">Descripción</th>
                  <th className="px-2 py-2 text-left">P. Unit</th>
                  <th className="px-2 py-2 text-left">Cant.</th>
                  <th className="px-2 py-2 text-left w-14">IVA%</th>
                  <th className="px-2 py-2 text-right">Subtotal</th>
                  <th className="px-2 py-2 text-right">Total IVA</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.map((row, idx) => {
                  const e = erroresDetalles[idx] || {};
                  const field = (name, value, extra = {}) => {
                    const hasErr = !!e[name];
                    return (
                      <div>
                        <input
                          className={`${inp} ${hasErr ? "border-red-400 bg-red-50" : ""} ${extra.cls ?? ""}`}
                          value={value}
                          type={extra.type ?? "text"}
                          step={extra.step}
                          min={extra.min}
                          max={extra.max}
                          readOnly={extra.readOnly}
                          onChange={(ev) => updateItem(row._uuid, name, ev.target.value)}
                        />
                        {hasErr && <span className="text-xs text-red-500 block mt-0.5">{e[name]}</span>}
                      </div>
                    );
                  };
                  return (
                    <tr key={row._uuid} className="hover:bg-gray-50 align-top">
                      <td className="px-2 py-1.5 text-gray-500">{row.itemNumber}</td>
                      <td className="px-2 py-1.5">
                        <button type="button" onClick={() => removeItem(row._uuid)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-0.5 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="px-2 py-1.5">{field("ancho_cm", row.ancho_cm)}</td>
                      <td className="px-2 py-1.5">{field("largo_cm", row.largo_cm)}</td>
                      <td className="px-2 py-1.5">{field("calibre", row.calibre)}</td>
                      <td className="px-2 py-1.5">{field("cliente_clb", row.cliente_clb)}</td>
                      <td className={`px-2 py-1.5 ${calcCls}`}>
                        {Number(row.peso_bolsa || 0).toFixed(2)}
                      </td>
                      <td className={`px-2 py-1.5 ${calcCls}`}>
                        <div>{row.numero_bolsas}</div>
                        {e.numero_bolsas && <span className="text-xs text-red-500 block">{e.numero_bolsas}</span>}
                      </td>
                      <td className="px-2 py-1.5">
                        {field("precio_total", row.precio_total, { type: "number" })}
                      </td>
                      <td className="px-2 py-1.5">
                        {field("descripcion", row.descripcion, { cls: "uppercase" })}
                      </td>
                      <td className="px-2 py-1.5">
                        {field("valor_unitario", row.valor_unitario, {
                          type: "number", step: "0.01", min: 0,
                          cls: `text-right ${row.fueCalculadoUnitario ? "bg-gray-100 text-gray-500" : ""}`,
                          readOnly: row.fueCalculadoUnitario,
                        })}
                      </td>
                      <td className="px-2 py-1.5">
                        {field("cantidad", row.cantidad, { type: "number" })}
                      </td>
                      <td className="px-2 py-1.5">
                        {field("iva_porcentaje", row.iva_porcentaje, { type: "number", min: 0, max: 100, step: "0.1" })}
                      </td>
                      <td className="px-2 py-1.5 text-right text-indigo-600 font-medium">
                        {formatCurrency(row.valor_paquete)}
                      </td>
                      <td className="px-2 py-1.5 text-right text-green-600 font-semibold">
                        {formatCurrency(row.valor_total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Ítem
          </button>

          {/* Resumen totales */}
          {rows.length > 0 && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xs text-gray-500">{rows.length} ítem{rows.length !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-5 text-sm">
                <span className="text-gray-600">
                  Subtotal: <strong>{formatCurrency(totalSubtotal)}</strong>
                </span>
                <span className="text-gray-600">
                  IVA: <strong>{formatCurrency(totalIva)}</strong>
                </span>
                <span className="text-base font-bold text-green-600">
                  Total: {formatCurrency(totalGeneral)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botón submit */}
        <div className="flex justify-end pt-2 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-md transition-colors text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading
              ? (modo === "edicion" ? "Actualizando..." : "Guardando...")
              : (modo === "edicion" ? "Actualizar Cotización" : "Guardar Cotización")}
          </button>
        </div>

      </form>
    </div>
  );
}

CotizacionForm.propTypes = {
  modo: PropTypes.string.isRequired,
};
