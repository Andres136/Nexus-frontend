import PropTypes from "prop-types";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit3,
  Loader2,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  PRIORIDADES_REQUERIMIENTO_COMPRA,
  estadoRequerimientoCompraStyles,
  formatRequerimientoDate,
  productoRequerimientoLabel,
} from "../../hooks/crm/useRequerimientosCompra";
import { useRequerimientoCompraDetalle } from "../../hooks/crm/useRequerimientoCompraDetalle";

export default function RequerimientoCompraDetalle({ modo = "mis" }) {
  const {
    requerimiento,
    loading,
    saving,
    esGestion,
    puedeGestionar,
    puedeEditar,
    canApprove,
    editMode,
    setEditMode,
    editForm,
    productSearch,
    setProductSearch,
    products,
    loadingProducts,
    bodegas,
    proveedores,
    empresas,
    ocForm,
    updateOcField,
    volver,
    updateFormField,
    updateDetalle,
    addDetalle,
    removeDetalle,
    guardarEdicion,
    analizar,
    aprobar,
    rechazar,
    generarOrdenCompra,
    descargarPdf,
  } = useRequerimientoCompraDetalle({ modo });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500">
          Cargando requerimiento...
        </div>
      </div>
    );
  }

  if (!requerimiento) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500">
          No se encontro el requerimiento.
        </div>
      </div>
    );
  }

  const estadoClass = estadoRequerimientoCompraStyles[requerimiento.estado] ?? estadoRequerimientoCompraStyles.cancelado;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <button
              type="button"
              onClick={volver}
              className="mb-3 inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              {esGestion ? "Gestion de compras" : "Mis requerimientos"}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{requerimiento.codigo}</h1>
            <p className="text-sm text-gray-600">
              {requerimiento.solicitante?.name} {requerimiento.solicitante?.apellidos ?? ""} / {requerimiento.sede?.nombre ?? "Sin sede"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${estadoClass}`}>
              {requerimiento.estado?.replace("_", " ")}
            </span>
            <button
              type="button"
              onClick={descargarPdf}
              className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
            {puedeEditar && !editMode && (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Fecha solicitud</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{formatRequerimientoDate(requerimiento.fecha_solicitud)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Fecha requerida</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{formatRequerimientoDate(requerimiento.fecha_requerida)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Bodega</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{requerimiento.bodega?.nombre ?? "Sin bodega"}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Prioridad</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{requerimiento.prioridad}</p>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={guardarEdicion} className="space-y-4 rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Editar requerimiento</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <label className="text-sm font-medium text-gray-700">
                Bodega
                <select value={editForm.bodega_id} onChange={(e) => updateFormField("bodega_id", e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Sin bodega</option>
                  {bodegas.map((bodega) => (
                    <option key={bodega.id} value={bodega.id}>{bodega.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                Prioridad
                <select value={editForm.prioridad} onChange={(e) => updateFormField("prioridad", e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  {PRIORIDADES_REQUERIMIENTO_COMPRA.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                Fecha requerida
                <input type="date" value={editForm.fecha_requerida} onChange={(e) => updateFormField("fecha_requerida", e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Buscar producto
                <input type="search" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Codigo o nombre" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
              </label>
            </div>

            <label className="block text-sm font-medium text-gray-700">
              Observacion
              <textarea value={editForm.observacion} onChange={(e) => updateFormField("observacion", e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </label>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto o referencia</th>
                    <th className="px-3 py-2 text-left">Solicitada</th>
                    <th className="px-3 py-2 text-left">Aprobada</th>
                    <th className="px-3 py-2 text-left">Proveedor</th>
                    <th className="px-3 py-2 text-left">Nota</th>
                    <th className="px-3 py-2 text-center">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {editForm.detalles.map((detalle, index) => (
                    <tr key={index}>
                      <td className="min-w-[320px] px-3 py-2">
                        <select value={detalle.producto_id} onChange={(e) => updateDetalle(index, "producto_id", e.target.value)} className="mb-2 w-full rounded-md border border-gray-300 px-2 py-2">
                          <option value="">{loadingProducts ? "Cargando..." : "Sin producto del catalogo"}</option>
                          {products.map((producto) => (
                            <option key={producto.id} value={producto.id}>{productoRequerimientoLabel(producto)}</option>
                          ))}
                        </select>
                        <input value={detalle.referencia_sugerida} onChange={(e) => updateDetalle(index, "referencia_sugerida", e.target.value)} placeholder="Referencia si no existe" className="w-full rounded-md border border-gray-300 px-2 py-2" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0.01" step="0.01" value={detalle.cantidad_solicitada} onChange={(e) => updateDetalle(index, "cantidad_solicitada", e.target.value)} className="w-28 rounded-md border border-gray-300 px-2 py-2" required />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" step="0.01" value={detalle.cantidad_aprobada} onChange={(e) => updateDetalle(index, "cantidad_aprobada", e.target.value)} className="w-28 rounded-md border border-gray-300 px-2 py-2" />
                      </td>
                      <td className="min-w-[180px] px-3 py-2">
                        <select value={detalle.proveedor_sugerido_id} onChange={(e) => updateDetalle(index, "proveedor_sugerido_id", e.target.value)} className="w-full rounded-md border border-gray-300 px-2 py-2">
                          <option value="">Sin sugerir</option>
                          {proveedores.map((proveedor) => (
                            <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td className="min-w-[220px] px-3 py-2">
                        <input value={detalle.observacion} onChange={(e) => updateDetalle(index, "observacion", e.target.value)} className="w-full rounded-md border border-gray-300 px-2 py-2" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeDetalle(index)} className="rounded-md p-2 text-red-600 hover:bg-red-50" aria-label="Quitar item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addDetalle} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Plus className="h-4 w-4" />
              Agregar item
            </button>
          </form>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-gray-900">Productos solicitados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Producto / referencia</th>
                    <th className="px-4 py-3 text-left">Solicitada</th>
                    <th className="px-4 py-3 text-left">Aprobada</th>
                    <th className="px-4 py-3 text-left">Comprada</th>
                    <th className="px-4 py-3 text-left">Proveedor sugerido</th>
                    <th className="px-4 py-3 text-left">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(requerimiento.detalles ?? []).map((detalle) => (
                    <tr key={detalle.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {detalle.producto ? productoRequerimientoLabel(detalle.producto) : detalle.referencia_sugerida}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{detalle.cantidad_solicitada}</td>
                      <td className="px-4 py-3 text-gray-700">{detalle.cantidad_aprobada ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{detalle.cantidad_comprada ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{detalle.proveedor_sugerido?.nombre ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{detalle.observacion ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {requerimiento.observacion && !editMode && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-2 font-semibold text-gray-900">Observacion</h2>
            <p className="text-sm text-gray-700">{requerimiento.observacion}</p>
          </div>
        )}

        {esGestion && puedeGestionar && !editMode && (
          <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-3 font-semibold text-gray-900">Acciones de compras</h2>
              <div className="flex flex-wrap gap-2">
                {requerimiento.estado === "solicitado" && (
                  <button type="button" disabled={saving} onClick={analizar} className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60">
                    <Search className="h-4 w-4" />
                    Analizar
                  </button>
                )}
                {canApprove && (
                  <button type="button" disabled={saving} onClick={aprobar} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                    <CheckCircle2 className="h-4 w-4" />
                    Aprobar
                  </button>
                )}
                {["solicitado", "en_analisis", "aprobado"].includes(requerimiento.estado) && (
                  <button type="button" disabled={saving} onClick={rechazar} className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                    <XCircle className="h-4 w-4" />
                    Rechazar
                  </button>
                )}
              </div>
            </div>

            {requerimiento.estado === "aprobado" && (
              <form onSubmit={generarOrdenCompra} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                  <h2 className="font-semibold text-gray-900">Generar orden de compra</h2>
                </div>
                <select value={ocForm.proveedor_id} onChange={(e) => updateOcField("proveedor_id", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required>
                  <option value="">Proveedor</option>
                  {proveedores.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                  ))}
                </select>
                <select value={ocForm.empresa_id} onChange={(e) => updateOcField("empresa_id", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required>
                  <option value="">Empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                  ))}
                </select>
                <select value={ocForm.bodega_id} onChange={(e) => updateOcField("bodega_id", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Bodega del requerimiento</option>
                  {bodegas.map((bodega) => (
                    <option key={bodega.id} value={bodega.id}>{bodega.nombre}</option>
                  ))}
                </select>
                <input type="date" value={ocForm.fecha_entrega} onChange={(e) => updateOcField("fecha_entrega", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                <textarea value={ocForm.observaciones} onChange={(e) => updateOcField("observaciones", e.target.value)} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                  Generar OC
                </button>
              </form>
            )}
          </div>
        )}

        {requerimiento.orden_compra && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
            <p className="font-semibold">Orden generada: {requerimiento.orden_compra.numero_orden}</p>
            <p>{requerimiento.orden_compra.proveedor?.nombre ?? "Sin proveedor"}</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-gray-900">Trazabilidad</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {(requerimiento.eventos ?? []).map((evento) => (
              <div key={evento.id} className="border-l-2 border-blue-200 pl-3">
                <p className="text-sm font-medium text-gray-900">{evento.tipo_evento}</p>
                <p className="text-xs text-gray-500">
                  {formatRequerimientoDate(evento.created_at)} - {evento.usuario?.name ?? "Sistema"}
                </p>
                {evento.comentario && <p className="mt-1 text-xs text-gray-600">{evento.comentario}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

RequerimientoCompraDetalle.propTypes = {
  modo: PropTypes.oneOf(["mis", "gestion"]),
};
