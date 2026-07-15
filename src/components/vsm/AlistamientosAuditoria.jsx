import { 
  Clock, 
  Users, 
  Package, 
  Search,
  Filter,
  Calendar,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Timer,
  CheckCircle2
} from "lucide-react";
import { useState, useMemo } from "react";
import useAlistamientosFinalizados from "../../hooks/vsm/useAlistamientoFinalizados";

export default function AlistamientosAuditoria() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedSede, setSelectedSede] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const { data, meta, loading } = useAlistamientosFinalizados({ page, perPage: 16 }); // ✅ Aumentado para grid 4x4

  // ✅ Obtener clientes únicos para filtro
  const uniqueClients = useMemo(() => {
    if (!data) return [];
    const clients = data.map(item => item.cliente?.nombre).filter(Boolean);
    return [...new Set(clients)].sort();
  }, [data]);

  // ✅ Obtener sedes únicas para filtro
  const uniqueSedes = useMemo(() => {
    if (!data) return [];
    const sedes = data.map(item => item.sede?.nombre).filter(Boolean);
    return [...new Set(sedes)].sort();
  }, [data]);

  // ✅ Filtrar datos
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(item => {
      const matchesSearch = searchTerm === "" || 
        String(item.orden_trabajo_id ?? item.id).includes(searchTerm) ||
        (item.cliente?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClient = selectedClient === "" || item.cliente?.nombre === selectedClient;
      const matchesSede = selectedSede === "" || item.sede?.nombre === selectedSede;
      
      return matchesSearch && matchesClient && matchesSede;
    });
  }, [data, searchTerm, selectedClient, selectedSede]);

  // ✅ Limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedClient("");
    setSelectedSede("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-600">Cargando auditoría de alistamientos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      
      {/* ✅ Header mejorado */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                   Auditoría de Alistamientos
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Historial completo de alistamientos finalizados
                </p>
              </div>
            </div>
            
            {/* ✅ Métricas rápidas */}
            <div className="hidden md:flex items-center gap-6 bg-gray-50 rounded-lg px-4 py-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{meta?.total || 0}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{filteredData.length}</div>
                <div className="text-xs text-gray-600">Filtrados</div>
              </div>
            </div>
          </div>

          {/* ✅ Barra de búsqueda y filtros */}
          <div className="space-y-4">
            
            {/* Búsqueda principal */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por OT o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Toggle filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  showFilters || selectedClient || selectedSede
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {(selectedClient || selectedSede) && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {(selectedClient ? 1 : 0) + (selectedSede ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* ✅ Panel de filtros expandible */}
            {showFilters && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Filtro Cliente */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Cliente
                    </label>
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Todos los clientes</option>
                      {uniqueClients.map(client => (
                        <option key={client} value={client}>{client}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Sede */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-purple-600" />
                      Sede
                    </label>
                    <select
                      value={selectedSede}
                      onChange={(e) => setSelectedSede(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Todas las sedes</option>
                      {uniqueSedes.map(sede => (
                        <option key={sede} value={sede}>{sede}</option>
                      ))}
                    </select>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      disabled={!searchTerm && !selectedClient && !selectedSede}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Grid de 4 columnas con scroll */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {filteredData.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron registros
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedClient || selectedSede
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay alistamientos finalizados disponibles"
              }
            </p>
          </div>
        ) : (
          <>
            {/* ✅ Grid responsivo de 4 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6  pr-2">
              {filteredData.map((alist) => (
                <div
                  key={alist.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  
                  {/* ✅ Header de la card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-gray-900">
                          {alist.tipo_origen === "LIBRE" ? `Libre #${alist.id}` : `OT #${alist.orden_trabajo_id}`}
                        </span>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Finalizado
                      </div>
                    </div>
                  </div>

                  {/* ✅ Contenido de la card */}
                  <div className="p-4 space-y-4">
                    
                    {/* Cliente y Sede */}
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Building2 className="w-3 h-3" />
                        Cliente
                      </div>
                      <p className="font-medium text-gray-900 text-sm truncate" title={alist.cliente?.nombre}>
                        {alist.cliente?.nombre || "Rendimiento libre"}
                      </p>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1 mt-2">
                        <User className="w-3 h-3" />
                        Sede
                      </div>
                      <p className="text-sm text-gray-600 truncate" title={alist.sede?.nombre}>
                        {alist.sede?.nombre || "Sin sede"}
                      </p>
                    </div>

                    {/* Tiempo total destacado */}
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Timer className="w-4 h-4" />
                        <span className="text-xs font-medium">TIEMPO TOTAL</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {alist.horas_totales}h
                      </p>
                    </div>

                    {/* Usuarios compacto */}
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Users className="w-3 h-3" />
                        Usuarios ({alist.usuarios.length})
                      </div>
                      <div className="max-h-20 overflow-y-auto">
                        {alist.usuarios.map((u, index) => (
                          <div key={u.id} className="flex justify-between items-center py-1 text-xs border-b border-gray-100 last:border-0">
                            <span className="font-medium text-gray-700 truncate flex-1 mr-2">
                              {u.name}
                            </span>
                            <span className="text-blue-600 font-bold">
                              {u.horas_usuario}h
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Productos compacto */}
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Package className="w-3 h-3" />
                        Productos ({alist.detalles.length})
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {alist.detalles.map((d, i) => (
                          <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-100 last:border-0">
                            <div className="truncate font-medium mb-1">{d.producto}</div>
                            <div className="flex justify-between text-xs">
                              <span>Prog: {d.programada}</span>
                              <span>Alist: {d.alistada}</span>
                              <span className={d.faltante > 0 ? 'text-red-600' : 'text-green-600'}>
                                Falt: {d.faltante}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ Paginación mejorada */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Mostrando {filteredData.length} de {meta?.total || 0} registros
                  </span>
                  {(selectedClient || selectedSede || searchTerm) && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Filtrado
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                    Anterior
                  </button>

                  <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                    {page} de {meta?.lastPage || 1}
                  </span>

                  <button
                    disabled={page >= (meta?.lastPage || 1)}
                    onClick={() => setPage(page + 1)}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Siguiente
                    <ChevronUp className="w-4 h-4 rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
