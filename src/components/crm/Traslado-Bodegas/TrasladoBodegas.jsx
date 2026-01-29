import { useState, useEffect } from "react";
import { useProducts } from "../../../hooks/useProducts";
import { productsApi } from "../../../services/api";
import { useSedes } from "../../../hooks/useSedes";
import Select from 'react-select';
import { 
  Package, 
  Plus, 
  Trash2, 
  Building2, 
  ArrowRight, 
  Send,
  Home,
  ChevronRight,
  AlertCircle,
  CheckCircle2,

} from "lucide-react";
import { trasladosBodegaApi } from "../../../services/trasladosBodegaService";
import { showToast } from "../../../helpers/utils/showToast";
import { Link } from "react-router-dom";

export default function TrasladoBodegas() {
  const [search, setSearch] = useState("");
  
  // Estado del formulario - manteniendo tu estructura
  const [formData, setFormData] = useState({
    bodega_origen_id: '',
    bodega_destino_id: '',
    observaciones: '',
    detalles: []
  });
  
  const { products, isLoading, isFetching, isEmpty } = useProducts({ search });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bodegaOrigen, setBodegaOrigen] = useState(null);
  const [bodegaDestino, setBodegaDestino] = useState(null);
  const { bodegasAll,bodegas} = useSedes();
  
  // Estados adicionales
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [stockInfo, setStockInfo] = useState(null);
  const [cantidad, setCantidad] = useState('');

  // Tu función fetchDirectStock mantenida
const fetchDirectStock = async (productId) => {
  try {
    const params = {};

    if (bodegaOrigen?.value) {
      params.bodega_id = bodegaOrigen.value;
    }

    const res = await productsApi.getStock(productId, params);
    console.log("✅ Stock obtenido:", res.data.stock);

    setStockInfo(res.data.stock);
    return res.data.stock;
  } catch (err) {
    console.error("❌ Error obteniendo stock:", err);
    setStockInfo(null);
    return null;
  }
};

  // Cargar stock cuando cambie la bodega origen
  useEffect(() => {
    if (selectedProduct && bodegaOrigen) {
      fetchDirectStock(selectedProduct.value);
    } else {
      setStockInfo(null);
    }
  }, [bodegaOrigen, selectedProduct]);

  // Agregar producto al detalle
  const agregarProducto = () => {
    if (!selectedProduct || !cantidad || parseFloat(cantidad) <= 0) {
      setErrors({ producto: 'Selecciona un producto y cantidad válida' });
      return;
    }

    if (stockInfo && parseFloat(cantidad) > stockInfo.stock_total) {
      setErrors({ cantidad: `Stock insuficiente. Disponible: ${stockInfo.stock_total}` });
      return;
    }

    const nuevoDetalle = {
      producto_id: selectedProduct.value,
      producto_nombre: selectedProduct.label,
      cantidad: parseFloat(cantidad), // ✅ Cambio a parseFloat
      stock_disponible: stockInfo?.stock_total || 0
    };

    // Verificar si ya existe el producto
    const existeProducto = formData.detalles.find(d => d.producto_id === selectedProduct.value);
    
    if (existeProducto) {
      setFormData(prev => ({
        ...prev,
        detalles: prev.detalles.map(d => 
          d.producto_id === selectedProduct.value 
            ? { ...d, cantidad: d.cantidad + parseFloat(cantidad) } // ✅ Cambio a parseFloat
            : d
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        detalles: [...prev.detalles, nuevoDetalle]
      }));
    }

    // Limpiar formulario
    setSelectedProduct(null);
    setCantidad('');
    setStockInfo(null);
    setErrors({});
  };

  // Remover producto
  const removerProducto = (producto_id) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter(d => d.producto_id !== producto_id)
    }));
  };

  // Actualizar cantidad
  const actualizarCantidad = (producto_id, nuevaCantidad) => {
    if (parseFloat(nuevaCantidad) <= 0) { // ✅ Cambio a parseFloat
      removerProducto(producto_id);
      return;
    }

    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map(d => 
        d.producto_id === producto_id 
          ? { ...d, cantidad: parseFloat(nuevaCantidad) } // ✅ Cambio a parseFloat
          : d
      )
    }));
  };

  // Calcular cantidad total
  const cantidadTotal = formData.detalles.reduce((sum, d) => sum + d.cantidad, 0);

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const trasladoData = {
        bodega_origen_id: parseInt(formData.bodega_origen_id),
        bodega_destino_id: parseInt(formData.bodega_destino_id),
        cantidad_total: cantidadTotal, // Ya es decimal
        observaciones: formData.observaciones,
        detalles: formData.detalles.map(d => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad // Ya es decimal
        }))
      };

    //  console.log('Datos del traslado:', trasladoData);
      
      const response = await trasladosBodegaApi.create(trasladoData);
      console.log('Respuesta del API:', response);
      showToast('success', response.data.message);

      // Reset formulario
      setFormData({
        bodega_origen_id: '',
        bodega_destino_id: '',
        observaciones: '',
        detalles: []
      });
      setBodegaOrigen(null);
      setBodegaDestino(null);
      
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumbs */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/auth/crm" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <Link to="/auth/obtener-traslados" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Traslados
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <span className="text-sm font-medium text-indigo-600">Traslado entre Bodegas</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Traslado entre Bodegas</h1>
            <p className="text-gray-600">Seleccione una bodega de origen y una bodega de destino para realizar el traslado</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Configuración de Bodegas */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="flex items-center text-lg font-semibold text-gray-900">
                  <ArrowRight className="w-5 h-5 mr-2 text-indigo-500" />
                  Configuración del Traslado
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Bodega Origen */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Building2 className="w-4 h-4 mr-1 text-blue-500" />
                      Bodega de Origen *
                    </label>
                    <Select
                      value={bodegaOrigen}
                      onChange={(selected) => {
                        setBodegaOrigen(selected);
                        setFormData(prev => ({ 
                          ...prev, 
                          bodega_origen_id: selected?.value || '' 
                        }));
                        setStockInfo(null); // Reset stock info
                      }}
                      options={bodegas.map(bodega => ({
                        value: bodega.id,
                        label: bodega.nombre
                      }))}
                      placeholder="Seleccionar bodega origen..."
                      isClearable
                      isSearchable
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: '42px',
                          border: errors?.bodega_origen_id ? '2px solid #ef4444' : '1px solid #d1d5db',
                          borderRadius: '8px',
                          '&:hover': { borderColor: '#6366f1' },
                          boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none'
                        })
                      }}
                    />
                    {errors?.bodega_origen_id && (
                      <p className="text-red-500 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.bodega_origen_id}
                      </p>
                    )}
                  </div>

                  {/* Bodega Destino */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Building2 className="w-4 h-4 mr-1 text-green-500" />
                      Bodega de Destino *
                    </label>
                    <Select
                      value={bodegaDestino}
                      onChange={(selected) => {
                        setBodegaDestino(selected);
                        setFormData(prev => ({ 
                          ...prev, 
                          bodega_destino_id: selected?.value || '' 
                        }));
                      }}
                      options={bodegasAll
                        .filter(bodega => bodega.id !== bodegaOrigen?.value)
                        .map(bodega => ({
                          value: bodega.id,
                          label: bodega.nombre
                        }))}
                      placeholder="Seleccionar bodega destino..."
                      isClearable
                      isSearchable
                      isDisabled={!bodegaOrigen}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: '42px',
                          border: errors?.bodega_destino_id ? '2px solid #ef4444' : '1px solid #d1d5db',
                          borderRadius: '8px',
                          '&:hover': { borderColor: '#6366f1' },
                          boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none'
                        })
                      }}
                    />
                    {errors?.bodega_destino_id && (
                      <p className="text-red-500 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.bodega_destino_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Observaciones */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Package className="w-4 h-4 mr-1 text-orange-500" />
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      observaciones: e.target.value 
                    }))}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Notas adicionales sobre el traslado..."
                  />
                  {errors?.observaciones && (
                    <p className="text-red-500 text-sm">{errors.observaciones}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Agregar Productos */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="flex items-center text-lg font-semibold text-gray-900">
                  <Package className="w-5 h-5 mr-2 text-indigo-500" />
                  Agregar Productos
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  
                  {/* Seleccionar Producto */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Seleccionar Producto *</label>
                    <Select
                      value={selectedProduct}
                      onChange={(selected) => {
                        setSelectedProduct(selected);
                        if (selected && bodegaOrigen) {
                          fetchDirectStock(selected.value);
                        } else {
                          setStockInfo(null);
                        }
                        setErrors(prev => ({ ...prev, producto: '' }));
                      }}
                      options={products.map(product => ({
                        value: product.id,
                        label: `${product.code || 'Sin código'} - ${product.name}`
                      }))}
                      isLoading={isLoading || isFetching}
                      isClearable
                      isDisabled={!bodegaOrigen}
                      placeholder="Buscar producto..."
                      noOptionsMessage={() => isLoading ? "Cargando..." : "No hay productos"}
                      onInputChange={(inputValue) => setSearch(inputValue)}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '42px',
                          border: errors?.producto ? '1px solid #ef4444' : '1px solid #d1d5db',
                          borderRadius: '8px'
                        })
                      }}
                    />
                    {errors?.producto && (
                      <p className="text-red-500 text-sm">{errors.producto}</p>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Cantidad *</label>
                    <input
                      type="number"
                      step="0.01" // ✅ Permite decimales con paso de 0.01
                      min="0.01" // ✅ Mínimo 0.01
                      value={cantidad}
                      onChange={(e) => {
                        setCantidad(e.target.value);
                        setErrors(prev => ({ ...prev, cantidad: '' }));
                      }}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        errors?.cantidad ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00" // ✅ Placeholder decimal
                      disabled={!selectedProduct}
                    />
                    {errors?.cantidad && (
                      <p className="text-red-500 text-sm">{errors.cantidad}</p>
                    )}
                  </div>
                </div>

                {/* Info de Stock */}
                {stockInfo && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">Stock disponible:</span>
                      <span className="font-semibold text-blue-900">{stockInfo.stock_total} unidades</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={agregarProducto}
                  disabled={!selectedProduct || !cantidad || !bodegaOrigen}
                  className="w-full md:w-auto inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar al Traslado
                </button>
              </div>
            </div>

            {/* Lista de Productos */}
            {formData.detalles.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Productos a Trasladar</h3>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Producto
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                            Stock Disponible
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                            Cantidad
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-16">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.detalles.map((detalle, index) => (
                          <tr key={detalle.producto_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{detalle.producto_nombre}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-gray-600">{detalle.stock_disponible}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                step="0.01" // ✅ Permite decimales
                                min="0.01" // ✅ Mínimo decimal
                                max={detalle.stock_disponible}
                                value={detalle.cantidad}
                                onChange={(e) => actualizarCantidad(detalle.producto_id, e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removerProducto(detalle.producto_id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Envío */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || formData.detalles.length === 0 || !bodegaOrigen || !bodegaDestino}
                className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <Send className="w-5 h-5 mr-2" />
                {loading ? 'Procesando...' : 'Crear Traslado'}
              </button>
            </div>
          </form>
        </div>

        {/* Panel de Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resumen del Traslado</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información de Bodegas */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Origen:</label>
                  <p className="text-gray-900 font-medium">
                    {bodegaOrigen?.label || 'No seleccionada'}
                  </p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Destino:</label>
                  <p className="text-gray-900 font-medium">
                    {bodegaDestino?.label || 'No seleccionada'}
                  </p>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total productos:</span>
                  <span className="font-medium text-indigo-600">{formData.detalles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cantidad total:</span>
                  <span className="font-medium text-green-600">{cantidadTotal.toFixed(2)} unidades</span> {/* ✅ Mostrar con 2 decimales */}
                </div>
              </div>

              {/* Estado del Formulario */}
              <div className="pt-4 border-t border-gray-200">
                {formData.detalles.length > 0 && bodegaOrigen && bodegaDestino ? (
                  <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium">Listo para crear traslado</span>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <span className="text-sm">Completa la información para continuar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}