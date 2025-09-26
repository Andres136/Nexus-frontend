import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ReferenciasExcedidas() { // ✅ CAMBIAR nombre del componente
  const [referencias, setReferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerReferencias = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // ✅ CORRECTO: Endpoint para faltantes
        const response = await clienteAxios.get("/api/referencias-faltantes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // ✅ CORRECTO: Estructura para faltantes
        setReferencias(response.data.referencias_faltantes || []);
        
      } catch (error) {
        console.error('Error al obtener referencias faltantes:', error);
        toast.error("Error al obtener referencias faltantes"); // ✅ CORREGIR mensaje
        setReferencias([]);
      } finally {
        setLoading(false);
      }
    };

    obtenerReferencias();
  }, []);

  // 🔍 Filtro en tiempo real con validación
  const referenciasFiltradas = referencias.filter((ref) => {
    if (!filtro.trim()) return true;
    
    const texto = filtro.toLowerCase();
    const descripcion = ref.descripcion?.toLowerCase() || '';
    const proveedor = ref.proveedor?.toLowerCase() || '';
    const numeroOrden = ref.numero_orden?.toString() || '';
    
    return (
      descripcion.includes(texto) ||
      proveedor.includes(texto) ||
      numeroOrden.includes(texto)
    );
  });

  // 📄 Paginación
  const totalPaginas = Math.ceil(referenciasFiltradas.length / elementosPorPagina);
  const referenciasPaginadas = referenciasFiltradas.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  // ✅ Estadísticas para FALTANTES
  const totalFaltante = referencias.reduce((sum, ref) => sum + (ref.cantidad_faltante || 0), 0);
  const proveedoresAfectados = new Set(referencias.map(ref => ref.proveedor)).size;
  const sinEntregar = referencias.filter(ref => ref.cantidad_entregada === 0).length;

  if (loading) {
    return (
      <div className="my-6 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div> {/* ✅ Color para faltantes */}
          <span className="ml-3 text-gray-600">Cargando referencias faltantes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 px-4">
      {/* ✅ Header para FALTANTES */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-orange-600"> {/* ✅ Color naranja para faltantes */}
            Referencias con Cantidades Faltantes
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Productos que no han sido entregados completamente o están pendientes
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

      {/* ✅ Estadísticas para FALTANTES */}
      {referencias.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-orange-600 text-sm font-medium">Total Referencias</div>
            <div className="text-orange-800 text-2xl font-bold">{referencias.length}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600 text-sm font-medium">Cantidad Faltante</div>
            <div className="text-red-800 text-2xl font-bold">{totalFaltante}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-600 text-sm font-medium">Sin Entregar</div>
            <div className="text-yellow-800 text-2xl font-bold">{sinEntregar}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium">Proveedores</div>
            <div className="text-blue-800 text-2xl font-bold">{proveedoresAfectados}</div>
          </div>
        </div>
      )}

      {/* ✅ Filtro */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por descripción, proveedor o número de orden..."
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" // ✅ Color naranja
          />
          <svg className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {filtro && (
          <div className="mt-2 text-sm text-gray-600">
            Mostrando {referenciasFiltradas.length} de {referencias.length} referencias
          </div>
        )}
      </div>

      {/* ✅ Contenido principal */}
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
          <button
            onClick={() => setFiltro("")}
            className="mt-3 text-orange-600 hover:text-orange-800 font-medium"
          >
            Limpiar filtro
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    # Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitada
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entregada
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-orange-500 uppercase tracking-wider">
                    Faltante {/* ✅ CAMBIAR de "Excedente" a "Faltante" */}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Entregado {/* ✅ AGREGAR columna de porcentaje */}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referenciasPaginadas.map((ref, index) => (
                  <tr key={`${ref.orden_id}-${ref.item}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ref.numero_orden}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ref.proveedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ref.fecha_orden ? new Date(ref.fecha_orden).toLocaleDateString("es-CO") : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ref.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      {ref.cantidad_solicitada}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      {ref.cantidad_entregada}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        -{ref.cantidad_faltante} {/* ✅ CAMBIAR a cantidad_faltante con signo negativo */}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {/* ✅ AGREGAR: Indicador visual del porcentaje */}
                      <div className="flex items-center justify-center">
                        <div className="w-12 text-xs font-medium text-gray-700">
                          {ref.porcentaje_entregado ? `${ref.porcentaje_entregado}%` : '0%'}
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                          <div 
                            className={`h-2 rounded-full ${
                              ref.porcentaje_entregado === 0 ? 'bg-red-500' :
                              ref.porcentaje_entregado < 50 ? 'bg-red-400' :
                              ref.porcentaje_entregado < 80 ? 'bg-yellow-400' :
                              'bg-green-400'
                            }`}
                            style={{ width: `${Math.min(ref.porcentaje_entregado || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Paginación (igual) */}
          {totalPaginas > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{(paginaActual - 1) * elementosPorPagina + 1}</span>
                    {' '}a{' '}
                    <span className="font-medium">
                      {Math.min(paginaActual * elementosPorPagina, referenciasFiltradas.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{referenciasFiltradas.length}</span>
                    {' '}referencias faltantes {/* ✅ CAMBIAR texto */}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      disabled={paginaActual === 1}
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {paginaActual} de {totalPaginas}
                    </span>
                    <button
                      disabled={paginaActual === totalPaginas}
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}