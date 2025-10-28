import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { indicadoresApi } from "../../services/api";
import { toast } from "react-toastify";
import ObtenerIndicadores from "../../components/calidad/ObtenerIndicadores";
import { Link } from "react-router-dom";
// ✅ Agregar iconos para mejor UX
import { 
  ChartBarIcon, 
  PlusIcon, 
  PencilIcon, 
  XMarkIcon,
  DocumentChartBarIcon
} from "@heroicons/react/24/outline";

export default function Indicadores() {
  // ...existing logic (sin cambios)...
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [indicadores, setIndicadores] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    formula: "",
    meta: "",
    frecuencia: "",
    descripcion: "",
    tipo_meta: "",
  });

  const [paginacion, setPaginacion] = useState({
    last_page: 1,
    current_page: 1,
    total: 0,
    per_page: 10,
  }); 

  // ...todas las funciones existentes sin cambios...
  const handleEdit = (indicador) => {
    setEditId(indicador.id);
    setFormData({
      nombre: indicador.nombre,
      formula: indicador.formula,
      meta: indicador.meta,
      frecuencia: indicador.frecuencia,
      descripcion: indicador.descripcion,
      tipo_meta: indicador.tipo_meta
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(s => ({ ...s, [name]: value }));
    if (errors[name]) {
      setErrors(s => ({ ...s, [name]: undefined }));
    }
  };

  const fetchIndicadores = async (depId = "", page = 1) => {
    const res = await indicadoresApi.getIndicadoresDepartamento({ departamento_id: depId, page });
    setIndicadores(res.data.data || []);
    setPaginacion({
      last_page: res.data.last_page,
      current_page: res.data.current_page,
      total: res.data.total,
      per_page: res.data.per_page,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrors({});
      let response;
      if (editId) {
        response = await indicadoresApi.update(editId, formData);
        setIndicadores(prev =>
          prev.map(ind => ind.id === editId ? { ...ind, ...formData } : ind)
        );
        toast.success(response?.data?.message ?? "Indicador actualizado", {
          className: "bg-blue-400 text-white font-bold",
          progressClassName: "bg-blue-300"
        });
        setEditId(null);
      } else {
        response = await indicadoresApi.create(formData);
        toast.success(response?.data?.message ?? "Indicador creado", {
          className: "bg-green-100 text-green-800 border border-green-300 font-medium rounded-md",
          progressClassName: "bg-green-400"
        });
      }
      setFormData({
        nombre: "",
        formula: "",
        meta: "",
        frecuencia: "",
        descripcion: "",
        tipo_meta: ""
      });
      await fetchIndicadores();
    } catch (err) {
      const { response } = err || {};
      if (response?.status === 422 && response.data?.errors) {
        setErrors(response.data.errors);
        toast.error("Revisa los campos del formulario");
      } else if (response?.status === 403) {
        toast.error(response.data?.message ?? "No autorizado");
      } else {
        toast.error("Error al crear el indicador");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({
      nombre: "",
      formula: "",
      meta: "",
      frecuencia: "",
      descripcion: "",
      tipo_meta: "",
    });
    setErrors({});
  };

  const err = (k) => errors?.[k]?.[0];

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-screen-2xl mx-auto">

        {/* ✅ Header mejorado responsivo */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  <span className="hidden sm:inline">Gestión de Indicadores</span>
                  <span className="sm:hidden">Indicadores</span>
                </h1>
              </div>
              <p className="text-green-100 text-sm sm:text-base max-w-2xl">
                <span className="hidden md:inline">
                  Aquí puedes crear, editar y eliminar indicadores para el seguimiento de calidad.
                </span>
                <span className="md:hidden">
                  Crear y gestionar indicadores de calidad.
                </span>
              </p>
            </div>
            
            {/* ✅ Botón de acción principal responsivo */}
            <Link
              to="/auth/crm/registrar-valor-indicador"
              className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-50 transition-colors font-medium shadow-md w-full sm:w-auto justify-center"
            >
              <DocumentChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">
                <span className="hidden lg:inline">Registrar valor para indicador</span>
                <span className="lg:hidden hidden sm:inline">Registrar valores</span>
                <span className="sm:hidden">Valores</span>
              </span>
            </Link>
          </div>
        </div>

        {/* ✅ Grid responsivo mejorado */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
          
          {/* ✅ Formulario responsivo */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 order-2 xl:order-1">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                {editId ? (
                  <PencilIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <PlusIcon className="w-5 h-5 text-green-600" />
                )}
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editId ? "Editar Indicador" : "Nuevo Indicador"}
                </h2>
              </div>
              {editId && (
                <p className="text-sm text-blue-600">
                  Modificando indicador existente
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* ✅ Campos del formulario mejorados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Indicador *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Productividad mensual"
                    className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      err("nombre") ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {err("nombre") && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      {err("nombre")}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="formula" className="block text-sm font-medium text-gray-700 mb-2">
                    Fórmula *
                  </label>
                  <input
                    id="formula"
                    type="text"
                    name="formula"
                    value={formData.formula}
                    onChange={handleChange}
                    placeholder="Ej: (Producido / Programado) * 100"
                    className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      err("formula") ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {err("formula") && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      {err("formula")}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="meta" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta *
                  </label>
                  <input
                    id="meta"
                    type="text"
                    name="meta"
                    value={formData.meta}
                    onChange={handleChange}
                    placeholder="Ej: 95"
                    className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      err("meta") ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {err("meta") && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      {err("meta")}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="tipo_meta" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Meta *
                  </label>
                  <select
                    id="tipo_meta"
                    name="tipo_meta"
                    value={formData.tipo_meta}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      err("tipo_meta") ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="mayor">Mayor es mejor</option>
                    <option value="menor">Menor es mejor</option>
                  </select>
                  {err("tipo_meta") && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      {err("tipo_meta")}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="frecuencia" className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Medición *
                  </label>
                  <select
                    id="frecuencia"
                    name="frecuencia"
                    value={formData.frecuencia}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      err("frecuencia") ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  >
                    <option value="">Selecciona frecuencia...</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Bimestral">Bimestral</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Cuatrimestral">Cuatrimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                  {err("frecuencia") && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      {err("frecuencia")}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Descripción detallada del indicador..."
                    className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
                      err("descripcion") ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {err("descripcion") && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      {err("descripcion")}
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ Botones de acción mejorados */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex-1 sm:flex-none"
                >
                  {editId ? (
                    <>
                      <PencilIcon className="w-4 h-4" />
                      <span>Actualizar</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4" />
                      <span>Crear Indicador</span>
                    </>
                  )}
                </button>
                
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium flex-1 sm:flex-none"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ✅ Lista de indicadores responsiva */}
          <div className="xl:col-span-3 bg-white rounded-lg shadow-md border border-gray-200 order-1 xl:order-2">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Indicadores Registrados
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="hidden sm:inline">
                      Lista de todos los indicadores configurados
                    </span>
                    <span className="sm:hidden">
                      {indicadores.length} indicadores
                    </span>
                  </p>
                </div>
                
                {/* ✅ Badge con total */}
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {paginacion.total} total
                </div>
              </div>
            </div>

            <div className="p-2 sm:p-4">
              <ObtenerIndicadores
                indicadores={indicadores}
                setIndicadores={setIndicadores}
                onSelect={handleEdit}
                puedeEditar={true}
                fetchIndicadores={fetchIndicadores}
                paginacion={paginacion}
                pagina={paginacion.current_page}
                setPagina={(p) => fetchIndicadores("", p)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}