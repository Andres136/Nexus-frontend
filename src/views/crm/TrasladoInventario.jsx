import { useState, useEffect } from "react";
import DetalleTraslado from "../../components/crm/DetalleTraslado";
import { Package, Send, Plus, Building2, FileText, MapPin, Download, ChevronRight, Home } from "lucide-react";
import { useEmpresas } from "../../hooks/useEmpresas";
import { useTrasladoInventario } from "../../hooks/useTrasladoInventario";
import { inventariosApi } from "../../services/api";
import Select from "react-select";

export default function TrasladoInventario() {
  const [sedes, setSedes] = useState([]);

  // ========= TODA LA LÓGICA ORIGINAL SIN CAMBIOS =========
  const cargarSedes = async () => {
    try {
      const response = await inventariosApi.sedesTraslados();
     // console.log('Sedes cargadas:', response.data);
      setSedes(response.data);
    } catch (error) {
      console.error('Error al cargar sedes:', error);
    }
  };

  useEffect(() => {
    cargarSedes();
  }, []);

  const { empresas } = useEmpresas();
  const {
    formData,
    errors,
    isLoading,
    urlPDF,
    handleChange,
    handleBodegaChange,
    addBodega,
    addDetalle,
    removeDetalle,
    updateFormField,
    handleSubmit,
  } = useTrasladoInventario();

  const sedesOptions = sedes?.map((sede) => ({
    value: sede.id,
    label: sede.nombre
  })) || [];

  const selectedSede = sedesOptions.find(option => option.value == formData.sede_destino_id) || null;
  const selectedSedeOrigen = sedesOptions.find(option => option.value == formData.sede_origen_id) || null;
  // ========= FIN DE LA LÓGICA ORIGINAL =========

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1">

      {/* 🧭 Breadcrumbs
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
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <a href="/inventario" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Inventario
              </a>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <span className="text-sm font-medium text-indigo-600">Traslado de Inventario</span>
            </div>
          </li>
        </ol>
      </nav>*/}

      {/* 🎯 Header */}
      <div className="mb-8 col-span-1">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Traslado de Inventario</h1>
            <p className="text-gray-600">Gestiona el movimiento de productos entre sedes y bodegas</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 📋 Información General */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="flex items-center text-lg font-semibold text-gray-900">
              <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
              Información General
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Sede Origen 
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                  Sede Origen
                </label>
                <Select
                  value={selectedSedeOrigen}
                  onChange={(opt) => updateFormField('sede_origen_id', opt ? opt.value : '')}
                  options={sedesOptions}
                  placeholder="Seleccionar sede origen..."
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay sedes disponibles"}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '42px',
                      border: errors?.sede_origen_id ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      '&:hover': { borderColor: '#6366f1' },
                      boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none'
                    }),
                    option: (provided) => ({
                      ...provided,
                      padding: '8px 12px'
                    })
                  }}
                />
                {errors?.sede_origen_id && (
                  <p className="text-red-500 text-sm">{errors.sede_origen_id}</p>
                )}
              </div>*/}

              {/* Sede Destino */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 mr-1 text-green-500" />
                  Sede Destino
                </label>
                <Select
                  value={selectedSede}
                  onChange={(selectedOption) => {
                    updateFormField('sede_destino_id', selectedOption ? selectedOption.value : '');
                  }}
                  options={sedesOptions.filter(sede => sede.value !== formData.sede_origen_id)}
                  placeholder="Seleccionar sede destino..."
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay sedes disponibles"}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '42px',
                      border: errors?.sede_destino_id ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      '&:hover': { borderColor: '#6366f1' },
                      boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none'
                    }),
                    option: (provided) => ({
                      ...provided,
                      padding: '8px 12px'
                    })
                  }}
                />
                {errors?.sede_destino_id && (
                  <p className="text-red-500 text-sm">{errors.sede_destino_id}</p>
                )}
              </div>

              {/* Empresa */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Building2 className="w-4 h-4 mr-1 text-purple-500" />
                  Empresa
                </label>
                <select
                  value={formData.empresa_id}
                  onChange={(e) => updateFormField('empresa_id', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors?.empresa_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar empresa...</option>
                  {empresas?.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
                {errors?.empresa_id && (
                  <p className="text-red-500 text-sm">{errors.empresa_id}</p>
                )}
              </div>
            </div>

            {/* Notas */}
            <div className="mt-6 space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 mr-1 text-orange-500" />
                Observaciones
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => updateFormField('notas', e.target.value)}
                placeholder="Notas y observaciones del traslado..."
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${
                  errors?.notas ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="3"
              />
              {errors?.notas && (
                <p className="text-red-500 text-sm">{errors.notas}</p>
              )}
            </div>
          </div>
        </div>

        {/* 📦 Detalles de Productos */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      

          <div className="p-6">
            {formData.detalles.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">No hay productos agregados</p>
                <p className="text-gray-400">Haz clic en "Agregar Producto" para comenzar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Orden Compra
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Bodegas
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.detalles.map((detalle, i) => (
                      <DetalleTraslado
                        key={detalle.temp_id || i} // Usar temp_id para clave única
                        detalle={detalle}
                        index={i}
                        sedeOrigenId={formData.sede_origen_id}
                        sedeDestinoId={formData.sede_destino_id}
                        handleChange={handleChange}
                        handleBodegaChange={handleBodegaChange}
                        addBodega={addBodega}
                        errores={errors}
                        onRemove={removeDetalle}
                        canRemove={formData.detalles.length > 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          
            <button
              type="button"
              onClick={addDetalle}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Producto
            </button>
          </div>
        </div>

     

        {/* 📄 PDF Link */}
        {urlPDF && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <a
              href={urlPDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-green-700 font-medium hover:text-green-800 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Descargar PDF del Traslado</span>
            </a>
          </div>
        )}

        {/* 🚀 Botón de Envío */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <Send className="w-5 h-5 mr-2" />
            {isLoading ? 'Procesando...' : 'Crear Traslado'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}