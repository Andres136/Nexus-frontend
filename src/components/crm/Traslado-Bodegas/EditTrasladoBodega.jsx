import { useNavigate, useParams } from "react-router-dom";
import { useEditTrasladoBodega } from "../../../hooks/traslados-bodegas/useEditTrasladoBodega";
import Select from 'react-select';
import {
  ArrowLeft,
  Package,
  Building2,
  FileText,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  Hash,
  RefreshCw,
  Edit3,
  Home,
  ChevronRight,
  Warehouse,
  MessageSquare,
  Box,
} from 'lucide-react';

export default function EditTrasladoBodega() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Usar el hook personalizado
  const {
    // Estados
    formData,
    traslado,
    loading,
    saving,
    loadingStock,
    stockInfo,
    selectedProduct,
    bodegaOrigen,
    bodegaDestino,
    cantidad,
    showAddProduct,
    search,
    
    // Data
    isLoading,
    bodegaOptions,
    productOptions,
    
    // Computed
    canEdit,
    isFormValid,
    
    // Setters
    setSelectedProduct,
    setBodegaOrigen,
    setBodegaDestino,
    setCantidad,
    setShowAddProduct,
    setSearch,
    
    // Funciones
    agregarProducto,
    eliminarProducto,
    actualizarCantidad,
    handleSubmit,
    resetForm,
    updateFormField
  } = useEditTrasladoBodega(id);

  // Handlers del componente
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(navigate);
    } catch (error) {
      // Manejar error si es necesario
    }
  };

  const onBodegaOrigenChange = (selected) => {
    setBodegaOrigen(selected);
    updateFormField('bodega_origen_id', selected?.value || '');
  };

  const onBodegaDestinoChange = (selected) => {
    setBodegaDestino(selected);
    updateFormField('bodega_destino_id', selected?.value || '');
  };

  const onObservacionesChange = (e) => {
    updateFormField('observaciones', e.target.value);
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '42px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
      '&:hover': { borderColor: '#6366f1' }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#374151'
    })
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12 sm:py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-3" />
            <span className="text-gray-600 text-sm sm:text-base">Cargando traslado...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!traslado) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 sm:py-20">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Traslado no encontrado</h3>
            <p className="text-gray-600 text-sm sm:text-base px-4">El traslado solicitado no existe.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Can't edit state
  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 sm:py-20">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No se puede editar</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">
              Este traslado no se puede editar en estado: <strong>{traslado.estado}</strong>
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        
        {/* Breadcrumbs */}
        <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center space-x-1 text-xs sm:text-sm">
            <li className="inline-flex items-center">
              <a href="/dashboard" className="inline-flex items-center font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Inicio</span>
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1" />
                <button 
                  onClick={() => navigate('/traslados/bodegas')}
                  className="font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Traslados
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1" />
                <button 
                  onClick={() => navigate(`/traslados/bodegas/${id}`)}
                  className="font-medium text-gray-700 hover:text-indigo-600 transition-colors truncate max-w-20 sm:max-w-none"
                >
                  {traslado.codigo}
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1" />
                <span className="font-medium text-indigo-600">Editar</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="self-start p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <div className="bg-indigo-100 p-2 sm:p-3 rounded-xl flex-shrink-0">
                <Edit3 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Editar {traslado.codigo}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">Modifica los detalles del traslado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
          
          {/* Información básica */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="flex items-center text-base sm:text-lg font-semibold text-gray-900">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-500" />
                Información del Traslado
              </h2>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                
                {/* Bodega Origen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Bodega Origen
                  </label>
                  <Select
                    options={bodegaOptions}
                    value={bodegaOrigen}
                    onChange={onBodegaOrigenChange}
                    placeholder="Seleccionar bodega origen..."
                    styles={customSelectStyles}
                    isSearchable
                    className="w-full"
                  />
                </div>

                {/* Bodega Destino */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Warehouse className="w-4 h-4 inline mr-1" />
                    Bodega Destino
                  </label>
                  <Select
                    options={bodegaOptions.filter(b => b.value !== bodegaOrigen?.value)}
                    value={bodegaDestino}
                    onChange={onBodegaDestinoChange}
                    placeholder="Seleccionar bodega destino..."
                    styles={customSelectStyles}
                    isSearchable
                    className="w-full"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="mt-4 sm:mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={onObservacionesChange}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Observaciones del traslado..."
                />
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="flex items-center text-base sm:text-lg font-semibold text-gray-900">
                  <Box className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-500" />
                  Productos
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                    {formData.detalles.length}
                  </span>
                </h2>
                
                <button
                  type="button"
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </button>
              </div>
            </div>

            {/* Panel para agregar producto */}
            {showAddProduct && (
              <div className="px-4 sm:px-6 py-4 bg-blue-50 border-b border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Agregar nuevo producto</h3>
                
                <div className="space-y-4">
                  {/* Selector de producto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                    <Select
                      options={productOptions}
                      value={selectedProduct}
                      onChange={setSelectedProduct}
                      onInputChange={setSearch}
                      placeholder="Buscar producto..."
                      styles={customSelectStyles}
                      isSearchable
                      isLoading={isLoading}
                      formatOptionLabel={(option) => (
                        <div className="flex justify-between items-center">
                          <span className="truncate">{option.label}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2 flex-shrink-0">
                            {option.code}
                          </span>
                        </div>
                      )}
                    />
                  </div>

                  {/* Cantidad y Botones */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                      <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 sm:flex-col sm:justify-end sm:min-w-[120px]">
                      <button
                        type="button"
                        onClick={agregarProducto}
                        disabled={!selectedProduct || !cantidad || Number(cantidad) <= 0}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 sm:flex-none px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4 mx-auto sm:mx-0" />
                        <span className="sm:hidden ml-1">Cancelar</span>
                      </button>
                    </div>
                  </div>

                  {/* Información de stock */}
                  {selectedProduct && (
                    <div className="p-3 bg-white border border-blue-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                        <span className="text-gray-600">Stock en bodega origen:</span>
                        <div className="flex items-center">
                          {loadingStock ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-blue-600 mr-1" />
                              <span className="text-blue-600">Consultando...</span>
                            </>
                          ) : stockInfo ? (
                            <span className={`font-semibold ${stockInfo.stock_total > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stockInfo.stock_total} unidades
                            </span>
                          ) : (
                            <span className="text-gray-500">No disponible</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tabla de productos - Mobile Cards */}
            <div className="sm:hidden">
              {formData.detalles.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No hay productos agregados</p>
                  <p className="text-xs">Usa "Agregar Producto" para comenzar</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {formData.detalles.map((detalle, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-1">
                            <Hash className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                            <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded truncate">
                              {detalle.producto_code || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Package className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {detalle.producto_nombre}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarProducto(detalle.producto_id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Cantidad:</label>
                        <input
                          type="number"
                          value={detalle.cantidad}
                          onChange={(e) => actualizarCantidad(detalle.producto_id, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabla desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.detalles.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>No hay productos agregados</p>
                        <p className="text-sm">Usa el botón "Agregar Producto" para comenzar</p>
                      </td>
                    </tr>
                  ) : (
                    formData.detalles.map((detalle, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {detalle.producto_code || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">
                              {detalle.producto_nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <input
                            type="number"
                            value={detalle.cantidad}
                            onChange={(e) => actualizarCantidad(detalle.producto_id, e.target.value)}
                            className="w-20 sm:w-24 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            min="0.01"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarProducto(detalle.producto_id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Resumen */}
            {formData.detalles.length > 0 && (
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Total de productos: {formData.detalles.length}
                  </span>
                  <span className="text-lg font-bold text-indigo-600">
                    {formData.detalles.reduce((sum, d) => sum + Number(d.cantidad), 0).toFixed(2)} unidades
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving || !isFormValid}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg text-sm sm:text-base order-1 sm:order-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}