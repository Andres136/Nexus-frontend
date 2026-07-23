import OrdenCompraMultiItem from "../../components/crm/OrdenCompraMultiItem";
import { useClientes } from "../../hooks/useClientes";
import { useAuth } from "../../hooks/useAuth";
import { Link, useParams } from "react-router-dom";
import Select from "react-select";
import { useEmpresas } from "../../hooks/useEmpresas";
import useOrdenCompraForm from "../../hooks/crm/useOrdenCompraForm";
import { downloadOrdenPdf } from "../../services/ordenCompraService";

export default function OrdenCompraForm({ modo }) {
  const { id } = useParams();
  const { empresas } = useEmpresas();
  const { clientesTodos } = useClientes();
  useAuth({ middleware: "auth" });

  const {
    formData,
    setFormData,
    errores,
    erroresDetalles,
    guardando,
    mostrarModalObservaciones,
    setMostrarModalObservaciones,
    handleInputChange,
    handleFileChange,
    handleDetallesChange,
    enviarOrden,
  } = useOrdenCompraForm({ modo, id });

  const opcionesClientes = clientesTodos.map((c) => ({ value: c.id, label: c.nombre }));

  return (
    <div className="grid grid-cols-1 mx-auto p-3 bg-white">

      {/* Modal observaciones */}
      {mostrarModalObservaciones && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Observaciones</h3>
                <p className="text-sm text-gray-600">
                  Incluye detalles adicionales como horarios, condiciones especiales o compromisos acordados.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setMostrarModalObservaciones(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {modo === "edicion" ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {modo === "edicion" ? "Modifica los detalles de la orden" : "Completa la información requerida"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/auth/crm/mis-ordenes"
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ← Mis Órdenes
          </Link>
          <Link
            to="/auth/crm/cotizaciones"
            className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Cotizaciones
          </Link>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
            <input
              type="date"
              name="fecha_entrega"
              value={formData.fecha_entrega}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errores.fecha_entrega && (
              <p className="text-sm text-red-600 mt-1">{errores.fecha_entrega}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <Select
              options={opcionesClientes}
              value={opcionesClientes.find((o) => o.value === formData.cliente_id) || null}
              onChange={(opt) => setFormData((f) => ({ ...f, cliente_id: opt ? opt.value : "" }))}
              isClearable
              placeholder="Seleccionar cliente..."
              className="text-sm"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: errores.cliente_id ? "#dc2626" : state.isFocused ? "#3b82f6" : "#d1d5db",
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.2)" : "none",
                  "&:hover": { borderColor: "#3b82f6" },
                }),
              }}
            />
            {errores.cliente_id && (
              <p className="text-sm text-red-600 mt-1">{errores.cliente_id}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación de Entrega</label>
            <input
              type="text"
              name="ubicacion_entrega"
              placeholder="Dirección completa y número de contacto"
              value={formData.ubicacion_entrega}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errores.ubicacion_entrega && (
              <p className="text-sm text-red-600 mt-1">{errores.ubicacion_entrega}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Orden de Compra del Cliente
            </label>
            <input
              type="text"
              name="orden_compra_cliente"
              placeholder="Número o referencia que dio el cliente"
              value={formData.orden_compra_cliente}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errores.orden_compra_cliente && (
              <p className="text-sm text-red-600 mt-1">{errores.orden_compra_cliente}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden de Compra del Cliente (Archivo)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              name="cliente_documento"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gray-50 file:text-gray-700"
            />
            {errores.cliente_documento && (
              <p className="text-sm text-red-600 mt-1">{errores.cliente_documento}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <Select
              options={empresas.map((e) => ({ value: e.id, label: e.nombre }))}
              value={
                empresas.map((e) => ({ value: e.id, label: e.nombre })).find(
                  (o) => o.value === formData.empresa_id
                ) || null
              }
              onChange={(opt) => setFormData((f) => ({ ...f, empresa_id: opt ? opt.value : "" }))}
              isClearable
              placeholder="Seleccionar empresa..."
              className="text-sm"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: errores.empresa_id ? "#dc2626" : state.isFocused ? "#3b82f6" : "#d1d5db",
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.2)" : "none",
                  "&:hover": { borderColor: "#3b82f6" },
                }),
              }}
            />
            {errores.empresa_id && (
              <p className="text-sm text-red-600 mt-1">{errores.empresa_id}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              placeholder="Información adicional sobre la orden..."
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errores.observaciones && (
              <p className="text-sm text-red-600 mt-1">{errores.observaciones}</p>
            )}
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-gray-50 rounded-lg p-4">
          <OrdenCompraMultiItem
            onDetallesChange={handleDetallesChange}
            errores={erroresDetalles}
            value={formData.detalles}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {modo === "edicion" && (
            <button
              onClick={enviarOrden}
              disabled={guardando}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-md transition-colors"
            >
              {guardando ? "Actualizando..." : "Actualizar Orden"}
            </button>
          )}

          {modo !== "edicion" && (
            <button
              onClick={enviarOrden}
              disabled={guardando}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
            >
              {guardando ? "Guardando..." : "Guardar Orden"}
            </button>
          )}

          {modo === "edicion" && id && (
            <button
              type="button"
              onClick={() => downloadOrdenPdf(id)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
            >
              Descargar PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
