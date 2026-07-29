import PropTypes from "prop-types";
import Select from "react-select";
import { useLiquidarNomina } from "../../hooks/nomina/useLiquidarNomina";

function formatCOP(value) {
  if (!value && value !== 0) return "$ 0";
  return "$ " + Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function formatDate(value) {
  if (!value) return "—";
  return String(value).slice(0, 10);
}

function totalHorasExtra(preview = {}) {
  return Number(preview.horas_extras_diurnas || 0)
    + Number(preview.horas_extras_nocturnas || 0)
    + Number(preview.horas_festivas || 0)
    + Number(preview.horas_nocturnas_festivas || 0);
}

function valorHorasExtra(preview = {}) {
  return Number(preview.valor_horas_extras_diurnas || 0)
    + Number(preview.valor_horas_extras_nocturnas || 0)
    + Number(preview.valor_horas_festivas || 0)
    + Number(preview.valor_horas_nocturnas_festivas || 0);
}

const motivosRetiro = [
  { value: "renuncia", label: "Renuncia" },
  { value: "terminacion_sin_justa_causa", label: "Terminación sin justa causa" },
  { value: "terminacion_con_justa_causa", label: "Terminación con justa causa" },
  { value: "mutuo_acuerdo", label: "Mutuo acuerdo" },
  { value: "fin_contrato", label: "Fin de contrato" },
];

export default function FormLiquidarNomina({ onClose, initialData = {} }) {
  const {
    formData,
    handleChange,
    handleSelectEmpleado,
    handlePreview,
    handleSubmit,
    fieldErrors,
    loading,
    preview,
    previewLoading,
    auditLoading,
    ajusteForm,
    observacionRevision,
    setObservacionRevision,
    handleAjusteChange,
    agregarAjuste,
    eliminarAjuste,
    enviarRevision,
    aprobarPreliquidacion,
    empleados,
    loadingEmpleados,
    jornadas,
    loadingJornadas,
  } = useLiquidarNomina({ onSuccess: onClose, initialData });

  const inputClass = (field) =>
    `block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  const empleadoOptions = empleados.map((e) => ({ value: e.value, label: e.label }));
  const empleadoSeleccionado = empleadoOptions.find((e) => String(e.value) === String(formData.user_id)) ?? null;
  const jornadaSeleccionada = jornadas.find((j) => String(j.id) === String(formData.jornada_laboral_id));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Procesar Nómina</h2>
        <p className="text-sm text-gray-500 mt-1">
          Selecciona empleado, jornada y tipo de liquidación.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de liquidación
          </label>
          <select
            name="tipo_liquidacion"
            value={formData.tipo_liquidacion}
            onChange={handleChange}
            className={inputClass("tipo_liquidacion")}
          >
            <option value="nomina">Nómina periódica</option>
            <option value="retiro">Liquidación definitiva por retiro</option>
          </select>
        </div>

        {/* Empleado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empleado <span className="text-red-500">*</span>
          </label>
          <Select
            options={empleadoOptions}
            value={empleadoSeleccionado}
            isLoading={loadingEmpleados}
            onChange={handleSelectEmpleado}
            placeholder="Buscar empleado..."
            isClearable
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "40px",
                borderColor: fieldErrors.user_id ? "#f87171" : state.isFocused ? "#6366f1" : "#d1d5db",
                boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.3)" : "none",
                "&:hover": { borderColor: "#6366f1" },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#eef2ff" : "white",
                color: state.isSelected ? "white" : "#374151",
                fontSize: "0.875rem",
              }),
            }}
          />
          {fieldErrors.user_id && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.user_id[0]}</p>
          )}
        </div>

        {/* Jornada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jornada Laboral <span className="text-red-500">*</span>
          </label>
          <select
            name="jornada_laboral_id"
            value={formData.jornada_laboral_id}
            onChange={handleChange}
            disabled={loadingJornadas}
            className={inputClass("jornada_laboral_id")}
          >
            <option value="">{loadingJornadas ? "Cargando jornadas..." : "Seleccionar jornada laboral..."}</option>
            {jornadas.map((j) => (
              <option key={j.id} value={j.id}>{j.nombre} · {j.horas_semanales} h/semana</option>
            ))}
          </select>
          {fieldErrors.jornada_laboral_id && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.jornada_laboral_id[0]}</p>
          )}
        </div>

        {formData.tipo_liquidacion === "retiro" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de retiro <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_retiro"
                value={formData.fecha_retiro}
                onChange={handleChange}
                className={inputClass("fecha_retiro")}
              />
              {fieldErrors.fecha_retiro && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.fecha_retiro[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo <span className="text-red-500">*</span>
              </label>
              <select
                name="motivo_retiro"
                value={formData.motivo_retiro}
                onChange={handleChange}
                className={inputClass("motivo_retiro")}
              >
                {motivosRetiro.map((motivo) => (
                  <option key={motivo.value} value={motivo.value}>{motivo.label}</option>
                ))}
              </select>
              {fieldErrors.motivo_retiro && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.motivo_retiro[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indemnización manual
              </label>
              <input
                type="number"
                min="0"
                name="indemnizacion"
                value={formData.indemnizacion}
                onChange={handleChange}
                placeholder="0"
                className={inputClass("indemnizacion")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deducciones finales
              </label>
              <input
                type="number"
                min="0"
                name="deducciones"
                value={formData.deducciones}
                onChange={handleChange}
                placeholder="0"
                className={inputClass("deducciones")}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
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
            <label className="col-span-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="descontar_tardanzas"
                checked={formData.descontar_tardanzas}
                onChange={handleChange}
              />
              Descontar tardanzas del pago (si no se marca, solo se muestran de referencia)
            </label>
            <label className="col-span-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="descontar_permisos"
                checked={formData.descontar_permisos}
                onChange={handleChange}
              />
              Descontar permisos no remunerados del pago
            </label>
          </div>
        )}

        {preview && formData.tipo_liquidacion === "retiro" && (
          <div className="space-y-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
            <div>
              <p className="text-sm font-semibold text-amber-900">Vista previa de liquidación definitiva</p>
              <p className="mt-1 text-xs text-amber-700">
                Incluye salario pendiente, cesantías, intereses, prima, vacaciones e indemnización manual si aplica.
              </p>
            </div>
            {preview.advertencias?.length > 0 && (
              <div className="rounded-md border border-amber-300 bg-white p-3">
                <p className="text-xs font-semibold text-amber-800">Advertencia</p>
                {preview.advertencias.map((advertencia) => (
                  <p key={advertencia} className="mt-1 text-xs text-amber-700">{advertencia}</p>
                ))}
              </div>
            )}

            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md bg-white/80 p-3">
                <p className="text-xs text-amber-600">Fecha retiro</p>
                <p className="font-semibold text-gray-900">{formatDate(preview.fecha_retiro)}</p>
              </div>
              <div className="rounded-md bg-white/80 p-3">
                <p className="text-xs text-amber-600">Días contrato</p>
                <p className="font-semibold text-gray-900">{preview.dias_contrato}</p>
              </div>
              <div className="rounded-md bg-white/80 p-3">
                <p className="text-xs text-amber-600">Total devengado</p>
                <p className="font-semibold text-gray-900">{formatCOP(preview.total_devengado)}</p>
              </div>
              <div className="rounded-md bg-white/80 p-3">
                <p className="text-xs text-amber-600">Neto a pagar</p>
                <p className="font-semibold text-green-700">{formatCOP(preview.neto_pagar)}</p>
              </div>
            </div>

            <div className="rounded-md border border-amber-100 bg-white p-3 text-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">Prestaciones y retiro</p>
              <div className="space-y-1.5">
                <div className="flex justify-between gap-3"><span className="text-gray-500">Salario pendiente</span><span className="font-medium">{formatCOP(preview.salario_pendiente)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Pago no prestacional pendiente</span><span className="font-medium">{formatCOP(preview.pago_no_prestacional)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Comisiones pendientes</span><span className="font-medium">{formatCOP(preview.comisiones_pendientes)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Cesantías ({preview.dias_cesantias} días)</span><span className="font-medium">{formatCOP(preview.cesantias)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Intereses cesantías</span><span className="font-medium">{formatCOP(preview.intereses_cesantias)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Prima ({preview.dias_prima} días)</span><span className="font-medium">{formatCOP(preview.prima_servicios)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Vacaciones ({preview.dias_vacaciones} días base)</span><span className="font-medium">{formatCOP(preview.vacaciones)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Indemnización</span><span className="font-medium">{formatCOP(preview.indemnizacion)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500">Deducciones finales</span><span className="font-medium">{formatCOP(preview.total_deducciones)}</span></div>
                {(preview.detalle_comisiones ?? []).map((comision) => (
                  <div key={comision.uuid} className="flex justify-between gap-3 pl-3 text-xs">
                    <span className="text-gray-400">{comision.concepto}</span>
                    <span className="font-medium text-gray-600">{formatCOP(comision.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {preview && formData.tipo_liquidacion !== "retiro" && (
          <div className="space-y-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-indigo-900">Preliquidación auditable</p>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {preview.estado_preliquidacion ?? "borrador"}
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-600">
                El cálculo original se conserva; cualquier corrección queda registrada como ajuste.
              </p>
            </div>
            {preview.advertencias?.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-800">Advertencia</p>
                {preview.advertencias.map((advertencia) => (
                  <p key={advertencia} className="mt-1 text-xs text-amber-700">
                    {advertencia}
                  </p>
                ))}
              </div>
            )}

            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md bg-white/80 p-3">
                <p className="text-xs text-indigo-500">Empleado</p>
                <p className="font-semibold text-gray-900">{empleadoSeleccionado?.label ?? "—"}</p>
              </div>
              <div className="rounded-md bg-white/80 p-3">
                <p className="text-xs text-indigo-500">Período</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(preview.periodo_inicio)} / {formatDate(preview.periodo_fin)}
                </p>
              </div>
              <div className="rounded-md bg-white/80 p-3">
                <p className="text-xs text-indigo-500">Días pagados en nómina</p>
                <p className="font-semibold text-gray-900">{preview.dias_liquidados ?? "—"}</p>
                {(preview.dias_vacaciones_ordinarias ?? 0) > 0 && (
                  <p className="mt-1 text-xs text-amber-700">
                    {preview.dias_vacaciones_ordinarias} días excluidos por vacaciones
                  </p>
                )}
              </div>
              <div className="rounded-md bg-white/80 p-3">
                <p className="text-xs text-indigo-500">Jornada</p>
                <p className="font-semibold text-gray-900">
                  {jornadaSeleccionada?.nombre ?? "—"} · {preview.horas_semanales_jornada ?? "—"} h
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-indigo-500">Devengado</p>
                <p className="font-semibold text-gray-900">{formatCOP(preview.total_devengado)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Deducciones</p>
                <p className="font-semibold text-orange-600">{formatCOP(preview.total_deducciones)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Neto a pagar</p>
                <p className="font-semibold text-green-700">{formatCOP(preview.salario_neto)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Horas extra</p>
                <p className="font-semibold text-gray-900">{totalHorasExtra(preview)} h</p>
                <p className="text-xs font-medium text-emerald-600">{formatCOP(valorHorasExtra(preview))}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Horas normales</p>
                <p className="font-semibold text-gray-900">{preview.horas_normales ?? "—"} h</p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Horas esperadas</p>
                <p className="font-semibold text-gray-900">
                  {preview.horas_esperadas_periodo ?? "—"} h
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Trabajadas período</p>
                <p className="font-semibold text-gray-900">
                  {preview.horas_trabajadas_periodo ?? "—"} h
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Extra automática</p>
                <p className="font-semibold text-orange-600">
                  {Number(preview.horas_extras_diurnas_detectadas || 0) + Number(preview.horas_extras_nocturnas_detectadas || 0)} h
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Valor hora</p>
                <p className="font-semibold text-gray-900">{formatCOP(preview.valor_hora_normal)}</p>
              </div>
            </div>

            <div className="rounded-md border border-indigo-100 bg-white p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                    Trazabilidad
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Generó: {preview.generado_por?.name ?? "—"} · Revisó: {preview.revisado_por?.name ?? "Pendiente"} · Aprobó: {preview.aprobado_por?.name ?? "Pendiente"}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Original neto: {formatCOP(preview.calculo_original?.salario_neto)}</p>
                  <p className="font-semibold text-indigo-700">
                    Neto revisado: {formatCOP(preview.salario_neto)}
                  </p>
                </div>
              </div>

              {(preview.ajustes_revision ?? []).length > 0 && (
                <div className="mt-3 space-y-2">
                  {preview.ajustes_revision.map((ajuste) => (
                    <div
                      key={ajuste.uuid}
                      className="flex flex-col gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {ajuste.tipo === "devengo" ? "+" : "−"} {ajuste.concepto}: {formatCOP(ajuste.valor)}
                        </p>
                        <p className="text-gray-500">
                          {ajuste.motivo}
                          {ajuste.afecta_base_aportes ? " · Afecta base de aportes" : ""}
                          {ajuste.creador?.name ? ` · ${ajuste.creador.name}` : ""}
                        </p>
                      </div>
                      {["borrador", "en_revision"].includes(preview.estado_preliquidacion) && (
                        <button
                          type="button"
                          disabled={auditLoading}
                          onClick={() => eliminarAjuste(ajuste.uuid)}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {["borrador", "en_revision"].includes(preview.estado_preliquidacion) && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="mb-2 text-xs font-semibold text-gray-700">Registrar corrección</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select
                      name="tipo"
                      value={ajusteForm.tipo}
                      onChange={handleAjusteChange}
                      className="h-9 rounded-md border border-gray-300 px-2 text-sm"
                    >
                      <option value="devengo">Devengo</option>
                      <option value="deduccion">Deducción</option>
                    </select>
                    <input
                      name="concepto"
                      value={ajusteForm.concepto}
                      onChange={handleAjusteChange}
                      placeholder="Concepto del ajuste"
                      className="h-9 rounded-md border border-gray-300 px-3 text-sm"
                    />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      name="valor"
                      value={ajusteForm.valor}
                      onChange={handleAjusteChange}
                      placeholder="Valor"
                      className="h-9 rounded-md border border-gray-300 px-3 text-sm"
                    />
                    <input
                      name="motivo"
                      value={ajusteForm.motivo}
                      onChange={handleAjusteChange}
                      placeholder="Motivo obligatorio"
                      className="h-9 rounded-md border border-gray-300 px-3 text-sm"
                    />
                  </div>
                  {ajusteForm.tipo === "devengo" && (
                    <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        name="afecta_base_aportes"
                        checked={ajusteForm.afecta_base_aportes}
                        onChange={handleAjusteChange}
                      />
                      Este devengo afecta la base de aportes del empleador
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={agregarAjuste}
                    disabled={auditLoading || !ajusteForm.concepto || !ajusteForm.valor || !ajusteForm.motivo}
                    className="mt-3 rounded-md bg-gray-800 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
                  >
                    Agregar ajuste
                  </button>
                </div>
              )}

              {preview.estado_preliquidacion !== "aprobada" && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <textarea
                    value={observacionRevision}
                    onChange={(event) => setObservacionRevision(event.target.value)}
                    placeholder="Observación de revisión (opcional)"
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {preview.estado_preliquidacion === "borrador" && (
                      <button
                        type="button"
                        onClick={enviarRevision}
                        disabled={auditLoading}
                        className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-50"
                      >
                        Marcar en revisión
                      </button>
                    )}
                    {["borrador", "en_revision"].includes(preview.estado_preliquidacion) && (
                      <button
                        type="button"
                        onClick={aprobarPreliquidacion}
                        disabled={auditLoading}
                        className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Aprobar preliquidación
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 text-sm lg:grid-cols-2">
              {/* DEVENGADOS */}
              <div className="rounded-md border border-indigo-100 bg-white p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-500">Devengados</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Salario base período <span className="text-gray-300 text-xs">510506</span></span>
                    <span className="font-medium text-gray-900">{formatCOP(preview.salario_base_devengado)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Auxilio transporte <span className="text-gray-300 text-xs">510527</span></span>
                    <span className="font-medium text-gray-900">{formatCOP(preview.auxilio_transporte)}</span>
                  </div>
                  {(preview.pago_no_prestacional ?? 0) > 0 && (
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Pago no salarial <span className="text-gray-300 text-xs">510548</span></span>
                      <span className="font-medium text-gray-900">{formatCOP(preview.pago_no_prestacional)}</span>
                    </div>
                  )}
                  {(preview.total_comisiones ?? 0) > 0 && (
                    <>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Comisiones salariales</span>
                        <span className="font-medium text-gray-900">{formatCOP(preview.total_comisiones)}</span>
                      </div>
                      {(preview.detalle_comisiones ?? []).map((comision) => (
                        <div key={comision.uuid} className="flex justify-between gap-3 pl-3 text-xs">
                          <span className="text-gray-400">{comision.concepto}</span>
                          <span className="font-medium text-gray-600">{formatCOP(comision.valor)}</span>
                        </div>
                      ))}
                    </>
                  )}
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">H. extra diurnas <span className="text-gray-300 text-xs">510530</span></span>
                    <span className="font-medium text-gray-900">{formatCOP(preview.valor_horas_extras_diurnas)}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-gray-500">Diurnas detectadas / aprobadas</span>
                    <span className="font-medium text-gray-700">
                      {preview.horas_extras_diurnas_detectadas ?? 0} h / {preview.horas_extras_diurnas_aprobadas ?? 0} h
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">H. extra nocturnas <span className="text-gray-300 text-xs">510533</span></span>
                    <span className="font-medium text-gray-900">{formatCOP(preview.valor_horas_extras_nocturnas)}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-gray-500">Nocturnas detectadas / aprobadas</span>
                    <span className="font-medium text-gray-700">
                      {preview.horas_extras_nocturnas_detectadas ?? 0} h / {preview.horas_extras_nocturnas_aprobadas ?? 0} h
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Festivas / dominicales <span className="text-gray-300 text-xs">510536</span></span>
                    <span className="font-medium text-gray-900">
                      {formatCOP(Number(preview.valor_horas_festivas || 0) + Number(preview.valor_horas_nocturnas_festivas || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* DEDUCCIONES */}
              <div className="rounded-md border border-indigo-100 bg-white p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-500">Deducciones empleado</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Salud {Number(preview.porcentaje_salud_empleado || 0).toFixed(2)}% <span className="text-gray-300 text-xs">237005</span></span>
                    <span className="font-medium text-gray-900">{formatCOP(preview.deduccion_salud)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Pensión {Number(preview.porcentaje_pension_empleado || 0).toFixed(2)}% <span className="text-gray-300 text-xs">237010</span></span>
                    <span className="font-medium text-gray-900">{formatCOP(preview.deduccion_pension)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Descuentos / préstamos <span className="text-gray-300 text-xs">142005</span></span>
                    <span className="font-medium text-gray-900">{formatCOP(preview.total_descuentos_adicionales)}</span>
                  </div>
                  {(preview.dias_incapacidad ?? 0) > 0 && (
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Incapacidades ({preview.dias_incapacidad} día(s)) <span className="text-gray-300 text-xs">236535</span></span>
                      <span className="font-medium text-gray-900">{formatCOP(preview.deduccion_incapacidad ?? 0)}</span>
                    </div>
                  )}
                  {(preview.fondo_solidaridad_pensional ?? 0) > 0 && (
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Fondo solidaridad pensional <span className="text-gray-300 text-xs">237015</span></span>
                      <span className="font-medium text-gray-900">{formatCOP(preview.fondo_solidaridad_pensional)}</span>
                    </div>
                  )}
                  {(preview.retencion_fuente ?? 0) > 0 && (
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Retención en la fuente <span className="text-gray-300 text-xs">236505</span></span>
                      <span className="font-medium text-gray-900">{formatCOP(preview.retencion_fuente)}</span>
                    </div>
                  )}
                  {(preview.total_novedades_retroactivas ?? 0) !== 0 && (
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Novedades retroactivas</span>
                      <span className="font-medium text-gray-900">{formatCOP(preview.total_novedades_retroactivas)}</span>
                    </div>
                  )}
                </div>

                {/* Permisos: descontados salvo que se desmarque la casilla. Tardanzas: solo si se marcó la casilla. */}
                {((preview.minutos_tardanza ?? 0) > 0 || (preview.minutos_permisos_no_remunerados ?? 0) > 0) && (
                  <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                    <p className="mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tardanzas y permisos</p>
                    <div className="space-y-1">
                      {(preview.minutos_permisos_no_remunerados ?? 0) > 0 && (
                        <div className="flex justify-between gap-3 text-xs text-gray-400">
                          <span>
                            Permisos no remunerados ({preview.minutos_permisos_no_remunerados} min)
                            {preview.descuenta_permisos ? " — descontados" : " — solo referencia, no descontados"}
                          </span>
                          <span>{formatCOP(preview.valor_permisos_no_remunerados ?? 0)}</span>
                        </div>
                      )}
                      {(preview.minutos_tardanza ?? 0) > 0 && (
                        <div className="flex justify-between gap-3 text-xs text-gray-400">
                          <span>
                            Tardanzas ({preview.minutos_tardanza} min)
                            {preview.descuenta_tardanzas ? " — descontadas" : " — solo referencia, no descontadas"}
                          </span>
                          <span>{formatCOP(preview.valor_tardanzas ?? 0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Costo empleador */}
                {(preview.costo_total_empleador ?? 0) > 0 && (
                  <div className="mt-3 pt-3 border-t border-amber-100">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-500">Costo empleador</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Salud {Number(preview.porcentaje_salud_empleador || 0).toFixed(2)}% <span className="text-gray-300 text-xs">250505</span></span>
                        <span className="font-medium text-amber-700">{formatCOP(preview.costo_salud_empleador)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Pensión {Number(preview.porcentaje_pension_empleador || 0).toFixed(2)}% <span className="text-gray-300 text-xs">250510</span></span>
                        <span className="font-medium text-amber-700">{formatCOP(preview.costo_pension_empleador)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">ARL {Number(preview.porcentaje_arl || 0).toFixed(3)}% <span className="text-gray-300 text-xs">250515</span></span>
                        <span className="font-medium text-amber-700">{formatCOP(preview.costo_arl)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Parafiscales SENA/ICBF/Caja <span className="text-gray-300 text-xs">250520-30</span></span>
                        <span className="font-medium text-amber-700">{formatCOP(preview.costo_parafiscales)}</span>
                      </div>
                      <div className="flex justify-between gap-3 pt-1 border-t border-amber-100 font-semibold">
                        <span className="text-amber-700">Total costo empresa</span>
                        <span className="text-amber-700">{formatCOP(preview.costo_total_empleador)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading || loading}
            className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {previewLoading ? "Calculando..." : formData.tipo_liquidacion === "retiro" ? "Preliquidar retiro" : "Preliquidar"}
          </button>
          <button
            type="submit"
            disabled={
              loading
              || (
                formData.tipo_liquidacion !== "retiro"
                && preview?.estado_preliquidacion !== "aprobada"
              )
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Procesando...
              </>
            ) : formData.tipo_liquidacion === "retiro"
              ? "Liquidar Retiro"
              : preview?.estado_preliquidacion === "aprobada"
                ? "Liquidar versión aprobada"
                : "Pendiente de aprobación"}
          </button>
        </div>
      </form>
    </div>
  );
}

FormLiquidarNomina.propTypes = {
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};
