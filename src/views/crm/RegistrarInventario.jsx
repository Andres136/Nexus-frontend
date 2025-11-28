import  { useState } from 'react';
import { FiUpload, FiPackage, FiDownload, FiLoader } from 'react-icons/fi';
import { BsFileEarmarkExcel, BsCloudUpload } from 'react-icons/bs';
import { productsApi } from "../../services/api";
import Swal from 'sweetalert2';
import { useEmpresas } from '../../hooks/useEmpresas';
import { useSedes } from '../../hooks/useSedes';

export default function RegistrarInventario() {
  const [loading, setLoading] = useState(false);
  const { empresas } = useEmpresas();
  const { bodegas } = useSedes();
  const [errores, setErrores] = useState({});

  // Estados para carga de Excel
  const [excelData, setExcelData] = useState({
    empresa_id: '',
    bodega_id: '',
    file: null
  });

  const [resultadoImport, setResultadoImport] = useState(null);

  const handleExcelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultadoImport(null);
    
    try {
      const formDataExcel = new FormData();
      formDataExcel.append('file', excelData.file);
      formDataExcel.append('empresa_id', excelData.empresa_id);
      formDataExcel.append('bodega_id', excelData.bodega_id);

      const response = await productsApi.registrarEntradaMasiva(formDataExcel);
     
      if (response.data.success) {
        setResultadoImport(response.data.data);
        Swal.fire({
          title: 'Importación Completada',
          html: `
            <div class="text-left">
              <p><strong>Procesados:</strong> ${response.data.data.resumen.total_procesado}</p>
              <p><strong>Creados:</strong> ${response.data.data.resumen.creados}</p>
              <p><strong>Actualizados:</strong> ${response.data.data.resumen.actualizados}</p>
              <p><strong>Errores:</strong> ${response.data.data.resumen.errores}</p>
            </div>
          `,
          icon: 'success'
        });
        
        // Limpiar formulario
        setExcelData({
          empresa_id: '',
          bodega_id: '',
          file: null
        });
        setErrores({});
        // Limpiar el input file
        document.getElementById('excel-upload').value = '';
      }
    } catch (error) {
      console.error('Error:', error);
   //Error por inputs vacíos
      if (error.response && error.response.status === 422) {
        const errores = error.response.data.errors;
       // console.log('Errores de validación:', errores);
        setErrores(errores);
      }
    } finally {
      setLoading(false);
    }
  };
const handleDescuentoExcel = async (e) => {
  e.preventDefault();
  setLoading(true);
  setResultadoImport(null);

  try {
    const formDataExcel = new FormData();
    formDataExcel.append('file', excelData.file);
    formDataExcel.append('empresa_id', excelData.empresa_id);
    formDataExcel.append('bodega_id', excelData.bodega_id);

    const response = await productsApi.registrtarDescuentoMasivoExcel(formDataExcel);
 console.log(response);
    if (response.data.success) {
      Swal.fire({
        title: 'Descuento completado',
        html: `
          <div class="text-left">
            <p><strong>Total descontado:</strong> ${response.data.resumen.total_descontado}</p>
            <p><strong>Productos procesados:</strong> ${response.data.resumen.total_lineas}</p>
            <p><strong>Errores:</strong> ${response.data.resumen.errores}</p>
          </div>
        `,
        icon: 'success'
      });

      setResultadoImport(response.data);
      setExcelData({
        empresa_id: '',
        bodega_id: '',
        file: null
      });

      document.getElementById('excel-upload').value = '';
    }

  } catch (error) {
    console.error('Error:', error);
    if (error.response?.status === 422) {
      setErrores(error.response.data.errors);
    }
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

    } catch (error) {
      console.error("Error al descargar la plantilla", error);
    }
  };



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
                  <p className="text-2xl font-bold text-blue-900">{empresas.length}</p>
                </div>
                <FiPackage className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 text-sm font-medium">Bodegas Activas</p>
                  <p className="text-2xl font-bold text-green-900">{bodegas.length}</p>
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
                    onChange={(e) => setExcelData({...excelData, empresa_id: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                               >
                    <option value="">Seleccionar empresa</option>
                    {empresas.map(empresa => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.empresa_id && (
                    <div className="text-red-600 text-sm mt-1">{errores.empresa_id[0]}</div>
                  )}
                </div>

                {/* Bodega */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Bodega *
                  </label>
                  <select
                    value={excelData.bodega_id}
                    onChange={(e) => setExcelData({...excelData, bodega_id: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
             
                  >
                    <option value="">Seleccionar bodega</option>
                    {bodegas.map(bodega => (
                      <option key={bodega.id} value={bodega.id}>
                        {bodega.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.bodega_id && (
                    <div className="text-red-600 text-sm mt-1">{errores.bodega_id[0]}</div>
                  )}
                </div>
              </div>

              {/* Upload File */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Archivo Excel *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setExcelData({...excelData, file: e.target.files[0]})}
                    className="hidden"
                    id="excel-upload"
                  
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <BsCloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 font-medium mb-2">
                      {excelData.file ? excelData.file.name : 'Click para seleccionar archivo Excel'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Formatos: .xlsx, .xls, .csv (máx. 10MB)
                    </p>
                  </label>
                </div>
                {errores.file && (
                  <div className="text-red-600 text-sm mt-1">{errores.file[0]}</div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? <FiLoader className="animate-spin w-5 h-5" /> : <FiUpload className="w-5 h-5" />}
                  {loading ? 'Procesando archivo...' : 'Importar Inventario'}
                </button>

                <button
  type="button"
  onClick={handleDescuentoExcel}
  disabled={loading}
  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 mr-4"
>
  {loading ? <FiLoader className="animate-spin w-5 h-5" /> : <FiUpload className="w-5 h-5" />}
  Descontar Stock por Excel
</button>

              </div>
            </form>

            {/* Resultado de importación */}
            {resultadoImport && (
              <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiPackage className="w-6 h-6 mr-3 text-green-600" />
                  Resultado de la Importación
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {resultadoImport.resumen.total_procesado}
                    </div>
                    <div className="text-sm font-medium text-blue-800">Procesados</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {resultadoImport.resumen.creados}
                    </div>
                    <div className="text-sm font-medium text-green-800">Creados</div>
                  </div>
                  <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {resultadoImport.resumen.actualizados}
                    </div>
                    <div className="text-sm font-medium text-yellow-800">Actualizados</div>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {resultadoImport.resumen.errores}
                    </div>
                    <div className="text-sm font-medium text-red-800">Errores</div>
                  </div>
                </div>
{resultadoImport.movimiento_pdf_url && (
  <div className="mt-6 flex justify-center">
    <a
      href={resultadoImport.movimiento_pdf_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
    >
      <FiDownload className="w-5 h-5" />
      Descargar PDF del Movimiento
    </a>
  </div>
)}
{resultadoImport.pdf_url && (
  <div className="mt-6 flex justify-center">
    <a
      href={resultadoImport.pdf_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700
                 text-white font-semibold rounded-lg shadow-md transition-all duration-200
                 transform hover:scale-105"
    >
      <FiDownload className="w-5 h-5" />
      Descargar PDF de Descuento
    </a>
  </div>
)}


                {resultadoImport.errores && resultadoImport.errores.length > 0 && (
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