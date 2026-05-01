import { toast } from "react-toastify";
import { valoresIndicadoresApi, indicadoresApi } from "../../services/api"
import { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import ValoresIndicadores from "../../components/calidad/ValoresIndicadores";
import { 
  Target, 
  Hash, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Paperclip, 
  Save, 
  Loader2, 
  AlertCircle,
  FileBarChart
} from "lucide-react";

export default function RegisterValorIndicador() {
  // === LÓGICA INTACTA ===
  const [mes, setMes] = useState(new Date().getMonth() + 1); // Mes actual (1-12)
  const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual
  const [guardando, setGuardando] = useState(false);

  const [valores, setValores] = useState([]);
  const [formData, setFormData] = useState({
    indicador_id: "",
    valor: "",
    fecha: "",
    observaciones: "",
    documento: null
  });
  const [errors, setErrors] = useState({});
  const [indicadores, setIndicadores] = useState([]);

  useEffect(() => {
    const fetchIndicadores = async () => {
      try {
        const res = await indicadoresApi.getAll();
        setIndicadores(res.data.data || []);
      } catch (error) {
        console.error("Error fetching indicadores:", error);
      }
    };
    fetchIndicadores();
  }, []);
  
  // Usa useCallback para evitar recrear la función en cada render
  const fetchValores = useCallback(async () => {
    try {
      const res = await valoresIndicadoresApi.getAll({ mes, anio });
      setValores(res.data.data || []);
    } catch (error) {
      setValores([]);
      console.error("Error fetching valores:", error);
    }
  }, [mes, anio]);

  useEffect(() => {
    fetchValores();
  }, [fetchValores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(s => ({ ...s, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(s => ({ ...s, documento: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const formDataToSubmit = new FormData();
    for (const key in formData) {
      if (key === "documento" && !formData.documento) continue; // No agregues si es null
      formDataToSubmit.append(key, formData[key]);
    }
    try {
      const response = await valoresIndicadoresApi.create(formDataToSubmit);
      fetchValores();
      // Agrega el nuevo valor al inicio del array
      setValores(prev => [response.data.data, ...prev]);
      toast.success(response?.data?.message ?? "Valor registrado", {
        className: "bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium rounded-lg shadow-sm",
        progressClassName: "bg-emerald-500"
      });
      setFormData({
        indicador_id: "",
        valor: "",
        fecha: "",
        observaciones: "",
        documento: null
      });
      setErrors({});
    } catch (error) {
      console.log("Error registrando valor:", error);
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        toast.error("Error registrando valor", {
          className: "bg-red-50 text-red-800 border border-red-200 font-medium rounded-lg shadow-sm",
          progressClassName: "bg-red-500"
        });
      }
    } finally {
      setGuardando(false);
    }
  };
  // === FIN LÓGICA INTACTA ===

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-12">
      
      {/* HEADER HERO */}
      <div className="bg-white border-b border-slate-200 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex-shrink-0 bg-emerald-100 p-4 rounded-2xl">
              <FileBarChart className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                Registro de Valores de Indicadores
              </h1>
              <p className="text-slate-500 mt-2 max-w-2xl text-sm md:text-base">
                Completa el siguiente formulario para ingresar los resultados mensuales de tus indicadores de calidad y adjuntar su respectivo análisis.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* COLUMNA FORMULARIO (2/5) */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
              
              <div className="mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800">Nuevo Registro</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Indicador */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Indicador
                  </label>
                  <Select
                    options={indicadores.map(ind => ({ value: ind.id, label: ind.nombre }))}
                    value={
                      indicadores.find(ind => ind.id === formData.indicador_id)
                        ? {
                            value: formData.indicador_id,
                            label: indicadores.find(ind => ind.id === formData.indicador_id).nombre,
                          }
                        : null
                    }
                    onChange={selected =>
                      setFormData(s => ({ ...s, indicador_id: selected ? selected.value : "" }))
                    }
                    placeholder="Selecciona un indicador..."
                    className="text-sm"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        padding: '2px',
                        borderColor: errors.indicador_id ? '#ef4444' : state.isFocused ? '#10b981' : '#e2e8f0',
                        boxShadow: state.isFocused ? `0 0 0 1px ${errors.indicador_id ? '#ef4444' : '#10b981'}` : 'none',
                        '&:hover': { borderColor: errors.indicador_id ? '#ef4444' : '#cbd5e1' },
                        backgroundColor: errors.indicador_id ? '#fef2f2' : '#f8fafc'
                      }),
                      menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', zIndex: 50 })
                    }}
                  />
                  {errors.indicador_id && (
                    <p className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.indicador_id}
                    </p>
                  )}
                </div>

                {/* Valor */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-400" /> Valor / Resultado
                  </label>
                  <input
                    placeholder="Ejemplo: 75.5"
                    type="number"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    step="any"
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.valor 
                        ? "border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder-red-300" 
                        : "bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 hover:border-slate-300"
                    }`}
                  />
                  {errors.valor && (
                    <p className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.valor}
                    </p>
                  )}
                </div>

                {/* Fecha */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" /> Fecha de Medición
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                      errors.fecha 
                        ? "border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500 text-red-900" 
                        : "bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 hover:border-slate-300"
                    }`}
                  />
                  {errors.fecha && (
                    <p className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.fecha}
                    </p>
                  )}
                </div>

                {/* Observaciones */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" /> Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Escribe comentarios, justificaciones o análisis del resultado..."
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                      errors.observaciones 
                        ? "border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder-red-300" 
                        : "bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 hover:border-slate-300"
                    }`}
                  />
                  {errors.observaciones && (
                    <p className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.observaciones}
                    </p>
                  )}
                </div>

                {/* Documento */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-400" /> Evidencia o Análisis 
                  </label>
                  <input
                    type="file"
                    name="documento"
                    onChange={handleFileChange}
                    className={`block w-full text-sm text-slate-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-emerald-50 file:text-emerald-700
                      hover:file:bg-emerald-100 transition-all
                      border rounded-xl cursor-pointer ${
                      errors.documento ? "border-red-300 bg-red-50" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  />
                  {formData.documento && !errors.documento && (
                    <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      Archivo cargado: {formData.documento.name}
                    </p>
                  )}
                  {errors.documento && (
                    <p className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.documento}
                    </p>
                  )}
                </div>

                {/* Botón */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2"
                  >
                    {guardando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {guardando ? "Guardando Registro..." : "Registrar Valor"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* COLUMNA COMPONENTE DERECHO (3/5) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
              {/* Le pasamos las mismas propiedades exactamente como las tenías */}
              <ValoresIndicadores
                valores={valores}
                setValores={setValores}
                mes={mes}
                setMes={setMes}
                anio={anio}
                setAnio={setAnio}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}