
import { useNavigate } from "react-router-dom";
import useReferenciasExcedidas from "../../hooks/crm/useReferenciasExcedidas";


export default function ReferenciasExcedidas() {

  const navigate = useNavigate();
  const {
    referenciasPaginadas,
    totalPaginas,
    paginaActual,
    filtro,
    filaAbierta,
    loading,
    setPaginaActual,
    setFiltro,
    setFilaAbierta,
    totalFaltante,
    proveedoresAfectados,
    sinEntregar,
    referencias,
    referenciasFiltradas,
    elementosPorPagina,
  } = useReferenciasExcedidas();


  if (loading) {
    return (
      <div className="my-6 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Cargando referencias faltantes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-orange-600">
            Referencias con Cantidades Faltantes
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Productos que no han sido entregados completamente
          </p>
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>

      {/* Estadísticas compactas */}
      {referencias.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-orange-600 text-xs font-medium">Referencias</div>
            <div className="text-orange-800 text-xl font-bold">{referencias.length}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-red-600 text-xs font-medium">Faltante</div>
            <div className="text-red-800 text-xl font-bold">{totalFaltante}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-yellow-600 text-xs font-medium">Sin Entregar</div>
            <div className="text-yellow-800 text-xl font-bold">{sinEntregar}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-600 text-xs font-medium">Proveedores</div>
            <div className="text-blue-800 text-xl font-bold">{proveedoresAfectados}</div>
          </div>
        </div>
      )}

      {/* Filtro */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por descripción, proveedor o número de orden..."
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* ✅ TABLA COMPACTA */}
      {referencias.length === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h4 className="text-green-800 text-lg font-semibold mb-2">¡Excelente!</h4>
          <p className="text-green-700">No hay referencias con cantidades faltantes.</p>
        </div>
      ) : referenciasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h4 className="text-gray-600 text-lg font-semibold mb-2">Sin resultados</h4>
          <p className="text-gray-500">No se encontraron referencias que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              {/* ✅ HEADER COMPACTO */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Orden
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Proveedor
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Descripción
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Solicitada
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-orange-500 uppercase">
                    Faltante
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Obs.
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {referenciasPaginadas.map((ref, index) => (
                  <>
                    {/* ✅ FILA PRINCIPAL COMPACTA */}
                    <tr key={`${ref.orden_id}-${ref.item}-${index}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        <div className="font-mono text-xs">{ref.numero_orden}</div>
                        <div className="text-xs text-gray-500">
                          {ref.fecha_orden ? new Date(ref.fecha_orden).toLocaleDateString("es-CO") : ''}
                        </div>
                      </td>
                      
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {ref.proveedor}
                      </td>
                      
                      <td className="px-3 py-2 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={ref.descripcion}>
                          {ref.descripcion}
                        </div>
                      </td>
                      
                      <td className="px-3 py-2 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {ref.cantidad_solicitada}
                        </div>
                        <div className="text-xs text-gray-500">
                          Entregada: {ref.cantidad_entregada}
                        </div>
                      </td>
                      
                      <td className="px-3 py-2 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          -{ref.cantidad_faltante}
                        </span>
                      </td>
                      
                      <td className="px-3 py-2 text-center">
                        {ref.observaciones?.length > 0 ? (
                          <button
                            onClick={() =>
                              setFilaAbierta(
                                filaAbierta === `${ref.orden_id}-${ref.item}`
                                  ? null
                                  : `${ref.orden_id}-${ref.item}`
                              )
                            }
                            className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors"
                          >
                            {ref.observaciones.length}
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d={filaAbierta === `${ref.orden_id}-${ref.item}` ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>

                    {/* ✅ FILA DE OBSERVACIONES COMPACTA */}
                    {filaAbierta === `${ref.orden_id}-${ref.item}` && (
                      <tr className="bg-blue-50">
                        <td colSpan={6} className="px-3 py-2">
                          <div className="space-y-2">
                            {ref.observaciones.map((obs, i) => (
                              <div key={obs.id || i} className="flex items-start justify-between p-2 bg-white rounded border text-xs">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                      obs.estado === 'pendiente'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : obs.estado === 'completado'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {obs.estado}
                                    </span>
                                    {obs.proceso?.nombre && (
                                      <span className="text-gray-600">• {obs.proceso.nombre}</span>
                                    )}
                                  </div>
                                  <p className="text-gray-800 text-xs mb-1">{obs.observacion}</p>
                                  <div className="text-gray-500 text-xs">
                                    {obs.usuario} • {obs.proveedor} • {new Date(obs.fecha).toLocaleDateString('es-CO')}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación compacta */}
          {totalPaginas > 1 && (
            <div className="bg-white px-4 py-2 flex items-center justify-between border-t border-gray-200">
              <div className="text-xs text-gray-700">
                {(paginaActual - 1) * elementosPorPagina + 1}-{Math.min(paginaActual * elementosPorPagina, referenciasFiltradas.length)} de {referenciasFiltradas.length}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-xs bg-gray-100 rounded">
                  {paginaActual}/{totalPaginas}
                </span>
                <button
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}