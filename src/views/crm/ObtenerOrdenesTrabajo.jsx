import { FaSearch, FaEye, FaFilter, FaCalendarAlt, FaClipboardList, FaKey, FaBook, FaClock } from "react-icons/fa";
import { HiOutlineClipboardList } from "react-icons/hi";
import useOrdenesTrabajo from "../../hooks/useOrdenesTrabajo";
import { useDebounce } from "../../hooks/useDebounce";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const OPCIONES_ESTADO = [
  { value: "", label: "Pendientes y Parciales" },
  { value: "todos", label: "Todos los estados" },
  { value: "1", label: "Pendiente" },
  { value: "5", label: "Entrega Parcial" },
  { value: "2", label: "Completado" },
];

export default function ObtenerOrdenesTrabajo() {
  // Estado local temporal para la búsqueda (se debounce antes de pegarle al backend)
  const [busquedaLocal, setBusquedaLocal] = useState("");
  const busquedaDebounced = useDebounce(busquedaLocal, 500);

  const {
    ordenesTrabajo,
    isLoading,
    error,
    pagina,
    setPagina,

    busqueda,
    setBusqueda,

    setSede,

    fechaInicio,
    setFechaInicio,

    fechaFin,
    setFechaFin,

    estado,
    setEstado,
  } = useOrdenesTrabajo();

  const limpiarFiltros = () => {
    setBusquedaLocal("");
    setBusqueda("");
    setFechaInicio("");
    setFechaFin("");
    setSede("");
    setEstado("");
    setPagina(1);
  };

  // Solo dispara una petición al backend 500ms después de que el usuario deja de escribir
  useEffect(() => {
    if (busquedaDebounced === busqueda) return;
    setBusqueda(busquedaDebounced);
    setPagina(1);
  }, [busquedaDebounced, busqueda, setBusqueda, setPagina]);

  const handleFechaInicioChange = (value) => {
    setFechaInicio(value);
    setPagina(1);
  };

  const handleFechaFinChange = (value) => {
    setFechaFin(value);
    setPagina(1);
  };

  const handleEstadoChange = (value) => {
    setEstado(value);
    setPagina(1);
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700">Cargando órdenes de trabajo...</h3>
          <p className="text-sm text-gray-500 mt-1">Por favor espera un momento</p>
        </div>
      </div>
    );

  if (error) 
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-red-200">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-600">Error al cargar datos</h3>
          <p className="text-red-500 mt-2">{error.message}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <div className="grid col-span-1 ">
        
        {/* ✅ Header mejorado */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
              <HiOutlineClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-gray-800">Órdenes de Trabajo</h2>
              <p className="text-sm sm:text-base text-gray-600">Gestiona y monitorea todas las órdenes de trabajo</p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            <Link
              to="/auth/crm/alistamientos"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium transition-colors duration-150 shadow-sm text-xs sm:text-sm"
            >
              <FaClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Gestionar Alistamientos
            </Link>

            <Link
              to="/auth/crm/nomina/acceso-temporal"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium transition-colors duration-150 shadow-sm text-xs sm:text-sm"
            >
              <FaKey className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Acceso Temporal
            </Link>

            <Link
              to="/auth/crm/nomina/instruccion-operativa"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium transition-colors duration-150 shadow-sm text-xs sm:text-sm"
            >
              <FaBook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Instrucción Operativa
            </Link>

            <Link
              to="/auth/crm/nomina/solicitar-horas-extras"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium transition-colors duration-150 shadow-sm text-xs sm:text-sm"
            >
              <FaClock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Solicitar Horas Extra
            </Link>
          </div>
      
        </div>

        {/* ✅ Filtros mejorados */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Filtros de búsqueda</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Búsqueda */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FaSearch className="w-3 h-3" />
                Cliente
              </label>
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por cliente..."
                autoFocus
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                value={busquedaLocal}
                onChange={(e) => setBusquedaLocal(e.target.value)}
              />
            </div>

            {/* Fecha Desde */}
            <div className="relative">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FaCalendarAlt className="w-3 h-3" />
                Desde
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                value={fechaInicio}
                onChange={(e) => handleFechaInicioChange(e.target.value)}
              />
            </div>

            {/* Fecha Hasta */}
            <div className="relative">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FaCalendarAlt className="w-3 h-3" />
                Hasta
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                value={fechaFin}
                onChange={(e) => handleFechaFinChange(e.target.value)}
              />
            </div>

            {/* Estado */}
            <div className="relative">
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FaFilter className="w-3 h-3" />
                Estado
              </label>
              <select
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                value={estado}
                onChange={(e) => handleEstadoChange(e.target.value)}
              >
                {OPCIONES_ESTADO.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Limpiar */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={limpiarFiltros}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Tabla responsiva mejorada */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Lista de Órdenes de Trabajo</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Mostrando {ordenesTrabajo?.data?.length || 0} de {ordenesTrabajo?.total || 0} órdenes
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">ID</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Cliente</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">F. Entrega</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">F. Creación</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Sede</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Dirección</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold">Estado</th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ordenesTrabajo?.data?.map((orden) => (
                  <tr key={orden.id} className="hover:bg-gray-50 transition-colors duration-200">
                    {/* ID con indicador */}
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            orden.movimientos_stock && orden.movimientos_stock.length > 0 
                              ? "bg-green-500 shadow-green-300" 
                              : "bg-red-500 shadow-red-300"
                          } shadow-lg`}
                          title={
                            orden.movimientos_stock && orden.movimientos_stock.length > 0
                              ? "Stock descontado"
                              : "Stock pendiente por descontar"
                          }
                        ></div>
                        <span className="font-medium text-gray-900">#{orden.id}</span>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="font-medium text-gray-900">{orden.orden_compra?.cliente?.nombre || "Sin cliente"}</div>
                    </td>

                    {/* Fecha Entrega */}
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="text-gray-900">{orden.orden_compra?.fecha_entrega}</div>
                      {orden.orden_compra?.fecha_despacho && (
                        <div className="text-xs text-green-600 mt-1 bg-green-50 px-2 py-1 rounded">
                          ✓ Completado: {orden.orden_compra.fecha_despacho}
                        </div>
                      )}
                    </td>

                    {/* Fecha Creación */}
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">
                      {new Date(orden.created_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>

                    {/* Sede */}
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {orden?.orden_compra?.sede?.nombre || "Sin sede"}
                      </span>
                    </td>

                    {/* Dirección */}
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 max-w-[200px]">
                      <div className="truncate" title={orden?.orden_compra?.ubicacion_entrega}>
                        {orden?.orden_compra?.ubicacion_entrega || "No especificado"}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                      {orden.estado.nombre === "Pendiente" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300">
                           Pendiente
                        </span>
                      ) : orden.estado.nombre === "Completado" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                          Completado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300">
                          {orden.estado.nombre}
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                      <Link
                        to={`/auth/crm/ordenes-trabajo/${orden.id}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-xs sm:text-sm"
                      >
                        <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Detalles</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Paginación mejorada */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs sm:text-sm text-gray-600">
                Página {pagina} de {ordenesTrabajo?.last_page || 1}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPagina(pagina - 1)}
                  disabled={!ordenesTrabajo?.prev_page_url}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                    !ordenesTrabajo?.prev_page_url
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  ← Anterior
                </button>

                <button
                  type="button"
                  onClick={() => setPagina(pagina + 1)}
                  disabled={!ordenesTrabajo?.next_page_url}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                    !ordenesTrabajo?.next_page_url
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
