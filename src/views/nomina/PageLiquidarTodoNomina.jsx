import PropTypes from "prop-types";
import { Download, Search, Users } from "lucide-react";
import { useLiquidarTodoNomina } from "../../hooks/nomina/useLiquidarTodoNomina";

function formatCOP(value) {
  if (!value && value !== 0) return "$ 0";
  return "$ " + Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function totalHorasExtra(calculo = {}) {
  return Number(calculo.horas_extras_diurnas || 0)
    + Number(calculo.horas_extras_nocturnas || 0)
    + Number(calculo.horas_festivas || 0)
    + Number(calculo.horas_nocturnas_festivas || 0);
}

function valorHorasExtra(calculo = {}) {
  return Number(calculo.valor_horas_extras_diurnas || 0)
    + Number(calculo.valor_horas_extras_nocturnas || 0)
    + Number(calculo.valor_horas_festivas || 0)
    + Number(calculo.valor_horas_nocturnas_festivas || 0);
}

function Pagination({ page, totalPaginas, total, onPage }) {
  if (totalPaginas <= 1) return null;
  const pages = [];

  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPaginas - 1, page + 1); i++) pages.push(i);
    if (page < totalPaginas - 2) pages.push("...");
    pages.push(totalPaginas);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">{total} empleados encontrados</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white border border-indigo-600"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPaginas}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
        >
          ›
        </button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPaginas: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
};

export default function PageLiquidarTodoNomina() {
  const {
    formData,
    handleChange,
    fieldErrors,
    previewLoading,
    exportLoading,
    resultado,
    handlePreview,
    handleDescargarExcel,
    jornadas,
    loadingJornadas,
    empresas,
    loadingEmpresas,
    searchEmpleados,
    handleSearchEmpleados,
    empleadosFiltrados,
    empleadosPaginados,
    page,
    setPage,
    totalPaginas,
    excluidosTardanza,
    toggleExcluirTardanza,
    decisionesPermisos,
    togglePermisoIndividual,
    responsableId,
    setResponsableId,
    responsables,
    loadingResponsables,
    enviandoAprobacion,
    handleEnviarAprobacion,
  } = useLiquidarTodoNomina();

  const inputClass = (field) =>
    `block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden box-border p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          Liquidar todo
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Calcula la preliquidación (valor y horas extra incluidos) de todos los empleados activos con contrato
          vigente en el período. Solo es un cálculo de vista previa, no crea ni liquida nóminas.
        </p>
      </div>

      <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="periodo_inicio"
              value={formData.periodo_inicio}
              onChange={handleChange}
              className={inputClass("periodo_inicio")}
            />
            {fieldErrors.periodo_inicio && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.periodo_inicio[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="periodo_fin"
              value={formData.periodo_fin}
              onChange={handleChange}
              className={inputClass("periodo_fin")}
            />
            {fieldErrors.periodo_fin && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.periodo_fin[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jornada laboral (aplica a todo el lote) <span className="text-red-500">*</span>
            </label>
            <select
              name="jornada_laboral_id"
              value={formData.jornada_laboral_id}
              onChange={handleChange}
              disabled={loadingJornadas}
              className={inputClass("jornada_laboral_id")}
            >
              <option value="">{loadingJornadas ? "Cargando..." : "Seleccionar jornada..."}</option>
              {jornadas.map((j) => (
                <option key={j.id} value={j.id}>{j.nombre} · {j.horas_semanales} h/semana</option>
              ))}
            </select>
            {fieldErrors.jornada_laboral_id && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.jornada_laboral_id[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <select
              name="empresa_id"
              value={formData.empresa_id}
              onChange={handleChange}
              disabled={loadingEmpresas}
              className={inputClass("empresa_id")}
            >
              <option value="">{loadingEmpresas ? "Cargando..." : "Todas las empresas"}</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
              ))}
            </select>
            {fieldErrors.empresa_id && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.empresa_id[0]}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewLoading || !formData.periodo_inicio || !formData.periodo_fin || !formData.jornada_laboral_id}
              className="h-10 px-4 flex-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {previewLoading ? "Calculando..." : "Calcular preview"}
            </button>
            {resultado && resultado.empleados.length > 0 && (
              <button
                type="button"
                onClick={handleDescargarExcel}
                disabled={exportLoading}
                className="h-10 px-3 inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4" />
                {exportLoading ? "..." : "Excel"}
              </button>
            )}
          </div>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="descontar_tardanzas"
            checked={formData.descontar_tardanzas}
            onChange={handleChange}
          />
          Descontar tardanzas del pago (si no se marca, solo se muestran de referencia)
        </label>
        {formData.descontar_tardanzas && (
          <p className="mt-1 text-xs text-gray-400">
            Después de calcular, puedes desmarcar la casilla &quot;Descontar tardanza&quot; de un empleado puntual en
            la tabla de resultados para excluirlo de este descuento.
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Los permisos no remunerados se descuentan por defecto para todos. Después de calcular, puedes desmarcar
          &quot;Descontar permiso&quot; de un empleado puntual para excluirlo.
        </p>
      </div>

      {resultado && resultado.empleados.length > 0 && (
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-sm font-semibold text-indigo-900">Enviar a aprobación</p>
          <p className="mt-1 text-xs text-indigo-700">
            Genera en borrador la preliquidación de los {resultado.empleados.length} empleados calculados y le envía
            un correo al responsable con un enlace para revisar y aprobar. Al aprobar, la nómina queda liquidada de inmediato.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-[240px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable que aprueba</label>
              <select
                value={responsableId}
                onChange={(e) => setResponsableId(e.target.value)}
                disabled={loadingResponsables}
                className="block w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">{loadingResponsables ? "Cargando..." : "Seleccionar responsable..."}</option>
                {responsables.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleEnviarAprobacion}
              disabled={enviandoAprobacion || !responsableId}
              className="h-10 px-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {enviandoAprobacion ? "Enviando..." : "Enviar a aprobación"}
            </button>
          </div>
        </div>
      )}

      {resultado && (
        <>
          {resultado.errores.length > 0 && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">
                {resultado.errores.length} empleado(s) no se pudieron calcular
              </p>
              {resultado.errores.map((error) => (
                <p key={error.user_id} className="mt-1 text-xs text-amber-700">
                  {error.empleado}: {error.message}
                </p>
              ))}
            </div>
          )}

          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Empleados calculados</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{resultado.totales.empleados_calculados}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Devengado</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCOP(resultado.totales.total_devengado)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Deducciones</p>
              <p className="text-xl font-bold text-orange-600 mt-1">{formatCOP(resultado.totales.total_deducciones)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Neto a pagar</p>
              <p className="text-xl font-bold text-green-700 mt-1">{formatCOP(resultado.totales.salario_neto)}</p>
            </div>
          </div>

          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-500">
                Horas extra del lote
              </p>
              <div className="grid gap-2 text-xs sm:grid-cols-2">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Diurnas ({resultado.totales.horas_extras_diurnas} h)</span>
                  <span className="font-medium text-gray-900">{formatCOP(resultado.totales.valor_horas_extras_diurnas)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Nocturnas ({resultado.totales.horas_extras_nocturnas} h)</span>
                  <span className="font-medium text-gray-900">{formatCOP(resultado.totales.valor_horas_extras_nocturnas)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Festivas ({resultado.totales.horas_festivas} h)</span>
                  <span className="font-medium text-gray-900">{formatCOP(resultado.totales.valor_horas_festivas)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Noct. festivas ({resultado.totales.horas_nocturnas_festivas} h)</span>
                  <span className="font-medium text-gray-900">{formatCOP(resultado.totales.valor_horas_nocturnas_festivas)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-500">
                Tardanzas y permisos del lote
                {resultado.descuenta_tardanzas ? (
                  <span className="ml-2 normal-case font-normal text-red-600">(tardanzas descontadas del pago)</span>
                ) : (
                  <span className="ml-2 normal-case font-normal text-gray-400">(tardanzas solo de referencia)</span>
                )}
              </p>
              <div className="grid gap-2 text-xs sm:grid-cols-2">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Tardanzas ({resultado.totales.minutos_tardanza} min)</span>
                  <span className="font-medium text-gray-900">{formatCOP(resultado.totales.valor_tardanzas)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Permisos no remunerados ({resultado.totales.minutos_permisos_no_remunerados} min)</span>
                  <span className="font-medium text-gray-900">{formatCOP(resultado.totales.valor_permisos_no_remunerados)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Préstamos / descuentos</span>
                  <span className="font-medium text-gray-900">{formatCOP(resultado.totales.valor_prestamos)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 px-4 py-4 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Empleados calculados ({empleadosFiltrados.length})
              </h3>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchEmpleados}
                  onChange={handleSearchEmpleados}
                  placeholder="Buscar empleado por nombre..."
                  className="pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                />
              </div>
            </div>

            {empleadosFiltrados.length === 0 ? (
              <div className="text-center py-16 text-sm text-gray-400">
                {resultado.empleados.length === 0
                  ? "No hay empleados calculados en este período."
                  : "Ningún empleado coincide con la búsqueda."}
              </div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto">
                <table className="w-full min-w-[760px] divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Horas extra</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tardanza</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Préstamos</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Devengado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Neto</th>
                      {formData.descontar_tardanzas && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descontar tardanza
                        </th>
                      )}
                      <th className="min-w-[260px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Decisión por permiso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {empleadosPaginados.map((calculo) => (
                      <tr key={calculo.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-gray-800">{calculo.empleado.name}</td>
                        <td className="px-4 py-3.5 text-right text-gray-700">
                          {totalHorasExtra(calculo)} h
                          {valorHorasExtra(calculo) > 0 && (
                            <p className="text-xs text-emerald-600">{formatCOP(valorHorasExtra(calculo))}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right text-gray-700">{calculo.minutos_tardanza} min</td>
                        <td className="px-4 py-3.5 text-right text-gray-700">{calculo.minutos_permisos_no_remunerados} min</td>
                        <td className="px-4 py-3.5 text-right text-gray-700">{formatCOP(calculo.valor_prestamos)}</td>
                        <td className="px-4 py-3.5 text-right text-gray-700">{formatCOP(calculo.total_devengado)}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-green-700">{formatCOP(calculo.salario_neto)}</td>
                        {formData.descontar_tardanzas && (
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={!excluidosTardanza.includes(calculo.user_id)}
                              onChange={() => toggleExcluirTardanza(calculo.user_id)}
                              disabled={previewLoading || calculo.minutos_tardanza === 0}
                              title={
                                calculo.minutos_tardanza === 0
                                  ? "Este empleado no tiene tardanza en el período"
                                  : "Desmarca para no descontarle la tardanza a este empleado"
                              }
                            />
                          </td>
                        )}
                        <td className="px-4 py-3.5">
                          {(calculo.detalle_permisos ?? []).length === 0 ? (
                            <span className="text-xs text-gray-400">Sin permisos aprobados</span>
                          ) : (
                            <div className="space-y-2">
                              {calculo.detalle_permisos.map((permiso) => {
                                const seleccionado = (decisionesPermisos[calculo.user_id] ?? [])
                                  .includes(permiso.id);
                                return (
                                  <label key={permiso.id} className="flex cursor-pointer items-start gap-2 text-left">
                                    <input
                                      type="checkbox"
                                      checked={seleccionado}
                                      onChange={() => togglePermisoIndividual(calculo.user_id, permiso.id)}
                                      disabled={previewLoading}
                                      className="mt-0.5"
                                    />
                                    <span className="text-xs text-gray-600">
                                      <span className="font-medium text-gray-800">
                                        {String(permiso.fecha).slice(0, 10)} · {permiso.minutos} min
                                      </span>
                                      <span className="block">
                                        {permiso.es_remunerado ? "Registrado remunerado" : "Registrado no remunerado"}
                                        {" · "}
                                        <strong className={seleccionado ? "text-amber-700" : "text-gray-400"}>
                                          {seleccionado ? "Descontar" : "No descontar"}
                                        </strong>
                                      </span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination page={page} totalPaginas={totalPaginas} total={empleadosFiltrados.length} onPage={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
