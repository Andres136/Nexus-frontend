import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Download,
  Eye,
  FilePlus2,
  Loader2,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import {
  ESTADOS_REQUERIMIENTO_COMPRA,
  PRIORIDADES_REQUERIMIENTO_COMPRA,
  estadoRequerimientoCompraStyles,
  formatRequerimientoDate,
  productoRequerimientoLabel,
  useRequerimientosCompra,
} from "../../hooks/crm/useRequerimientosCompra";

export default function RequerimientosCompra({ modo = "mis" }) {
  const esGestion = modo === "gestion";
  const navigate = useNavigate();
  const {
    filters,
    pagination,
    rows,
    loading,
    saving,
    showForm,
    setShowForm,
    form,
    productSearch,
    setProductSearch,
    products,
    loadingProducts,
    bodegas,
    proveedores,
    sedes,
    resumen,
    aplicarFiltros,
    limpiarFiltros,
    updateDetalle,
    updateFormField,
    updateFilterField,
    addDetalle,
    removeDetalle,
    crearRequerimiento,
    descargarPdf,
    refrescarListado,
    setPage,
  } = useRequerimientosCompra({ modo });

  const abrirDetalle = (item) => {
    const basePath = esGestion
      ? "/auth/crm/requerimientos-compra/gestion"
      : "/auth/crm/requerimientos-compra";
    navigate(`${basePath}/${item.uuid}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              {esGestion ? "Compras" : "Solicitudes"}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {esGestion ? "Gestionar requerimientos" : "Mis requerimientos"}
            </h1>
            <p className="text-sm text-gray-600">
              {esGestion
                ? "Analisis por sede, aprobacion y generacion de orden de compra."
                : "Crea solicitudes internas y consulta su estado."}
            </p>
          </div>
          {!esGestion && (
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${
                showForm
                  ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FilePlus2 className="h-4 w-4" />
              {showForm ? "Ver solicitudes" : "Nuevo requerimiento"}
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">En pantalla</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{resumen.total}</p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Solicitados</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{resumen.solicitado || 0}</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Aprobados</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{resumen.aprobado || 0}</p>
          </div>
          <div className="rounded-lg border border-purple-100 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Con OC</p>
            <p className="mt-1 text-2xl font-bold text-purple-700">{resumen.oc_generada || 0}</p>
          </div>
        </div>

        {showForm && (
          <form onSubmit={crearRequerimiento} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Solicitud del usuario</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <label className="text-sm font-medium text-gray-700">
                Bodega
                <select
                  value={form.bodega_id}
                  onChange={(e) => updateFormField("bodega_id", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Bodega de mi sede</option>
                  {bodegas.map((bodega) => (
                    <option key={bodega.id} value={bodega.id}>
                      {bodega.nombre} {bodega.sede?.nombre ? `- ${bodega.sede.nombre}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                Prioridad
                <select
                  value={form.prioridad}
                  onChange={(e) => updateFormField("prioridad", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  {PRIORIDADES_REQUERIMIENTO_COMPRA.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                Fecha requerida
                <input
                  type="date"
                  value={form.fecha_requerida}
                  onChange={(e) => updateFormField("fecha_requerida", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Buscar producto
                <input
                  type="search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Codigo o nombre"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium text-gray-700">
              Observacion general
              <textarea
                value={form.observacion}
                onChange={(e) => updateFormField("observacion", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto o referencia</th>
                    <th className="px-3 py-2 text-left">Cantidad</th>
                    <th className="px-3 py-2 text-left">Costo estimado</th>
                    <th className="px-3 py-2 text-left">Proveedor sugerido</th>
                    <th className="px-3 py-2 text-left">Nota</th>
                    <th className="px-3 py-2 text-center">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {form.detalles.map((detalle, index) => (
                    <tr key={index}>
                      <td className="min-w-[260px] px-3 py-2">
                        <select
                          value={detalle.producto_id}
                          onChange={(e) => updateDetalle(index, "producto_id", e.target.value)}
                          className="mb-2 w-full rounded-md border border-gray-300 px-2 py-2"
                        >
                          <option value="">
                            {loadingProducts ? "Cargando productos..." : "Sin producto del catalogo"}
                          </option>
                          {products.map((producto) => (
                            <option key={producto.id} value={producto.id}>
                              {productoRequerimientoLabel(producto)}
                            </option>
                          ))}
                        </select>
                        <input
                          value={detalle.referencia_sugerida}
                          onChange={(e) => updateDetalle(index, "referencia_sugerida", e.target.value)}
                          placeholder="Referencia si no existe en catalogo"
                          className="w-full rounded-md border border-gray-300 px-2 py-2"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={detalle.cantidad_solicitada}
                          onChange={(e) => updateDetalle(index, "cantidad_solicitada", e.target.value)}
                          className="w-24 rounded-md border border-gray-300 px-2 py-2"
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={detalle.costo_estimado}
                          onChange={(e) => updateDetalle(index, "costo_estimado", e.target.value)}
                          className="w-28 rounded-md border border-gray-300 px-2 py-2"
                        />
                      </td>
                      <td className="min-w-[180px] px-3 py-2">
                        <select
                          value={detalle.proveedor_sugerido_id}
                          onChange={(e) => updateDetalle(index, "proveedor_sugerido_id", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-2 py-2"
                        >
                          <option value="">Sin sugerir</option>
                          {proveedores.map((proveedor) => (
                            <option key={proveedor.id} value={proveedor.id}>
                              {proveedor.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="min-w-[180px] px-3 py-2">
                        <input
                          value={detalle.observacion}
                          onChange={(e) => updateDetalle(index, "observacion", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-2 py-2"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeDetalle(index)}
                          className="rounded-md p-2 text-red-600 hover:bg-red-50"
                          aria-label="Quitar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={addDetalle}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Agregar item
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Enviar a compras
              </button>
            </div>
          </form>
        )}

        {(!showForm || esGestion) && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className={esGestion ? "grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_auto_auto]" : "grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto_auto]"}>
            <label className="text-sm font-medium text-gray-700">
              Buscar
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  value={filters.search}
                  onChange={(e) => updateFilterField("search", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
                  placeholder="Codigo, usuario u observacion"
                  className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm"
                />
              </div>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Estado
              <select
                value={filters.estado}
                onChange={(e) => updateFilterField("estado", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {ESTADOS_REQUERIMIENTO_COMPRA.map((estado) => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
            </label>
            {esGestion && (
              <label className="text-sm font-medium text-gray-700">
                Sede
                <select
                  value={filters.sede_id}
                  onChange={(e) => updateFilterField("sede_id", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Todas</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="text-sm font-medium text-gray-700">
              Desde
              <input
                type="date"
                value={filters.fecha_inicio}
                onChange={(e) => updateFilterField("fecha_inicio", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Hasta
              <input
                type="date"
                value={filters.fecha_fin}
                onChange={(e) => updateFilterField("fecha_fin", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={aplicarFiltros}
              className="self-end rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Filtrar
            </button>
            <button
              type="button"
              onClick={limpiarFiltros}
              className="self-end rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        </div>
        )}

        {(!showForm || esGestion) && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">Solicitudes</h2>
              </div>
              <button
                type="button"
                onClick={refrescarListado}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Actualizar"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Codigo</th>
                    <th className="px-4 py-3 text-left">Solicitante</th>
                    <th className="px-4 py-3 text-left">Sede / bodega</th>
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                        Cargando requerimientos...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                        No hay requerimientos con estos filtros.
                      </td>
                    </tr>
                  ) : rows.map((item) => (
                    <tr key={item.uuid} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{item.codigo}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.solicitante?.name} {item.solicitante?.apellidos ?? ""}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{item.sede?.nombre ?? "Sin sede"}</div>
                        <div className="text-xs text-gray-400">{item.bodega?.nombre ?? "Sin bodega"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{formatRequerimientoDate(item.fecha_solicitud)}</div>
                        <div className="text-xs text-gray-400">Req: {formatRequerimientoDate(item.fecha_requerida)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${estadoRequerimientoCompraStyles[item.estado] ?? estadoRequerimientoCompraStyles.cancelado}`}>
                          {item.estado?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => abrirDetalle(item)}
                            className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                            aria-label="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => descargarPdf(item)}
                            className="rounded-md bg-gray-700 p-2 text-white hover:bg-gray-800"
                            aria-label="Descargar PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm">
              <button
                type="button"
                disabled={pagination.current_page <= 1 || loading}
                onClick={() => setPage(pagination.current_page - 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-gray-600">
                Pagina {pagination.current_page ?? 1} de {pagination.last_page ?? 1}
              </span>
              <button
                type="button"
                disabled={pagination.current_page >= pagination.last_page || loading}
                onClick={() => setPage(pagination.current_page + 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
        </div>
        )}
      </div>
    </div>
  );
}

RequerimientosCompra.propTypes = {
  modo: PropTypes.oneOf(["mis", "gestion"]),
};
