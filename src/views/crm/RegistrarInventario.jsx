import  { useState } from 'react'; // ✅ Agregar React
import { FiUpload, FiPackage, FiDownload, FiLoader } from 'react-icons/fi';
import { BsFileEarmarkExcel, BsCloudUpload } from 'react-icons/bs';
import { productsApi } from "../../services/api";
import Swal from 'sweetalert2';
import { useEmpresas } from '../../hooks/useEmpresas';
import { useSedes } from '../../hooks/useSedes';

export default function RegistrarInventario() {
  const [loading, setLoading] = useState(false);
  const { empresas, loading: loadingEmpresas } = useEmpresas(); // ✅ Agregar loading
  const { bodegas, loading: loadingBodegas } = useSedes(); // ✅ Agregar loading
  const [errores, setErrores] = useState({});

  // Estados para carga de Excel
  const [excelData, setExcelData] = useState({
    empresa_id: '',
    bodega_id: '',
    file: null
  });

  const [resultadoImport, setResultadoImport] = useState(null);

  // ✅ Función de validación mejorada
  const validarFormulario = () => {
    const erroresLocal = {};
    
    if (!excelData.empresa_id) {
      erroresLocal.empresa_id = ['La empresa es obligatoria'];
    }
    
    if (!excelData.bodega_id) {
      erroresLocal.bodega_id = ['La bodega es obligatoria'];
    }
    
    if (!excelData.file) {
      erroresLocal.file = ['El archivo es obligatorio'];
    }
    
    setErrores(erroresLocal);
    return Object.keys(erroresLocal).length === 0;
  };

  const handleExcelSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validar antes de enviar
    if (!validarFormulario()) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Debes completar todos los campos obligatorios',
      });
      return;
    }

    setLoading(true);
    setResultadoImport(null);
    setErrores({}); // ✅ Limpiar errores anteriores

    try {
      const formDataExcel = new FormData();
      formDataExcel.append('file', excelData.file);
      formDataExcel.append('empresa_id', String(excelData.empresa_id)); // ✅ Convertir a string
      formDataExcel.append('bodega_id', String(excelData.bodega_id)); // ✅ Convertir a string

      console.log('Enviando datos:', { // ✅ Debug
        empresa_id: excelData.empresa_id,
        bodega_id: excelData.bodega_id,
        file: excelData.file?.name
      });

      const response = await productsApi.registrarEntradaMasiva(formDataExcel);
     
      if (response.data.success) {
        setResultadoImport(response.data.data);
        
        Swal.fire({
          title: 'Importación Completada',
          html: `
            <div class="text-left">
              <p><strong>Procesados:</strong> ${response.data.data.resumen?.total_procesado || 0}</p>
              <p><strong>Creados:</strong> ${response.data.data.resumen?.creados || 0}</p>
              <p><strong>Actualizados:</strong> ${response.data.data.resumen?.actualizados || 0}</p>
              <p><strong>Errores:</strong> ${response.data.data.resumen?.errores || 0}</p>
            </div>
          `,
          icon: 'success'
        });
        
        // ✅ Limpiar formulario después del éxito
        setExcelData({
          empresa_id: '',
          bodega_id: '',
          file: null
        });
        
        // Limpiar el input file
        const fileInput = document.getElementById('excel-upload');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error completo:', error); // ✅ Debug mejorado
      
      if (error.response?.status === 422) {
        const erroresServidor = error.response.data.errors || {};
        setErrores(erroresServidor);
        
        Swal.fire({
          icon: 'error',
          title: 'Errores de validación',
          text: 'Por favor revisa los campos marcados en rojo',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error en la importación',
          text: error.response?.data?.message || 'Ha ocurrido un error inesperado',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDescuentoExcel = async (e) => {
    e.preventDefault();
    
    // ✅ Validar antes de enviar
    if (!validarFormulario()) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Debes completar todos los campos obligatorios',
      });
      return;
    }

    setLoading(true);
    setResultadoImport(null);
    setErrores({});

    try {
      const formDataExcel = new FormData();
      formDataExcel.append('file', excelData.file);
      formDataExcel.append('empresa_id', String(excelData.empresa_id));
      formDataExcel.append('bodega_id', String(excelData.bodega_id));

      const response = await productsApi.registrtarDescuentoMasivoExcel(formDataExcel);
      
      if (response.data.success) {
        Swal.fire({
          title: 'Descuento completado',
          html: `
            <div class="text-left">
              <p><strong>Total descontado:</strong> ${response.data.resumen?.total_descontado || 0}</p>
              <p><strong>Productos procesados:</strong> ${response.data.resumen?.total_lineas || 0}</p>
              <p><strong>Errores:</strong> ${response.data.resumen?.errores || 0}</p>
            </div>
          `,
          icon: 'success'
        });

        setResultadoImport(response.data);
        
        // Limpiar formulario
        setExcelData({
          empresa_id: '',
          bodega_id: '',
          file: null
        });

        const fileInput = document.getElementById('excel-upload');
        if (fileInput) fileInput.value = '';
      }

    } catch (error) {
      console.error('Error en descuento:', error);
      
      if (error.response?.status === 422) {
        setErrores(error.response.data.errors || {});
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error en el descuento',
        text: error.response?.data?.message || 'Ha ocurrido un error inesperado',
      });
    } finally {
      setLoading(false);
    }
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
      window.URL.revokeObjectURL(url); // ✅ Limpiar memoria

    } catch (error) {
      console.error("Error al descargar la plantilla", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar la plantilla',
      });
    }
  };

  // ✅ Loading inicial
  if (loadingEmpresas || loadingBodegas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin w-8 h-8 text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header mejorado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiPackage className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Importar Inventario</h1>
                <p className="text-gray-600 mt-1">Carga masiva de inventario mediante Excel</p>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BsFileEarmarkExcel className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 text-sm font-medium">Empresas Disponibles</p>
                  <p className="text-2xl font-bold text-blue-900">{empresas?.length || 0}</p>
                </div>
                <FiPackage className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 text-sm font-medium">Bodegas Activas</p>
                  <p className="text-2xl font-bold text-green-900">{bodegas?.length || 0}</p>
                </div>
                <BsFileEarmarkExcel className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-800 text-sm font-medium">Formato</p>
                  <p className="text-2xl font-bold text-purple-900">Excel</p>
                </div>
                <FiUpload className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de carga */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <BsFileEarmarkExcel className="w-5 h-5 text-gray-700" />
              <span>Importación por Excel</span>
            </h2>
          </div>

          <div className="p-8">
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <FiPackage className="w-5 h-5 mr-2" />
                Instrucciones para la carga por Excel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    El archivo debe tener las columnas: <strong>code, stock</strong> (obligatorias)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Columnas opcionales: precio, min_stock, max_stock, fecha_vencimiento
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Los códigos deben existir en la base de datos de productos
                  </li>
                </ul>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Se asignará automáticamente a tu sede
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Formatos soportados: .xlsx, .xls, .csv
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Tamaño máximo: 10MB
                  </li>
                </ul>
              </div>
              <button
                onClick={descargarPlantilla}
                className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FiDownload />
                Descargar plantilla de ejemplo
              </button>
            </div>

            <form onSubmit={handleExcelSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Empresa */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Empresa *
                  </label>
                  <select
                    value={excelData.empresa_id}
                    onChange={(e) => {
                      console.log('Empresa seleccionada:', e.target.value); // ✅ Debug
                      setExcelData({...excelData, empresa_id: e.target.value});
                      // Limpiar error si existe
                      if (errores.empresa_id) {
                        setErrores(prev => {
                          const newErrors = {...prev};
                          delete newErrors.empresa_id;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white ${
                      errores.empresa_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar empresa</option>
                    {empresas?.map(empresa => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.empresa_id && (
                    <div className="text-red-600 text-sm mt-1 flex items-center">
                      <span className="w-4 h-4 text-red-500 mr-1">⚠</span>
                      {Array.isArray(errores.empresa_id) ? errores.empresa_id[0] : errores.empresa_id}
                    </div>
                  )}
                </div>

                {/* Bodega */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Bodega *
                  </label>
                  <select
                    value={excelData.bodega_id}
                    onChange={(e) => {
                      console.log('Bodega seleccionada:', e.target.value); // ✅ Debug
                      setExcelData({...excelData, bodega_id: e.target.value});
                      // Limpiar error si existe
                      if (errores.bodega_id) {
                        setErrores(prev => {
                          const newErrors = {...prev};
                          delete newErrors.bodega_id;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white ${
                      errores.bodega_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar bodega</option>
                    {bodegas?.map(bodega => (
                      <option key={bodega.id} value={bodega.id}>
                        {bodega.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.bodega_id && (
                    <div className="text-red-600 text-sm mt-1 flex items-center">
                      <span className="w-4 h-4 text-red-500 mr-1">⚠</span>
                      {Array.isArray(errores.bodega_id) ? errores.bodega_id[0] : errores.bodega_id}
                    </div>
                  )}
                </div>
              </div>

              {/* Upload File */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Archivo Excel *
                </label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  errores.file 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      console.log('Archivo seleccionado:', e.target.files[0]); // ✅ Debug
                      setExcelData({...excelData, file: e.target.files[0]});
                      // Limpiar error si existe
                      if (errores.file) {
                        setErrores(prev => {
                          const newErrors = {...prev};
                          delete newErrors.file;
                          return newErrors;
                        });
                      }
                    }}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <BsCloudUpload className={`w-16 h-16 mx-auto mb-4 ${
                      errores.file ? 'text-red-400' : 'text-gray-400'
                    }`} />
                    <p className={`text-lg font-medium mb-2 ${
                      errores.file ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {excelData.file ? excelData.file.name : 'Click para seleccionar archivo Excel'}
                    </p>
                    <p className={`text-sm ${
                      errores.file ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      Formatos: .xlsx, .xls, .csv (máx. 10MB)
                    </p>
                  </label>
                </div>
                {errores.file && (
                  <div className="text-red-600 text-sm mt-1 flex items-center">
                    <span className="w-4 h-4 text-red-500 mr-1">⚠</span>
                    {Array.isArray(errores.file) ? errores.file[0] : errores.file}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 gap-4">
                <button
                  type="button"
                  onClick={handleDescuentoExcel}
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? <FiLoader className="animate-spin w-5 h-5" /> : <FiUpload className="w-5 h-5" />}
                  Descontar Stock por Excel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? <FiLoader className="animate-spin w-5 h-5" /> : <FiUpload className="w-5 h-5" />}
                  {loading ? 'Procesando archivo...' : 'Importar Inventario'}
                </button>
              </div>
            </form>

            {/* Resultado de importación */}
            {resultadoImport?.resumen && (
              <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiPackage className="w-6 h-6 mr-3 text-green-600" />
                  Resultado de la Importación
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {resultadoImport?.resumen?.total_procesado || 0}
                    </div>
                    <div className="text-sm font-medium text-blue-800">Procesados</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {resultadoImport?.resumen?.creados || 0}
                    </div>
                    <div className="text-sm font-medium text-green-800">Creados</div>
                  </div>
                  <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {resultadoImport?.resumen?.actualizados || 0}
                    </div>
                    <div className="text-sm font-medium text-yellow-800">Actualizados</div>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {resultadoImport?.resumen?.errores || 0}
                    </div>
                    <div className="text-sm font-medium text-red-800">Errores</div>
                  </div>
                </div>

                {/* PDFs */}
                <div className="flex justify-center gap-4 mb-6">
                  {resultadoImport?.movimiento_pdf_url && (
                    <a
                      href={resultadoImport.movimiento_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <FiDownload className="w-5 h-5" />
                      Descargar PDF del Movimiento
                    </a>
                  )}

                  {resultadoImport?.pdf_url && (
                    <a
                      href={resultadoImport.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <FiDownload className="w-5 h-5" />
                      Descargar PDF de Descuento
                    </a>
                  )}
                </div>

                {/* Errores */}
                {resultadoImport?.errores && resultadoImport.errores.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-900 mb-4 flex items-center">
                      <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
                      Errores encontrados:
                    </h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {resultadoImport.errores.map((error, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="text-sm">
                            <span className="font-semibold text-red-800">Fila {error.fila}:</span>
                            <span className="text-red-700 ml-2">{error.error}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}