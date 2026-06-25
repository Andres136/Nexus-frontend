import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";

import Select from "react-select";

import Modal from "../../components/calidad/Modal";

import RegisterObservacionOcProveedorDetalles from "../../components/crm/RegisterObservacionOcProveedorDetalles";
import { useRegistrarEntregaProveedor } from "../../hooks/EntregasProveedores/useRegistrarEntregaProveedor";
import { Trash } from "lucide-react";
import useReferenciasExcedidas from "../../hooks/crm/useReferenciasExcedidas";

export default function RegistrarEntregaProveedor({ modo = "crear" }) {

  const {
    // Estados
    loading,
    orden,
    detalles,
    setDetalles,
    fechasEntrega,
    erroresFecha,
    isSaving,
    bodegaSeleccionada,
    setBodegaSeleccionada,
    errorBodega,
    setErrorBodega,
    isModalOpen,
    setIsModalOpen,
    historialEntregas,
    setHistorialEntregas,
    detalleSeleccionado,
    setDetalleSeleccionado,
    observacionModalAbierta,
    setObservacionModalAbierta,

    // Datos externos
    user,
    bodegas,

    // Funciones
    obtenerEstadoVisual,
    handleFechaChange,
    handleCantidadChange,
    abrirHistorial,
    cerrarModal,
    handleSubmit,
    navigate,
    toDatetimeLocal,
    eliminarItem
  } = useRegistrarEntregaProveedor(modo);

  const { referencias,
            getEstadoStyles,
            actualizarEstado, estadoAbierto, setEstadoAbierto, dropdownRef,  } = useReferenciasExcedidas({ ordenId: orden?.id ?? null, modo: "orden" });
 

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver
              </button>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {modo === "editar"
                    ? "Actualizar Entrega"
                    : "Registrar Entrega"}
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona las entregas de proveedores
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de información de orden */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Proveedor
              </label>
              <p className="text-gray-900 text-sm font-extrabold">
                {orden.proveedor_nombre}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Bodega
              </label>
              <Select
                options={bodegas.map((b) => ({ value: b.id, label: b.nombre }))}
                value={bodegaSeleccionada}
                onChange={(selected) => {
                  setBodegaSeleccionada(selected || null);
                  setErrorBodega(null); // limpiar error
                }}
              />

              {errorBodega && (
                <p className="text-red-500 text-xs mt-1">{errorBodega}</p>
              )}
            </div>

            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 w-full">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Orden de Compra</p>
                    <p className="text-xl font-bold text-gray-900">
                      {orden.numero_orden}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Observaciones de la orden */}
            {orden.observaciones && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
                <p className="text-yellow-800 text-sm leading-relaxed whitespace-pre-line">
                  <strong className="font-semibold text-yellow-900">
                    Observaciones:
                  </strong>{" "}
                  {orden.observaciones}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="w-full divide-y divide-gray-200"
              style={{ minWidth: "1400px" }}
            >
              {" "}
              {/* ✅ REDUCIDO: de 1800px a 1400px */}
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {/* ✅ COMPACTO: Reducir padding y tamaños */}
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                    Código
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                    {" "}
                    {/* ✅ REDUCIDO: de 64 a 48 */}
                    Descripción
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    Solicitada
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    Entregada
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    Faltantes
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Prioridad
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    Estado
                  </th>

                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    {" "}
                    {/* ✅ REDUCIDO: de 40 a 32 */}
                    Proceso
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                    {" "}
                    {/* ✅ REDUCIDO: de 80 a 24 */}
                    Historial
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-36">
                    {" "}
                    {/* ✅ REDUCIDO: de 48 a 36 */}
                    Nueva Entrega
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    {" "}
                    {/* ✅ REDUCIDO: de 44 a 32 */}
                    Observaciones
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    {" "}
                    {/* ✅ REDUCIDO: de 44 a 32 */}
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detalles.map((detalle, index) => {
                  const key = detalle.id ?? `tmp-${index}`;
                  const estado = obtenerEstadoVisual(detalle);

                  return (
                    <tr
                      key={key}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* ✅ COMPACTO: Padding reducido de px-4 py-4 a px-2 py-2 */}

                      {/* Número de ítem - MÁS COMPACTO */}
                      <td className="px-2 py-2 whitespace-nowrap text-center w-12">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                          {" "}
                          {/* ✅ REDUCIDO: de 8x8 a 6x6 */}
                          <span className="text-xs font-bold text-blue-600">
                            {detalle.item}
                          </span>{" "}
                          {/* ✅ REDUCIDO: de text-sm a text-xs */}
                        </div>
                      </td>

                      {/* Código - MÁS COMPACTO */}
                      <td className="px-2 py-2 whitespace-nowrap text-center w-16">
                        <span className="text-xs text-gray-700 font-mono">
                          {detalle.code || "—"}
                        </span>
                      </td>

                      {/* Descripción - COMPACTO */}
                      <td className="px-2 py-2 w-48">
                        <input
                          type="text"
                          value={detalle.descripcion}
                          onChange={(e) => {
                            const nuevos = [...detalles];
                            nuevos[index] = {
                              ...nuevos[index],
                              descripcion: e.target.value,
                            };
                            setDetalles(nuevos);
                          }}
                          className="w-full border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors text-xs" /* ✅ COMPACTO: rounded-lg→md, px-3 py-2→px-2 py-1, ring-2→ring-1 */
                          placeholder="Descripción..."
                        />
                      </td>

                      {/* Cantidad solicitada - MÁS COMPACTO */}
                      <td className="px-2 py-2 w-20">
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            value={detalle.cantidad_solicitada}
                            onChange={(e) => {
                              const nuevos = [...detalles];
                              nuevos[index] = {
                                ...nuevos[index],
                                cantidad_solicitada:
                                  parseFloat(e.target.value) || 0,
                              };
                              setDetalles(nuevos);
                            }}
                            className="w-full border-gray-300 rounded-md px-1 py-1 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-center text-xs" /* ✅ COMPACTO */
                          />
                          <span className="absolute -bottom-0.5 right-0.5 text-xs text-gray-400">
                            kg
                          </span>
                        </div>
                      </td>

                      {/* Cantidad entregada - MÁS COMPACTO */}
                      <td className="px-2 py-2 whitespace-nowrap text-center w-20">
                        <div className="bg-green-100 rounded-md px-1 py-0.5">

                          {/* ✅ COMPACTO: rounded-lg→md, px-2 py-1→px-1 py-0.5 */}
                          <span className="text-xs font-semibold text-green-800">
                            {detalle.cantidad_entregada_sede}
                          </span>
                          <div className="text-xs text-green-600">kg</div>
                        </div>
                      </td>

                      {/* Faltantes - MÁS COMPACTO */}
                      <td className="px-2 py-2 whitespace-nowrap text-center w-20">
                        <div className="bg-orange-100 rounded-md px-1 py-0.5">
                          <span className="text-xs font-semibold text-orange-800">
                            {Number(detalle.cantidad_solicitada) -
                              Number(detalle.cantidad_entregada_sede)}
                          </span>
                          <div className="text-xs text-orange-600">kg</div>
                        </div>
                      </td>

                      <td className="px-2 py-2 w-32">
                        {detalle.origenes?.length > 0 ? (
                          <div className="space-y-1">
                            {detalle.origenes.map((origen) => (
                              <div
                                key={origen.id}
                                className={`rounded-md px-2 py-1 text-xs ${
                                  origen.prioridad_completa
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                <div className="font-semibold">
                                  {Number(origen.cantidad_recibida_aplicada ?? 0).toFixed(2)}
                                  {" / "}
                                  {Number(origen.cantidad_prioridad ?? 0).toFixed(2)} kg
                                </div>
                                <div className="text-[10px]">
                                  {origen.prioridad_completa ? "Prioridad recibida" : "Prioridad pendiente"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin prioridad</span>
                        )}
                      </td>

                      {/* Estado - MÁS COMPACTO */}
                      <td className="px-2 py-2 whitespace-nowrap w-20">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${estado.color} text-white shadow-sm`}
                        >

                          {/* ✅ COMPACTO: px-2 py-1→px-1.5 py-0.5 */}
                          <div className="w-1 h-1 bg-white rounded-full mr-1"></div>{" "}
                          {/* ✅ COMPACTO: w-1.5 h-1.5→w-1 h-1 */}
                          {estado.texto}
                        </span>
                      </td>


                      <td className="px-2 py-2 w-44">
                        <div className="flex flex-col gap-2">
                          {/* Observaciones existentes */}
                    
                            <div className="max-h-32 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300">
                              {referencias
                               .filter(ref => Number(ref.item) === Number(detalle.item))
                              .map((ref) => (
                                <div key={`${ref.orden_id}-${ref.item}`}>
                                  {ref.observaciones?.length > 0 &&
                                    ref.observaciones.map((obs) => (
                                      <div
                                        key={obs.id}
                                        className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-xs p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="relative inline-block" ref={dropdownRef}>
                                            <button
                                       onClick={(e) => {
  e.stopPropagation();
  setEstadoAbierto(
    estadoAbierto === obs.id ? null : obs.id
  );
}}
                                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${getEstadoStyles(
                                                obs.estado
                                              )}`}
                                            >
                                              <span className="w-2 h-2 rounded-full bg-current"></span>
                                              {obs.estado.replace("_", " ")}
                                              <svg
                                                className="w-3 h-3 ml-1 opacity-60"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth="2"
                                                  d="M19 9l-7 7-7-7"
                                                />
                                              </svg>
                                            </button>

                                            {estadoAbierto === obs.id && (
                                              <div className="absolute left-15 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn">
                                                {["pendiente", "en_proceso", "completada"].map(
                                                  (estado) => (
                                                    <button
                                                      key={estado}
                                                      disabled={estado === obs.estado}
                                               
                                               onClick={(e) => {
  e.stopPropagation();
  actualizarEstado(obs.id, estado);
  setEstadoAbierto(null);
}}
                                                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${estado === obs.estado
                                                          ? "opacity-50 cursor-not-allowed"
                                                          : ""
                                                        }`}
                                                    >
                                                      <span className="flex items-center gap-2">
                                                        <span
                                                          className={`w-2 h-2 rounded-full ${estado === "pendiente"
                                                              ? "bg-yellow-500"
                                                              : estado === "en_proceso"
                                                                ? "bg-blue-500"
                                                                : estado === "completada"
                                                                  ? "bg-green-500"
                                                                  : "bg-red-500"
                                                            }`}
                                                        ></span>
                                                        {estado.replace("_", " ")}
                                                      </span>

                                                      {estado === obs.estado && (
                                                        <svg
                                                          className="w-3 h-3 text-green-500"
                                                          fill="none"
                                                          stroke="currentColor"
                                                          viewBox="0 0 24 24"
                                                        >
                                                          <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                          />
                                                        </svg>
                                                      )}
                                                    </button>
                                                  )
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-600">
                                            <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <span className="font-medium truncate max-w-[80px]">{obs.proveedor}</span>
                                          </span>
                                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5"></span>
                                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(obs.fecha).toLocaleDateString("es-CO")}
                                          </span>
                                        </div>
                                        <p className="text-gray-700 text-[11px] leading-tight mb-1 line-clamp-2">
                                          {obs.observacion}
                                        </p>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                          <span className="truncate max-w-[60px]">{obs.usuario}</span>
                                          {obs.proceso?.nombre && (
                                            <>
                                              <span className="text-gray-300">•</span>
                                              <span className="truncate max-w-[50px]">{obs.proceso.nombre}</span>

                                            </>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              ))}
                            </div>
                      

                          {/* Botón agregar */}
                          <button
                            onClick={() => {
                              setDetalleSeleccionado(detalle.id);
                              setObservacionModalAbierta(true);
                            }}
                            className="flex items-center justify-center gap-1 w-full px-2 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar
                          </button>
                        </div>
                      </td>

                      {/* Historial - MÁS COMPACTO */}
                      <td className="px-2 py-2 w-24">
                        {detalle.entregas && detalle.entregas.length > 0 ? (
                          <button
                            onClick={() =>
                              abrirHistorial(detalle.entregas, detalle.id)
                            }
                            className="flex items-center px-2 py-1 bg-white border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition-colors shadow-sm" /* ✅ COMPACTO */
                          >
                            <svg
                              className="w-3 h-3 mr-1 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 10h11M9 21V3m0 0L5 7m4-4l4 4m6 6h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-2 4l-4-4m4 4l4-4"
                              />
                            </svg>
                            Ver ({detalle.entregas.length}){" "}
                            {/* ✅ COMPACTO: texto reducido */}
                          </button>
                        ) : (
                          <div className="text-xs text-gray-500 italic">
                            Sin historial
                          </div>
                        )}
                      </td>

                      {/* Nueva Entrega - MÁS COMPACTO */}
                      <td className="px-2 py-2 w-36">
                        <div className="bg-green-50 rounded-md p-2">

                          {/* ✅ COMPACTO: rounded-lg→md, p-3→p-2 */}
                          <div className="space-y-1.5">

                            {/* ✅ COMPACTO: space-y-2→space-y-1.5 */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                Cantidad (kg)
                              </label>{" "}
                              {/* ✅ COMPACTO: mb-1→mb-0.5 */}
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={detalle.cantidad_entregada_input || ""}
                                onChange={(e) =>
                                  handleCantidadChange(index, e.target.value)
                                }
                                className="w-full border-gray-300 rounded-md px-1.5 py-1 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-xs" /* ✅ COMPACTO */
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                Fecha
                              </label>
                              <input
                                type="date"
                                value={fechasEntrega[index] || ""}
                                onChange={(e) =>
                                  handleFechaChange(index, e.target.value)
                                }
                                className={`w-full rounded-md px-1.5 py-1 text-xs focus:ring-1 focus:ring-green-500 ${erroresFecha[index]
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-green-500"
                                  }`}
                              />
                              {erroresFecha[index] && (
                                <p className="text-red-500 text-xs mt-0.5">
                                  ⚠️ {erroresFecha[index]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Observaciones - MÁS COMPACTO */}
                      <td className="px-2 py-2 w-32">
                        <textarea
                          value={detalle.observaciones_input || ""}
                          onChange={(e) => {
                            const nuevos = [...detalles];
                            nuevos[index] = {
                              ...nuevos[index],
                              observaciones_input: e.target.value,
                            };
                            setDetalles(nuevos);
                          }}
                          rows={2}
                          className="w-full border-gray-300 rounded-md px-1.5 py-1 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-xs resize-none" /* ✅ COMPACTO */
                          placeholder="Observaciones..."
                        />
                      </td>


                      <td className="px-2 py-2 w-32">
                        <button
                          onClick={() => eliminarItem(detalle.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botón de guardar mejorado */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${isSaving
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Guardando...
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {modo === "editar" ? "Actualizar Entrega" : "Registrar Entrega"}
              </>
            )}
          </button>
        </div>
      </div>
      {/* Modal para el historial de entregas */}

      <RegisterObservacionOcProveedorDetalles
        isOpen={observacionModalAbierta}
        onClose={() => setObservacionModalAbierta(false)}
        detalleId={detalleSeleccionado}
        modo="api"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={cerrarModal}
        contentLabel="Historial de Entregas"
        className="max-w-5xl mx-auto mt-20 bg-white rounded-xl shadow-lg p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Historial de Entregas
        </h2>

        {historialEntregas.length === 0 ? (
          <p className="text-gray-600">
            No hay entregas registradas para este ítem.
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Cantidad (kg)</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Bodega</th>
                  <th className="px-4 py-2 text-left">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 max-h-80 overflow-y-auto block">
                {historialEntregas.map((entrega, idx) => (
                  <tr
                    key={entrega.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Cantidad */}
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entrega.cantidad_entregada}
                        onChange={(e) => {
                          const nuevas = [...historialEntregas];
                          nuevas[idx] = {
                            ...nuevas[idx],
                            cantidad_entregada: e.target.value,
                          };
                          setHistorialEntregas(nuevas);
                        }}
                        className="w-24 border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-green-500"
                      />
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-2">
                      <input
                        type="date"
                        value={toDatetimeLocal(entrega.fecha_entrega)}
                        onChange={(e) => {
                          const nuevas = [...historialEntregas];
                          nuevas[idx] = {
                            ...nuevas[idx],
                            fecha_entrega: e.target.value,
                          };
                          setHistorialEntregas(nuevas);
                        }}
                        className="border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-green-500"
                      />
                    </td>

                    {/* Bodega */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {entrega.bodega_id ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mr-2">
                          {bodegas.find((b) => b.id === entrega.bodega_id)
                            ?.nombre || "Desconocida"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Sin bodega
                        </span>
                      )}

                      {/* Solo si quieres permitir cambiarla */}
                     <Select
  options={bodegas.map((b) => ({
    value: b.id,
    label: b.nombre,
  }))}

  value={
    entrega.bodega_id
      ? {
          value: entrega.bodega_id,
          label:
            bodegas.find((b) => b.id === entrega.bodega_id)?.nombre ||
            "Desconocida",
        }
      : null
  }

  onChange={(selected) => {
    const nuevas = [...historialEntregas];
    nuevas[idx] = {
      ...nuevas[idx],
      bodega_id: selected ? selected.value : null,
    };
    setHistorialEntregas(nuevas);
  }}

  placeholder="Cambiar bodega"
  isClearable
  className="mt-1 text-xs"

  menuPortalTarget={document.body}

  styles={{
    control: (provided) => ({
      ...provided,
      minHeight: "32px",
      fontSize: "0.8rem",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }}
/>
                    </td>

                    {/* Observaciones */}
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={entrega.observaciones || ""}
                        onChange={(e) => {
                          const nuevas = [...historialEntregas];
                          nuevas[idx] = {
                            ...nuevas[idx],
                            observaciones: e.target.value,
                          };
                          setHistorialEntregas(nuevas);
                        }}
                        className="w-full border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer fijo */}
        <div className="flex justify-end mt-6 border-t pt-4">
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                for (const entrega of historialEntregas) {
                  await clienteAxios.put(
                    `/api/entregas-proveedor/${entrega.id}`,
                    {
                      detalle_id: entrega.detalle_id,
                      cantidad_entregada: entrega.cantidad_entregada,
                      fecha_entrega: entrega.fecha_entrega,
                      observaciones: entrega.observaciones,
                      bodega_id: entrega.bodega_id,
                      producto_id: entrega.producto_id,
                      empresa_id: orden.empresa?.id,
                      sede_id: user.sede_id,
                      stock: entrega.cantidad_entregada,
                    },
                    { headers: { Authorization: `Bearer ${token}` } },
                  );

                  // actualizar detalles en pantalla
                  const nuevosDetalles = [...detalles];
                  const detalleIndex = nuevosDetalles.findIndex(
                    (d) => d.id === entrega.detalle_id,
                  );
                  if (detalleIndex !== -1) {
                    nuevosDetalles[detalleIndex].entregas = nuevosDetalles[
                      detalleIndex
                    ].entregas.map((e) => (e.id === entrega.id ? entrega : e));
                    setDetalles(nuevosDetalles);
                  }
                }
                toast.success("Entregas actualizadas correctamente");
                setIsModalOpen(false);
              } catch (error) {
                console.error(error);
                toast.error("Error al actualizar entregas");
              }
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            Guardar cambios
          </button>
        </div>
      </Modal>
    </div>
  );
}
