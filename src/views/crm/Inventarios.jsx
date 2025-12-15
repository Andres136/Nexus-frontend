import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiFilter, FiDownload, FiRefreshCw, FiPackage, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiPlus, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { BsBoxSeam, BsGraphUp, BsExclamationTriangle, BsFileEarmarkExcel } from 'react-icons/bs';
import { Link,useLocation } from 'react-router-dom';
import { inventariosApi, productsApi } from '../../services/api';
import { useEmpresas } from '../../hooks/useEmpresas';
import SincronizacionSiigoProductos from '../../components/crm/SincronizacionSiigoProductos';
import Swal from 'sweetalert2';



export default function Inventarios() {
  const inputRef = useRef(null);
const lastScrollTop = useRef(0);

  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodega, setSelectedBodega] = useState('');
  const [selectedSede, setSelectedSede] = useState('');
  const [bodegas, setBodegas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bodegasFiltradas, setBodegasFiltradas] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);




  
  const [pagination, setPagination] = useState({
    current_page: 1, 
    last_page: 1,
    total_registros: 0,
    per_page: 20,
    from: 0,
    to: 0
  });
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalStock: 0,
    stockBajo: 0,
    valorTotal: 0
  });

  const { empresas } = useEmpresas();
  useEffect(() => {
    const timeout = setTimeout(() => {

        if (inputRef.current) {
      lastScrollTop.current = window.scrollY;
    }

      cargarInventarios(1); // Siempre volver a página 1 cuando cambien filtros
      setCurrentPage(1);
    }, 600); // Debounce de 600ms

    return () => clearTimeout(timeout);
  }, [searchTerm, selectedBodega, selectedSede, selectedEmpresa]);

 useEffect(() => {
  if (inputRef.current) {
    window.scrollTo({ top: lastScrollTop.current });
    inputRef.current.focus(); // 🔥 Mantiene el puntero en el input
  }
}, [inventarios]);

  useEffect(() => {
  if (selectedSede && Array.isArray(bodegas)) {
    const filtradas = bodegas.filter(
      (b) => String(b.sede_id) === String(selectedSede)
    );
    setBodegasFiltradas(filtradas);

    // Si la bodega seleccionada no pertenece a la sede actual, la limpiamos
    if (
      selectedBodega &&
      !filtradas.some((b) => String(b.id) === String(selectedBodega))
    ) {
      setSelectedBodega("");
    }
  } else {
    setBodegasFiltradas(bodegas); // Mostrar todas si no hay sede seleccionada
  }
}, [selectedSede, bodegas]);

//Traer sedes




  const cargarInventarios = async (page = 1) => {
    try {
      setLoading(true);
      setCurrentPage(page);

      const params = {
        sede_id: selectedSede || undefined,
        bodega_id: selectedBodega || undefined,
        producto: searchTerm || undefined,
        per_page: 20,
        page, 
        empresa_id: selectedEmpresa || undefined
      }

    
      const { data } = await inventariosApi.listar(params);


   // console.log('Datos de inventarios recibidos:', data);
      setPagination(data.pagination);
      setInventarios(data.data);

      // ✅ Calcular estadísticas dinámicamente según los filtros activos
let nuevasEstadisticas = data.estadisticas || {};

if (selectedSede && data.estadisticas_por_filtro?.por_sede) {
  const sedeStats = data.estadisticas_por_filtro.por_sede.find(
    (s) => String(s.sede_id) === String(selectedSede)
  );
  if (sedeStats) nuevasEstadisticas = sedeStats;
}

if (selectedBodega && data.estadisticas_por_filtro?.por_bodega) {
  const bodegaStats = data.estadisticas_por_filtro.por_bodega.find(
    (b) => String(b.bodega_id) === String(selectedBodega)
  );
  if (bodegaStats) nuevasEstadisticas = bodegaStats;
}

setStats({
  totalProductos: nuevasEstadisticas.total_productos || 0,
  totalStock: nuevasEstadisticas.total_stock || 0,
  valorTotal: nuevasEstadisticas.valor_total || 0,
  stockBajo: nuevasEstadisticas.stock_bajo || 0,
});

    

      // ✅ USAR NOMBRES CORRECTOS DEL BACKEND:
      setSedes(data.sedes_disponibles || []);
      setBodegas(data.bodegas_disponibles || []);

     


     

    } catch (error) {
      console.error('Error al cargar inventarios:', error);
    } finally {
      setLoading(false);
    }
  };



  const getStockStatus = (stock, stockMinimo, stockMaximo) => {
    if (stock <= stockMinimo) return 'bajo';
    if (stock >= stockMaximo) return 'alto';
    return 'normal';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

const exportarInventarios = async () => {
  try {
    const params = {
      sede_id: selectedSede || undefined,
      bodega_id: selectedBodega || undefined,
      producto: searchTerm || undefined,
      empresa_id: selectedEmpresa || undefined
    };

    const response = await inventariosApi.exportar(params);

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `inventario_${new Date().toISOString().slice(0,10)}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {



   // console.error('Error al exportar inventario:', error);
   if (error.response && error.response.data) {
    const reader = new FileReader();
    reader.onload = () => {
        console.log("ERROR SERVIDOR:", reader.result);
    };
    reader.readAsText(error.response.data);
}

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo exportar el inventario",
    });
  }
};


  // 🔹 Calcular stock total de un producto específico
const obtenerStockTotalProducto = (productoId) => {
  const total = inventarios
    .filter((item) => item.producto?.id === productoId)
    .reduce((sum, item) => sum + Number(item.stock || 0), 0);

  return total;
};

const descargarPlantilla = async () => {
    try {
      const response = await productsApi.exportarPlantilla();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plantilla_productos.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("Error al descargar la plantilla", error);
    }
  };

  const generarEtiquetas = async () => {
  try {
    const res = await productsApi.generarBarcodes({
      product_ids: productosSeleccionados,
    });

    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: "application/pdf" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "etiquetas_productos.pdf";
    link.click();

  } catch (error) {
    console.error("Error al generar las etiquetas", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron generar las etiquetas",
    });
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando inventarios...</p>
        </div>
      </div>
    );
  }

  return (
 <div className="min-h-screen bg-gray-50 p-2 sm:p-2 md:p-2 lg:p-3">

    <div className='grid grid-cols-1'>
      <div className="max-w-7xl mx-auto">
        
     {/* ✅ Encabezado moderno y responsive */}
    {/* 🔹 Título y subtítulo */}
    {/* ✅ SECCIÓN DE BOTONES REORGANIZADA */}
<div className="bg-white rounded-xl shadow border border-gray-200 p-3 sm:p-4 md:p-5 lg:p-6 mb-4 sm:mb-6">
  <div className="flex flex-col gap-3 md:gap-4">
    
    {/* 🔹 Header con título y botón principal */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiPackage className="w-5 h-5 text-blue-600" />
          Acciones Rápidas
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Gestiona tu inventario de forma eficiente
        </p>
      </div>

         <Link
          to="/auth/crm/crear-productos"
          className={`text-sm font-medium transition-all ${
            location.pathname === "/auth/crm/crear-productos"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Crear Productos
        </Link>
      
      {/* Botón principal más prominente */}
      <Link
        to="/auth/crm/registrar-inventario"
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-150 shadow-lg font-semibold text-sm"
      >
        <BsFileEarmarkExcel className="w-4 h-4" />
        Cargar Inventario Excel
      </Link>




    </div>

    {/* 🔹 Grupos de botones organizados */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      
      {/* Grupo 1: Gestión de Stock */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <BsBoxSeam className="w-4 h-4 text-emerald-600" />
          Gestión de Stock
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
          <Link
            to="/auth/crm/traslado-inventario"
            className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-all duration-150 text-sm font-medium"
          >
            <FiArrowRight className="w-4 h-4" />
            <span>Traslados</span>
          </Link>
          <Link
            to="/auth/crm/movimientos-stock"
            className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border border-amber-200 transition-all duration-150 text-sm font-medium"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Movimientos</span>
          </Link>
        </div>
      </div>

      {/* Grupo 2: Reportes y Alertas */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FiAlertTriangle className="w-4 h-4 text-red-600" />
          Reportes y Alertas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
          <Link
            to="/auth/crm/ordenes-faltantes"
            className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition-all duration-150 text-sm font-medium"
          >
            <FiAlertCircle className="w-4 h-4" />
            <span>Órdenes Faltantes</span>
          </Link>
          <button
            onClick={exportarInventarios}
            className="flex items-center gap-2 px-3 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition-all duration-150 text-sm font-medium"
          >
            <FiDownload className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
            <button
    disabled={productosSeleccionados.length === 0}
    onClick={generarEtiquetas}
    className="
      flex items-center gap-1.5
      px-3 py-2
      text-xs font-medium
      rounded-md
      border border-gray-200
      bg-gray-50 text-gray-700
      hover:bg-gray-100
      disabled:opacity-40 disabled:cursor-not-allowed
    "
  >
    <FiDownload className="w-3.5 h-3.5" />
    Etiquetas
  </button>
        </div>
      </div>

      {/* Grupo 3: Herramientas */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FiDownload className="w-4 h-4 text-indigo-600" />
          Herramientas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
          <button
            onClick={() => cargarInventarios(pagination.current_page)}
            className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-all duration-150 text-sm font-medium"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
          <button
            onClick={descargarPlantilla}
            className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-all duration-150 text-sm font-medium"
          >
            <FiDownload className="w-4 h-4" />
            <span>Plantilla</span>
          </button>
        </div>
      </div>
    </div>

    {/* 🔹 Sincronización Siigo (separado) */}
    <div className="border-t border-gray-200 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Sincronización Externa</h3>
          <p className="text-xs text-gray-500">Conecta con sistemas externos</p>
        </div>
        <div className="flex gap-2">
          <SincronizacionSiigoProductos />
     
        </div>
      </div>
    </div>
  </div>
</div>


        {/* ✅ Estadísticas mejoradas responsivas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  <span className="hidden sm:inline">Total Productos</span>
                  <span className="sm:hidden">Productos</span>
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {stats.totalProductos.toLocaleString()}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                <FiPackage className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  <span className="hidden sm:inline">Stock Total</span>
                  <span className="sm:hidden">Stock</span>
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {stats.totalStock.toLocaleString()}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0">
                <FiTrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 hidden sm:block">
              Mostrando totales {selectedBodega
                ? `de la bodega seleccionada`
                : selectedSede
                ? `de la sede seleccionada`
                : `globales`}
            </p>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  <span className="hidden sm:inline">Stock Bajo</span>
                  <span className="sm:hidden">Bajo</span>
                </p>
                <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                  {stats.stockBajo}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0">
                <FiAlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  <span className="hidden sm:inline">Valor Total</span>
                  <span className="sm:hidden">Valor</span>
                </p>
                <p className="text-sm sm:text-2xl font-bold text-gray-900 truncate">
                  {formatCurrency(stats.valorTotal)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0">
                <BsGraphUp className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Filtros mejorados responsivos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <select
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Todas las sedes</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>

            <select
              value={selectedBodega}
              onChange={(e) => setSelectedBodega(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Todas las bodegas</option>
              {bodegasFiltradas.map((bodega) => (
                <option key={bodega.id} value={bodega.id}>
                  {bodega.nombre}
                  {bodega.sede && (
                    <span className="text-gray-400 text-xs"> • {bodega.sede.nombre}</span>
                  )}
                </option>
              ))}
            </select>

            <select
              value={selectedEmpresa}
              onChange={(e) => setSelectedEmpresa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-sm"
            >
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm justify-center">
              <FiFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Más filtros</span>
              <span className="sm:hidden">Filtros</span>
            </button>
          </div>
        </div>

        {/* ✅ Tabla responsiva mejorada */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6">
          {/* ✅ Vista móvil (cards) */}
          <div className="lg:hidden">
            {inventarios.map((item) => {
              const stockStatus = getStockStatus(item.stock, item.stock_minimo, item.stock_maximo);
              
              return (
                <div key={item.id} className="border-b border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                <div
  onClick={() => {
    const total = obtenerStockTotalProducto(item.producto.id);
    Swal.fire({
      title: ` Stock total de ${item.producto.name}`,
      html: `<b>Stock total disponible:</b> ${total.toLocaleString()} unidades`,
      icon: "info",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#2563eb",
    });
  }}
  className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
>
  {item.producto.name}
</div>

                      <p className="text-xs text-gray-500 truncate">
                        {item.producto.code} • {item.producto.categoria}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      stockStatus === 'bajo' 
                        ? 'bg-red-100 text-red-800'
                        : stockStatus === 'alto'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {stockStatus === 'bajo' ? 'Bajo' : stockStatus === 'alto' ? 'Alto' : 'Normal'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500">Ubicación</p>
                      <p className="font-medium">
                        {item.bodega?.nombre || 'Sin bodega'}
                      </p>
                      <p className="text-gray-400">
                        {item.sede?.nombre || 'Sin sede'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Stock</p>
                      <p className="font-medium">{item.stock} unidades</p>
                      <p className="text-gray-400">
                        Min: {item.stock_minimo} • Max: {item.stock_maximo}
                      </p>
                    </div>
                    
                  
                    
                    <div>
                      <p className="text-gray-500">Acciones</p>
                 </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ✅ Vista desktop (tabla) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventarios.map((item) => {
                  const stockStatus = getStockStatus(item.stock, item.stock_minimo, item.stock_maximo);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                     <div
  onClick={() => {
    const total = obtenerStockTotalProducto(item.producto.id);
    Swal.fire({
      title: ` Stock total de ${item.producto.name}`,
      html: `<b>Stock total disponible:</b> ${total.toLocaleString()} unidades`,
    icon: "info",
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#2563eb",
    });
  }}
  className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
>
  {item.producto.name}
</div>

                          <div className="text-sm text-gray-500">
                            {item.producto.code} • {item.producto.categoria}
                            <div className="text-xs text-gray-500">
                              Empresa: {item.empresa?.nombre || 'Sin empresa'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.bodega?.nombre || (
                              <span className="text-gray-400 italic">Sin bodega</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.sede?.nombre || (
                              <span className="text-gray-400 italic">Sin sede</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-bold">{item.stock}</span> unidades
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.stock_minimo} • Max: {item.stock_maximo}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stockStatus === 'bajo' 
                            ? 'bg-red-100 text-red-800'
                            : stockStatus === 'alto'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {stockStatus === 'bajo' && <FiTrendingDown className="w-3 h-3 mr-1" />}
                          {stockStatus === 'alto' && <FiTrendingUp className="w-3 h-3 mr-1" />}
                          {stockStatus === 'normal' && <BsGraphUp className="w-3 h-3 mr-1" />}
                          {stockStatus === 'bajo' ? 'Stock Bajo' : stockStatus === 'alto' ? 'Stock Alto' : 'Normal'}
                        </span>
                      </td>
                      
              
                      
                     <td className="px-6 py-4 text-center">
 <input
  type="checkbox"
  checked={productosSeleccionados.includes(item.producto.id)}
  onChange={(e) => {
    setProductosSeleccionados(prev => {
      if (e.target.checked) {
        return [...new Set([...prev, item.producto.id])];
      } else {
        return prev.filter(id => id !== item.producto.id);
      }
    });
  }}
/>

</td>

                    </tr>
                  );
                })}
              </tbody>


 
            </table>


          </div>

          {/* ✅ Estado vacío responsivo */}
          {inventarios.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <BsExclamationTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No se encontraron inventarios
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                Intenta ajustar los filtros o verificar que existan inventarios registrados.
              </p>
            </div>
          )}
        </div>

        {/* ✅ Paginación responsiva mejorada */}
        {pagination.total_registros > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                Mostrando <span className="font-medium">{pagination.from}</span> a{' '}
                <span className="font-medium">{pagination.to}</span> de{' '}
                <span className="font-medium">{pagination.total_registros}</span> registros
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => cargarInventarios(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">Ant</span>
                </button>

                <span className="px-3 py-2 text-xs sm:text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg whitespace-nowrap">
                  {pagination.current_page || 1} de {pagination.last_page || 1}
                </span>

                <button
                  onClick={() => cargarInventarios(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <span className="sm:hidden">Sig</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}