import { useUpdateCartera } from '../../hooks/crm/useUpdateCartera';

import { Link } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Building2, 
  Save,
  ArrowLeft,
  Receipt,
  Clock,
  CreditCard,
  AlertCircle
} from 'lucide-react';

export default function UpdateCartera() {
  const { 
    form,
    loading,
    errors,
    handleChange,
    handleUpdate
  } = useUpdateCartera(); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (errors) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Error cargando datos</p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0 
    }).format(value || 0);
  };
  



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Actualizar Cartera</h1>
                <p className="text-gray-600 text-sm">Factura: {form.numero_factura}</p>
              </div>
            </div>
            <Link
              to="/auth/crm/cartera-clientes"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
          </div>
        </div>

        {/* Info Cliente y Comercial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Cliente */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Cliente</h3>
            </div>
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">{form.cliente?.nombre || 'N/A'}</p>
              <p className="text-gray-600 text-sm">{form.cliente?.email}</p>
            </div>
          </div>

          {/* Comercial */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Comercial</h3>
            </div>
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">{form.comercial?.name || 'N/A'}</p>
              <p className="text-gray-600 text-sm">{form.comercial?.email}</p>
              <p className="text-gray-600 text-sm">{form.comercial?.telefono}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleUpdate}>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Datos de la Factura</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Número de Factura */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Número de Factura
                </label>
                <input
                  type="text"
                  name="numero_factura"
                  value={form.numero_factura || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Fecha Factura */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Fecha de Factura
                </label>
                <input
                  type="date"
                  name="fecha_factura"
                  value={form.fecha_factura || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>


              {/* Días Crédito */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  Días de Crédito
                </label>
                <input
                  type="number"
                  name="dias_credito"
                  value={form.dias_credito || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Valor Total */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  Valor Total
                </label>
                <input
                  type="number"
                  name="valor_total"
                  value={form.valor_total || ''}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

          {/* Base */}
<div className="space-y-2">
  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
    <DollarSign className="w-4 h-4 text-gray-500" />
    Base
  </label>
  <input
    type="number"
    name="base"
    value={form.base || ''}
    onChange={handleChange}
    step="0.01"
    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
  />
</div>

{/* IVA con porcentaje */}
<div className="space-y-2">
  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
    <DollarSign className="w-4 h-4 text-gray-500" />
    IVA (%)
  </label>
  <div className="flex gap-2">
    <input
      type="number"
      name="porcentaje_iva"
      value={form.porcentaje_iva || ''}
      onChange={handleChange}
      placeholder="%"
      className="w-20 border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <input
      type="text"
      value={formatCurrency(form.iva)}
      readOnly
      className="flex-1 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-600"
    />
  </div>
</div>

{/* Rete Renta con porcentaje */}
<div className="space-y-2">
  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
    <DollarSign className="w-4 h-4 text-gray-500" />
    Rete Renta (%)
  </label>
  <div className="flex gap-2">
    <input
      type="number"
      name="porcentaje_rete_renta"
      value={form.porcentaje_rete_renta || ''}
      onChange={handleChange}
      placeholder="%"
      className="w-20 border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <input
      type="text"
      value={formatCurrency(form.rete_renta)}
      readOnly
      className="flex-1 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-600"
    />
  </div>
</div>

{/* Rete ICA con porcentaje */}
<div className="space-y-2">
  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
    <DollarSign className="w-4 h-4 text-gray-500" />
    Rete ICA (%)
  </label>
  <div className="flex gap-2">
    <input
      type="number"
      name="porcentaje_rete_ica"
      value={form.porcentaje_rete_ica || ''}
      onChange={handleChange}
      placeholder="%"
      className="w-20 border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <input
      type="text"
      value={formatCurrency(form.rete_ica)}
      readOnly
      className="flex-1 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-600"
    />
  </div>
</div>

{/* Valor Total (calculado automáticamente) */}
<div className="space-y-2">
  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
    <DollarSign className="w-4 h-4 text-gray-500" />
    Valor Total
  </label>
  <input
    type="text"
    value={formatCurrency(form.valor_total)}
    readOnly
    className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-green-50 text-green-700 font-semibold"
  />
</div>
              {/* Saldo Pendiente */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  Saldo Pendiente
                </label>
                <input
                  type="text"
                  value={formatCurrency(form.saldo_pendiente)}
                  readOnly
                  title="Se recalcula automáticamente a partir de los abonos registrados"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-yellow-50 text-gray-600"
                />
              </div>

         

              {/* Observaciones */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={form.observaciones || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones adicionales..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Resumen de Pagos */}
          {form.pagos && form.pagos.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Pagos Registrados ({form.pagos.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Fecha</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Monto</th>
     
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {form.pagos.map((pago, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{pago.fecha_pago}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(pago.valor_pago)}</td>
          
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Botón Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}