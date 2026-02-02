import { useEffect, useState } from "react";
import { useTrasladosBodega } from "../../../hooks/traslados-bodegas/useTrasladosBodegas";
import { 
  Search, 
  Filter, 
  Package, 
  Eye, 
  Download, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  User,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Home,
  ChevronRight as ChevronRightBreadcrumb,
  Plus,
  Edit
} from "lucide-react";
import { Link } from "react-router-dom";

const ESTADOS_TRASLADO = {
  'PENDIENTE_BODEGA': { 
    label: 'Pendiente Bodega', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock 
  },
  'PENDIENTE_INVENTARIO': { 
    label: 'Pendiente Inventario', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertCircle 
  },
  'APROBADO': { 
    label: 'Aprobado', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle 
  },
  'DESPACHADO': { 
    label: 'Despachado', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Package 
  },
  'RECHAZADO_BODEGA': { 
    label: 'Rechazado Bodega', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle 
  }
};

export default function ObtenerTrasladosBodegas() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const {
    data,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    fetchTraslados,
    crearTraslado,
    aprobarPorBodega,
    aprobarInventario,
    getByEstado,
  } = useTrasladosBodega();

  useEffect(() => {
    fetchTraslados();
  }, [filters]);

  // Función para manejar la búsqueda
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setFilters(prev => ({ ...prev, search: value }));
  };

  // Función para resetear filtros
  const resetFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      order_by: 'created_at',
      order: 'desc',
      per_page: 15
    });
  };

  // Componente Badge para estados
  const EstadoBadge = ({ estado }) => {
    const config = ESTADOS_TRASLADO[estado] || { 
      label: estado, 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: AlertCircle 
    };
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-3" />
        <span className="text-gray-600">Cargando traslados...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <XCircle className="w-5 h-5 text-red-400 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumbs
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRightBreadcrumb className="w-4 h-4 text-gray-400 mx-1" />
              <a href="/inventario" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Inventario
              </a>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRightBreadcrumb className="w-4 h-4 text-gray-400 mx-1" />
              <span className="text-sm font-medium text-indigo-600">Traslados entre Bodegas</span>
            </div>
          </li>
        </ol>
      </nav> */}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Traslados entre Bodegas</h1>
              <p className="text-gray-600">Gestiona los traslados de productos entre bodegas</p>
            </div>
          </div>
          
        
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Buscador */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por código o estado..."
                  value={searchInput}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </button>
              
              <button
                onClick={() => fetchTraslados()}
                disabled={loading}
                className="inline-flex items-center px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Panel de filtros expandido */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={filters.order_by || 'created_at'}
                  onChange={(e) => setFilters(prev => ({ ...prev, order_by: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="created_at">Fecha de creación</option>
                  <option value="codigo">Código</option>
                  <option value="estado">Estado</option>
                </select>
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden
                </label>
                <select
                  value={filters.order || 'desc'}
                  onChange={(e) => setFilters(prev => ({ ...prev, order: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="desc">Más reciente</option>
                  <option value="asc">Más antiguo</option>
                </select>
              </div>

              {/* Por página */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Elementos por página
                </label>
                <select
                  value={filters.per_page || 15}
                  onChange={(e) => setFilters(prev => ({ ...prev, per_page: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Botón reset */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de traslados */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Tabla */}
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Bodegas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Creador
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Aprobador Inventario
                  </th>

                  
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">#{item.id}</span>
                      </div>
                    </td>

                    {/* Código */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{item.codigo}</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EstadoBadge estado={item.estado} />
                    </td>

                    {/* Bodegas */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <Building2 className="w-3 h-3 text-blue-500 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-24">{item.bodega_origen?.nombre}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="mr-1">↓</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Building2 className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-24">{item.bodega_destino?.nombre}</span>
                        </div>
                      </div>
                    </td>

                    {/* Creador */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{item.creador?.name}</span>
                      </div>
                    </td>

                    {/* Aprobador Inventario */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        {item.aprobador_inventario?.name ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                            <span className="truncate">{item.aprobador_inventario.name}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 mr-2 text-yellow-500 flex-shrink-0" />
                            <span className="text-gray-400">Pendiente</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/auth/detalles-traslado/${item.id}`}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                   
                        <Link
                          to={`/auth/editar-traslado/${item.id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Descargar PDF"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Estado vacío */
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay traslados</h3>
            <p className="text-gray-600 mb-6">
              {searchInput ? 'No se encontraron traslados con los filtros aplicados' : 'Aún no se han creado traslados entre bodegas'}
            </p>
            <Link
              to="/auth/traslado-bodegas"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Traslado
            </Link>
          </div>
        )}

        {/* Paginación */}
        {pagination && pagination.links && pagination.links.filter(l => l.url).length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              
              {/* Información de paginación */}
              <div className="text-sm text-gray-600">
                Mostrando {pagination.from || 0} a {pagination.to || 0} de {pagination.total || 0} resultados
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center space-x-2">
                {pagination.links
                  .filter(l => l.url)
                  .map((link, i) => {
                    const pageNumber = new URL(link.url).searchParams.get('page');
                    const isActive = link.active;
                    const isPrevNext = link.label.includes('&laquo;') || link.label.includes('&raquo;');
                    
                    return (
                      <button
                        key={i}
                        onClick={() => fetchTraslados(pageNumber)}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          isActive 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={!link.url}
                      >
                        {isPrevNext ? (
                          link.label.includes('&laquo;') ? (
                            <ChevronLeft className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )
                        ) : (
                          link.label
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}