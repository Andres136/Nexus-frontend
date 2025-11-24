import { useEffect, useState } from "react";
import { inventariosApi, usersApi } from "../../services/api";

import { 
  Search, 
  Filter, 
 
  Calendar, 
  User, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  RefreshCw
} from "lucide-react";
import Select from "react-select";
export default function MovimientoInventario() {
  const [movimientos, setMovimientos] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    producto: "",
    tipo: "",
    usuario_id: "",
    desde: "",
    hasta: "",
    page: 1,
  });
  //Listado de usuarios para filtro
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getUsers();
  
      setUsers(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const response = await inventariosApi.movimientosStock(filtros);
      setMovimientos(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, [filtros.page]);

  // Cuando cambian filtros → página vuelve a 1
  const aplicarFiltros = () => {
    setFiltros({ ...filtros, page: 1 });
    fetchMovimientos();
  };

  const handlePageChange = (page) => {
    setFiltros({ ...filtros, page });
  };

  const tiposMovimiento = [
    { value: "", label: "Todos los tipos" },
    { value: "descuento_masivo", label: "Descuento masivo" },
    { value: "traslado", label: "Traslado" },
    { value: "ingreso", label: "Ingreso" },
    { value: "ajuste_positivo", label: "Ajuste positivo" },
    { value: "anulacion", label: "Anulación" }
  ];

  const getTipoColor = (tipo) => {
    const colores = {
      'descuento_masivo': 'bg-red-100 text-red-800 border-red-200',
      'traslado': 'bg-blue-100 text-blue-800 border-blue-200',
      'ingreso': 'bg-green-100 text-green-800 border-green-200',
      'ajuste_positivo': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'anulacion': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                Movimientos de Inventario
              </h1>
              <p className="text-gray-600 mt-2">
                Consulta y gestiona todos los movimientos de stock
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              <RefreshCw className="w-4 h-4" />
              Total: {meta?.total || 0} registros
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Tipo de movimiento
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {tiposMovimiento.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            {/* Usuario */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Usuario
              </label>
              <Select
                options={[{ value: "", label: "Todos los usuarios" }, ...users.map(u => ({ value: u.id, label: u.name }))]}
                value={users
                  .filter(u => u.id === filtros.usuario_id)
                  .map(u => ({ value: u.id, label: u.name }))}
                onChange={(selected) => setFiltros({ ...filtros, usuario_id: selected ? selected.value : "" })}
                className="basic-multi-select"
                classNamePrefix="select"
                isClearable
              />
        
            </div>

            {/* Fecha desde */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Desde
              </label>
              <input
                type="date"
                value={filtros.desde}
                onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Fecha hasta */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Hasta
              </label>
              <input
                type="date"
                value={filtros.hasta}
                onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Botón aplicar */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-transparent">Acción</label>
              <button
                onClick={aplicarFiltros}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header de la tabla */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Resultados {meta?.total ? `(${meta.total})` : ''}
            </h3>
          </div>

          {/* Tabla responsive */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    PDF
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-gray-600">Cargando movimientos...</span>
                      </div>
                    </td>
                  </tr>
                ) : movimientos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-600">No se encontraron movimientos</span>
                        <span className="text-sm text-gray-400">Ajusta los filtros para obtener resultados</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  movimientos.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{mov.id}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTipoColor(mov.tipo)}`}>
                          {mov.tipo?.replace('_', ' ')}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-2">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {mov.usuario?.name || 'Usuario no disponible'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(mov.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {mov.pdf_url ? (
                          <a
                            href={mov.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver PDF
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-sm">
                            <FileText className="w-4 h-4" />
                            No disponible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {meta && meta.last_page > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Info de paginación */}
              <div className="text-sm text-gray-600">
                Mostrando {((meta.current_page - 1) * meta.per_page) + 1} al {Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total} resultados
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center gap-2">
                
                {/* Anterior */}
                <button
                  disabled={!meta.prev_page_url}
                  onClick={() => handlePageChange(meta.current_page - 1)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    meta.prev_page_url
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Páginas */}
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(Math.min(meta.last_page, 7))].map((_, i) => {
                    let pageNum;
                    
                    if (meta.last_page <= 7) {
                      pageNum = i + 1;
                    } else if (meta.current_page <= 4) {
                      pageNum = i + 1;
                    } else if (meta.current_page >= meta.last_page - 3) {
                      pageNum = meta.last_page - 6 + i;
                    } else {
                      pageNum = meta.current_page - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          meta.current_page === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Página actual (solo en mobile) */}
                <div className="sm:hidden bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
                  {meta.current_page} / {meta.last_page}
                </div>

                {/* Siguiente */}
                <button
                  disabled={!meta.next_page_url}
                  onClick={() => handlePageChange(meta.current_page + 1)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    meta.next_page_url
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}