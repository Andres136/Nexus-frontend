import  { useEffect, useState } from "react";
import { useCreateProduct } from "../../hooks/productos/useCreateProduct";
import {

  Package,
  Tag,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Layers,
  Hash,
  FileText,
  Grid3X3,
  ChevronDown,
  Search,
  Edit3,

} from "lucide-react";
import { productsApi } from "../../services/api";

export default function CrearProductos() {
  const {
    categorias,
    fetchCategorias,
    createProduct,
    createCategoria,
    loading,
    errors,
    editCategoria
  } = useCreateProduct();

  const [activeTab, setActiveTab] = useState("producto");
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProducto, setCreatedProducto] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchCategoria, setSearchCategoria] = useState("");
  const [excelFile, setExcelFile] = useState(null);
const [importing, setImporting] = useState(false);


  
  // Form producto
  const [productForm, setProductForm] = useState({
    name: "",
    code: "",
    categoria_id: "",
    description: "",
  });

  // Form categoría
  const [categoriaForm, setCategoriaForm] = useState({
    nombre: "",
    descripcion: "",
  });

  const [editandoCategoria, setEditandoCategoria] = useState(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

const filteredCategorias =
  categorias?.filter(
    (cat) =>
      cat?.nombre &&
      cat.nombre.toLowerCase().includes(searchCategoria.toLowerCase())
  ) || [];


  // ✅ Handlers
  const iniciarEdicionCategoria = (categoria) => {
    setEditandoCategoria(categoria.id);
    setCategoriaForm({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? "",
    });
  };

  const cancelarEdicion = () => {
    setCategoriaForm({ nombre: "", descripcion: "" });
    setEditandoCategoria(null);
  };

  const handleProductChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoriaChange = (e) => {
    setCategoriaForm({
      ...categoriaForm,
      [e.target.name]: e.target.value,
    });
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    const success = await createProduct(productForm);
  // console.log("Éxito al crear producto:", success.message);
    if (success) {
      setCreatedProducto(success);
      setProductForm({ name: "", code: "", categoria_id: "", description: "" });
     setSuccessMessage(
      `Producto creado exitosamente · Código: ${success.code}`
    );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const submitCategoria = async (e) => {
    e.preventDefault();

    let success;
    if (editandoCategoria) {
      success = await editCategoria(editandoCategoria, categoriaForm);
      if (success) {
        setSuccessMessage("Categoría actualizada exitosamente");
      }
    } else {
      success = await createCategoria(categoriaForm);
      if (success) {
        setSuccessMessage("Categoría creada exitosamente");
      }
    }

    if (success) {
      setCategoriaForm({ nombre: "", descripcion: "" });
      setEditandoCategoria(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // ✅ Actualizar lista de categorías sin recargar toda la UI
      await fetchCategorias();
    }
  };

  const resetForms = () => {
    setProductForm({ name: "", code: "", categoria_id: "", description: "" });
    setCategoriaForm({ nombre: "", descripcion: "" });
    setEditandoCategoria(null);
    setSearchCategoria("");
  };
//Funcio para crear productos via excel

const crearProductosDesdeExcel = async () => {
  if (!excelFile || !productForm.categoria_id) {
    alert("Debes seleccionar categoría y archivo");
    return;
  }

  const formData = new FormData();
  formData.append("file", excelFile);
  formData.append("categoria_id", productForm.categoria_id);

  try {
    const response = await productsApi.createProductsExcel(formData);

    // Descargar Excel de respuesta
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resultado_importacion.xlsx";
    a.click();

    setSuccessMessage("Productos importados correctamente");
    // Limpiar formulario y estado
    setExcelFile(null);
  
    setShowSuccess(true);
  } catch (error) {
    // 👇 CLAVE: leer el error cuando viene como Blob
    if (error.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      const json = JSON.parse(text);
      console.error("Errores backend:", json);
      alert(json.message);
    } else {
      console.error(error);
    }
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      
      {/* ✅ Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Gestión de Productos
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Crear y editar productos y categorías del sistema
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Notificación de éxito flotante */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-2 text-green-600 hover:text-green-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ✅ Layout en dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ===== COLUMNA IZQUIERDA: FORMULARIOS ===== */}
          <div className="space-y-6">
            
            {/* Tabs de navegación */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("producto")}
                  className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
                    activeTab === "producto"
                      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Package className="w-5 h-5" />
                    <span>Crear Producto</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab("categoria")}
                  className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
                    activeTab === "categoria"
                      ? "bg-purple-50 text-purple-700 border-b-2 border-purple-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Layers className="w-5 h-5" />
                    <span>{editandoCategoria ? "Editar" : "Crear"} Categoría</span>
                  </div>
                </button>
              </div>

              <div className="p-6">
                
                {/* ===== FORMULARIO PRODUCTO ===== */}
                {activeTab === "producto" && (


                 <div className="space-y-6" >
                  
    {/* ✅ MENSAJE INFORMATIVO PARA PRODUCTOS POR SEDE */}
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            Importante - Productos por Sede
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              Para crear productos específicos de cada sede (inventarios por ubicación), 
              debe utilizar la <strong>importación por Excel</strong> seleccionando primero 
              la categoría correspondiente.
            </p>
          </div>
        </div>
      </div>
    </div>
                
                  <form onSubmit={submitProduct} className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Nuevo Producto</h3>
                    </div>

                    {/* Nombre del producto */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductChange}
                        placeholder="Ej: Bolsa plástica biodegradable"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors?.createProduct?.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {/* ✅ Error del backend */}
                      {errors?.createProduct?.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.createProduct.name[0]}
                        </p>
                      )}
                    </div>


                   <div>
                     <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                       <FileText className="w-4 h-4 text-blue-600" />
                       Descripción del Producto *
                     </label>
                     <textarea
                       name="description"
                       value={productForm.description}
                       onChange={handleProductChange}
                       placeholder="Ej: Descripción del producto"
                       className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                         errors?.createProduct?.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
                       }`}
                     />
                     {/* ✅ Error del backend */}
                     {errors?.createProduct?.description && (
                       <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                         <AlertCircle className="w-4 h-4" />
                         {errors.createProduct.description[0]}
                       </p>
                     )}
                   </div>

                    {/* Código del producto */}
           {createdProducto?.code && (
  <div className="mt-2 p-3 bg-green-50 border border-green-300 rounded-lg">
    <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
      <Hash className="w-4 h-4" />
      Código generado: {createdProducto.code}
    </p>
  </div>
)}


                    {/* Selector de categoría */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        Categoría *
                      </label>
                      
                      <div className="relative">
                        <select
                          name="categoria_id"
                          value={productForm.categoria_id}
                          onChange={handleProductChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors ${
                            errors?.createProduct?.categoria_id ? 'border-red-400 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Seleccionar categoría</option>
                          {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.nombre}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </div>
                      
                      {/* ✅ Error del backend */}
                      {errors?.createProduct?.categoria_id && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.createProduct.categoria_id[0]}
                        </p>
                      )}
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Crear Producto
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={resetForms}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Limpiar
                      </button>
                    </div>
              {/* Input para subir archivo Excel */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subir archivo Excel *
                </label>
     <input
  type="file"
  accept=".xlsx,.xls"
  onChange={(e) => setExcelFile(e.target.files[0])}
  className="border border-gray-300 rounded-lg p-2 w-full"
/>

                {/* ✅ Error del backend */}
                {errors?.createProduct?.file && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.createProduct.file[0]}
                  </p>
                )}

                <button
  type="button"
  disabled={!excelFile || !productForm.categoria_id || importing}
  onClick={async () => {
    try {
      setImporting(true);
      await crearProductosDesdeExcel(excelFile, productForm.categoria_id);
      setSuccessMessage("Productos importados correctamente");
      setShowSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  }}
  className="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
>
  {importing ? "Importando..." : "Importar productos desde Excel"}
</button>

              </div>

                  </form>
                   </div>
                )}

                {/* ===== FORMULARIO CATEGORÍA ===== */}
                {activeTab === "categoria" && (
                  <form onSubmit={submitCategoria} className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editandoCategoria ? "Editar Categoría" : "Nueva Categoría"}
                      </h3>
                    </div>

                    {/* Nombre de la categoría */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4 text-purple-600" />
                        Nombre de la Categoría *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={categoriaForm.nombre}
                        onChange={handleCategoriaChange}
                        placeholder="Ej: Empaques Biodegradables"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                          errors?.createCategoria?.nombre || errors?.editCategoria?.nombre ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {/* ✅ Errores del backend para create o edit */}
                      {errors?.createCategoria?.nombre && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.createCategoria.nombre[0]}
                        </p>
                      )}
                      {errors?.editCategoria?.nombre && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.editCategoria.nombre[0]}
                        </p>
                      )}
                    </div>

                    {/* Descripción de la categoría */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        value={categoriaForm.descripcion}
                        onChange={handleCategoriaChange}
                        placeholder="Descripción opcional de la categoría..."
                        rows="3"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none ${
                          errors?.createCategoria?.descripcion || errors?.editCategoria?.descripcion ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {/* ✅ Errores del backend */}
                      {errors?.createCategoria?.descripcion && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.createCategoria.descripcion[0]}
                        </p>
                      )}
                      {errors?.editCategoria?.descripcion && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.editCategoria.descripcion[0]}
                        </p>
                      )}
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {editandoCategoria ? "Actualizando..." : "Creando..."}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {editandoCategoria ? "Actualizar Categoría" : "Crear Categoría"}
                          </>
                        )}
                      </button>
                      
                      {editandoCategoria ? (
                        <button
                          type="button"
                          onClick={cancelarEdicion}
                          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancelar Edición
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={resetForms}
                          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Limpiar
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ===== COLUMNA DERECHA: LISTA DE CATEGORÍAS ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Categorías Existentes</h3>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {categorias.length}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Búsqueda de categorías */}
              {categorias.length > 5 && (
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar categoría..."
                    value={searchCategoria}
                    onChange={(e) => setSearchCategoria(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              )}

              {/* Lista de categorías */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredCategorias.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchCategoria 
                        ? "No se encontraron categorías" 
                        : "No hay categorías creadas"
                      }
                    </p>
                  </div>
                ) : (
                  filteredCategorias.map((categoria) => (
                    <div
                      key={categoria.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        editandoCategoria === categoria.id
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{categoria.nombre}</h4>
                          {categoria.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">{categoria.descripcion}</p>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => iniciarEdicionCategoria(categoria)}
                          disabled={loading}
                          className={`ml-3 p-2 rounded-lg transition-colors ${
                            editandoCategoria === categoria.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                          title={editandoCategoria === categoria.id ? "Editando..." : "Editar categoría"}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Información adicional */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Grid3X3 className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Información del Sistema</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p>• Los códigos de productos deben ser únicos</p>
              <p>• Utiliza nombres descriptivos para facilitar búsquedas</p>
            </div>
            <div>
              <p>• Las categorías se pueden editar después de crearlas</p>
              <p>• Los campos marcados con (*) son obligatorios</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}