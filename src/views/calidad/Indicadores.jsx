import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { indicadoresApi } from "../../services/api";
import { toast } from "react-toastify";
import ObtenerIndicadores from "../../components/calidad/ObtenerIndicadores";
import { Link } from "react-router-dom";
// ✅ Iconos modernos
import { 
  BarChart3,
  Plus,
  Edit3,
  X,
  FileBarChart,
  Target,
  TrendingUp,
  Calendar,
  FileText,
  Settings
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* ✅ HEADER MODERNO */}
        <div className="bg-white border-b border-gray-200 shadow-sm rounded-2xl mb-8">
          <div className="p-6 sm:p-8">
            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    Gestión de Indicadores
                  </h1>
                  <p className="text-gray-600 text-lg max-w-2xl">
                    Crea, edita y gestiona indicadores para el seguimiento y mejora continua de calidad
                  </p>
                </div>
              </div>
              
              {/* CTA Button */}
              <Link
                to="/auth/crm/registrar-valor-indicador"
                className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-medium group"
              >
                <FileBarChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Registrar Valores</span>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Indicadores</p>
                    <p className="text-2xl font-bold">{paginacion.total}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">En Edición</p>
                    <p className="text-2xl font-bold">{editId ? "1" : "0"}</p>
                  </div>
                  <Edit3 className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Página Actual</p>
                    <p className="text-2xl font-bold">{paginacion.current_page}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ GRID PRINCIPAL MEJORADO */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          
          {/* ✅ FORMULARIO MODERNO */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header del formulario */}
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  {editId ? (
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Edit3 className="w-5 h-5 text-blue-600" />
                    </div>
                  ) : (
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Plus className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editId ? "Editar Indicador" : "Nuevo Indicador"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {editId ? "Modificar indicador existente" : "Crear un nuevo indicador de calidad"}
                    </p>
                  </div>
                </div>
                {editId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Modo edición activo
                    </p>
                  </div>
                )}
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label htmlFor="nombre" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Nombre del Indicador *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Productividad mensual del departamento"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm ${
                      err("nombre") ? "border-red-500 bg-red-50 focus:ring-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {err("nombre") && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {err("nombre")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Fórmula */}
                <div className="space-y-2">
                  <label htmlFor="formula" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                    Fórmula de Cálculo *
                  </label>
                  <input
                    id="formula"
                    type="text"
                    name="formula"
                    value={formData.formula}
                    onChange={handleChange}
                    placeholder="Ej: (Producido / Programado) * 100"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm ${
                      err("formula") ? "border-red-500 bg-red-50 focus:ring-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {err("formula") && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {err("formula")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Grid para Meta y Tipo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="meta" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Target className="w-4 h-4 text-purple-600" />
                      Meta *
                    </label>
                    <input
                      id="meta"
                      type="text"
                      name="meta"
                      value={formData.meta}
                      onChange={handleChange}
                      placeholder="Ej: 95"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm ${
                        err("meta") ? "border-red-500 bg-red-50 focus:ring-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {err("meta") && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                        <p className="text-red-700 text-xs font-medium">{err("meta")}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tipo_meta" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Tipo de Meta *
                    </label>
                    <select
                      id="tipo_meta"
                      name="tipo_meta"
                      value={formData.tipo_meta}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm ${
                        err("tipo_meta") ? "border-red-500 bg-red-50 focus:ring-red-500" : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <option value="">Seleccionar tipo...</option>
                      <option value="mayor">📈 Mayor es mejor</option>
                      <option value="menor">📉 Menor es mejor</option>
                    </select>
                    {err("tipo_meta") && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                        <p className="text-red-700 text-xs font-medium">{err("tipo_meta")}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Frecuencia */}
                <div className="space-y-2">
                  <label htmlFor="frecuencia" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Frecuencia de Medición *
                  </label>
                  <select
                    id="frecuencia"
                    name="frecuencia"
                    value={formData.frecuencia}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm ${
                      err("frecuencia") ? "border-red-500 bg-red-50 focus:ring-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <option value="">Selecciona frecuencia...</option>
                    <option value="Mensual">📅 Mensual</option>
                    <option value="Bimestral">📅 Bimestral</option>
                    <option value="Trimestral">📅 Trimestral</option>
                    <option value="Cuatrimestral">📅 Cuatrimestral</option>
                    <option value="Semestral">📅 Semestral</option>
                    <option value="Anual">📅 Anual</option>
                  </select>
                  {err("frecuencia") && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {err("frecuencia")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label htmlFor="descripcion" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4 text-gray-600" />
                    Descripción Detallada
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe el propósito, metodología y contexto del indicador..."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all shadow-sm resize-none ${
                      err("descripcion") ? "border-red-500 bg-red-50 focus:ring-red-500" : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {err("descripcion") && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {err("descripcion")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl group flex-1"
                  >
                    {editId ? (
                      <>
                        <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Actualizar Indicador</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Crear Indicador</span>
                      </>
                    )}
                  </button>
                  
                  {editId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center justify-center gap-3 bg-gray-500 text-white px-6 py-4 rounded-xl hover:bg-gray-600 transition-all font-medium shadow-lg hover:shadow-xl group"
                    >
                      <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Cancelar</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* ✅ LISTA DE INDICADORES MODERNA */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header de la lista */}
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Indicadores Registrados
                      </h2>
                      <p className="text-sm text-gray-600">
                        Gestiona todos los indicadores configurados en el sistema
                      </p>
                    </div>
                  </div>
                  
                  {/* Badge con información */}
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-bold">
                      {paginacion.total} Total
                    </div>
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
                      Página {paginacion.current_page}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido de la lista */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-6">
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
    </div>
  );
}