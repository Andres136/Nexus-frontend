import { useParams, useNavigate } from "react-router-dom"
import { FiRefreshCw, FiArrowLeft, FiSave, FiX, FiPackage, FiEdit3 } from "react-icons/fi";
import { useEditarProducto } from "../../hooks/productos/useEditarProducto";
import { useCreateProduct } from "../../hooks/productos/useCreateProduct";
import { useEffect } from "react";

export default function ActualizarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    loading,
    saving,
    producto,
    form,
    errors,
    handleChange,
    updateProducto,
  } = useEditarProducto(id);
  
  const { categorias, fetchCategorias } = useCreateProduct();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await updateProducto();
    if (ok) {
      navigate("/auth/crm/reporte-inventarios");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center max-w-md w-full">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando producto</h3>
            <p className="text-gray-600">Por favor espere mientras obtenemos la información...</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar</h3>
          <p className="text-red-600 mb-6">No se pudo cargar la información del producto.</p>
          <button
            onClick={() => navigate("/auth/crm/reporte-inventarios")}
            className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Volver al inventario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* ✅ HEADER MEJORADO */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiEdit3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
              <p className="text-gray-600 mt-1">
                Producto #{producto.id} • <span className="font-medium">{producto.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ✅ FORMULARIO MEJORADO */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Header del formulario */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <FiPackage className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-xl font-semibold text-white">Información del Producto</h2>
                <p className="text-blue-100 text-sm">Complete los campos para actualizar el producto</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* ✅ CAMPOS EN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nombre del Producto *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Ingrese el nombre del producto"
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <FiX className="w-4 h-4" />
                    {errors.name[0]}
                  </div>
                )}
              </div>

              {/* Código */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Código del Producto *
                </label>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-mono ${
                    errors.code 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Ej: PROD-001"
                />
                {errors.code && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <FiX className="w-4 h-4" />
                    {errors.code[0]}
                  </div>
                )}
              </div>

              {/* Categoría */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Categoría *
                </label>
                <select
                  name="categoria_id"
                  value={form.categoria_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                    errors.categoria_id 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoria_id && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <FiX className="w-4 h-4" />
                    {errors.categoria_id[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-lg transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none ${
                  errors.description 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Descripción detallada del producto (opcional)"
              />
              {errors.description && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <FiX className="w-4 h-4" />
                  {errors.description[0]}
                </div>
              )}
            </div>

            {/* ✅ BOTONES MEJORADOS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
              >
                {saving ? (
                  <>
                    <FiRefreshCw className="w-5 h-5 animate-spin" />
                    Guardando cambios...
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    Guardar cambios
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FiX className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* ✅ INFORMACIÓN ADICIONAL */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Información importante</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Los campos marcados con (*) son obligatorios</li>
                <li>• El código debe ser único en el sistema</li>
                <li>• Los cambios se aplicarán inmediatamente tras guardar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}