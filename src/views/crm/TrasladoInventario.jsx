import { useState,  useEffect } from "react";

import DetalleTraslado from "../../components/crm/DetalleTraslado";
import { Package, Send, Plus, Building2, FileText, MapPin, Download } from "lucide-react";
import {useEmpresas} from"../../hooks/useEmpresas";
import { useTrasladoInventario } from "../../hooks/useTrasladoInventario";
import { inventariosApi } from "../../services/api";
import Select  from "react-select";

export default function TrasladoInventario() {
  const [sedes, setSedes] = useState([]);

  

  const cargarSedes = async () => {
    try {
      const response = await inventariosApi.sedesTraslados();
 console.log('Sedes cargadas:', response.data);
      setSedes(response.data);
    } catch (error) {
      console.error('Error al cargar sedes:', error);
    }
  };

  useEffect(() => {
    cargarSedes();
   ;
  }, []);

  const {empresas} = useEmpresas();
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

  // ✅ Formatear opciones para react-select
  const sedesOptions = sedes?.map((sede) => ({
    value: sede.id,
    label: sede.nombre
  })) || [];

  // ✅ Encontrar la opción seleccionada
  const selectedSede = sedesOptions.find(option => option.value == formData.sede_destino_id) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-2 sm:p-4 md:p-3 lg:p-6">
      <div className="grid grid-cols-1">
    
      <div className="max-w-7xl mx-auto">
        {/* ✨ Header responsive */}
   <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 mb-4 sm:mb-6 text-white shadow-lg">
  <div className="flex flex-col sm:flex-row md:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
    <div className="p-1.5 bg-white bg-opacity-20 rounded-lg">
      <Package className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6" />
    </div>
    <div>
      <h1 className="text-lg sm:text-2xl md:text-xl lg:text-2xl font-bold">Traslado de Inventario</h1>
      <p className="text-blue-100 text-xs sm:text-sm md:text-sm lg:text-base">
        Gestiona el movimiento de productos entre sedes
      </p>
    </div>
  </div>
</div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* ✨ Información General responsive */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md border border-gray-100">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Información General</h2>
            </div>
            
            {/* ✨ Grid responsive - 1 col en móvil, 2 en tablet, 3 en desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* ✅ Sede Destino CORREGIDA */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-gray-700">
                  <MapPin className="w-3 h-3 text-green-500" />
                  <span>Sede Destino</span>
                </label>
                <Select
                  value={selectedSede}
                  onChange={(selectedOption) => {
                    updateFormField('sede_destino_id', selectedOption ? selectedOption.value : '');
                  }}
                  options={sedesOptions}
                  placeholder="Selecciona una sede..."
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No hay sedes disponibles"}
                  className={`text-xs sm:text-sm ${errors?.sede_destino_id ? 'border-red-500' : ''}`}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '32px',
                      height: '32px',
                      fontSize: '12px',
                      border: errors?.sede_destino_id ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      '&:hover': {
                        borderColor: '#3b82f6'
                      },
                      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none'
                    }),
                    valueContainer: (provided) => ({
                      ...provided,
                      height: '30px',
                      padding: '0 6px'
                    }),
                    input: (provided) => ({
                      ...provided,
                      margin: '0px'
                    }),
                    indicatorsContainer: (provided) => ({
                      ...provided,
                      height: '30px'
                    })
                  }}
                />
                {errors?.sede_destino_id && (
                  <p className="text-red-500 text-xs sm:text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.sede_destino_id}</span>
                  </p>
                )}
                    <Select
  value={sedesOptions.find(o => o.value == formData.sede_origen_id) || null}
  onChange={(opt) =>
    updateFormField('sede_origen_id', opt ? opt.value : '')
  }
  options={sedesOptions}
  placeholder="Sede origen"
  isClearable
/>
              </div>




              {/* Empresa - Full width en móvil y tablet */}
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-gray-700">
                  <Building2 className="w-3 h-3 text-purple-500" />
                  <span>Empresa</span>
                </label>
                <select
                  value={formData.empresa_id}
                  onChange={(e) => updateFormField('empresa_id', e.target.value)}
                  className={`w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md sm:rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm ${errors?.empresa_id ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecciona una empresa</option>
                  {empresas?.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
                {errors?.empresa_id && (
                  <p className="text-red-500 text-xs sm:text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errors.empresa_id}</span>
                  </p>
                )}
              </div>
            </div>

            {/* ✨ Notas responsive */}
            <div className="mt-3 sm:mt-4 space-y-1">
              <label className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-gray-700">
                <FileText className="w-3 h-3 text-orange-500" />
                <span>Notas</span>
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => updateFormField('notas', e.target.value)}
                placeholder="Observaciones del traslado..."
                className={`w-full px-2 sm:px-3 py-2 border border-gray-200 rounded-md sm:rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-xs sm:text-sm ${errors?.notas ? 'border-red-500' : ''}`}
                rows="2"
              />
              {errors?.notas && (
                <p className="text-red-500 text-xs sm:text-sm flex items-center space-x-1">
                  <span>•</span>
                  <span>{errors.notas}</span>
                </p>
              )}
            </div>
          </div>

          {/* ...resto del código sin cambios... */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 mb-3 sm:mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Productos</h2>
                <span className="bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-1 rounded-full">
                  {formData.detalles.length} {formData.detalles.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>
              
              <button
                type="button"
                onClick={addDetalle}
                className="w-full sm:w-auto flex items-center justify-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-md sm:rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Agregar</span>
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {formData.detalles.map((detalle, i) => (
                <div key={i} className="relative border border-gray-200 rounded-md sm:rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <div className="absolute -left-1 -top-1 z-10">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                      {i + 1}
                    </div>
                  </div>
                  
                  <div className="pl-4 sm:pl-6 pr-2 py-2">
                    <DetalleTraslado
                      detalle={detalle}
                      index={i}
                      sedeOrigenId={formData.sede_origen_id}
                      empresaId={formData.empresa_id}
                      handleChange={handleChange}
                      handleBodegaChange={handleBodegaChange}
                      addBodega={addBodega}
                      errores={errors}
                      onRemove={removeDetalle}
                      canRemove={formData.detalles.length > 1}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-indigo-200">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Resumen</span>
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-indigo-600">{formData.detalles.length}</div>
                <div className="text-xs text-gray-600">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  {formData.detalles.reduce((sum, d) => 
                    sum + d.bodegas.reduce((bSum, b) => bSum + (parseFloat(b.cantidad) || 0), 0), 0
                  ).toFixed(0)}
                </div>
                <div className="text-xs text-gray-600">Unidades</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-purple-600">
                  {new Set(formData.detalles.flatMap(d => d.bodegas.map(b => b.bodega_id).filter(Boolean))).size}
                </div>
                <div className="text-xs text-gray-600">Bodegas</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-orange-600">
                  {formData.empresa_id && formData.sede_destino_id ? '✓' : '○'}
                </div>
                <div className="text-xs text-gray-600">Estado</div>
              </div>
            </div>
          </div>
{/* ✨ Botón de envío para descargar PDF */}
          <div className="mt-4">
       {urlPDF && (
          <a
            href={urlPDF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-md sm:rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm mb-4"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Descargar PDF del Traslado</span>
          </a>
        )}
          </div>

          <div className="flex justify-center pb-2 sm:pb-4">
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Enviar Traslado</span>
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}