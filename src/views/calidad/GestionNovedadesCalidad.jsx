import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useNovedades } from "../../hooks/calidad/useNovedades";
import { useAuth } from "../../hooks/useAuth";
import { useRegisterHallazgoNovedad } from "../../hooks/calidad/useRegisterHallazgoNovedad";
// 🔥 PASO 1: IMPORTA EL COMPONENTE



import {
  FileText,
  AlertCircle,
  Save,
  PlusCircle,
  Calendar,
  User,
  Activity,
  Paperclip,
  MessageSquare
} from "lucide-react";
import { SeguimientoHallazgo } from "./SeguimientoHallazgo";
import { SoportesHallazgo } from "./SoportesHallazgo";

export default function GestionNovedadesCalidad() {
  const { id } = useParams();
  const { usuarios, obtenerUsuariosAll } = useAuth({ middleware: "auth" });
  

  const {
    loading,
    error,
    obtenerNovedadById,
    actualizarNovedad,
    novedadSeleccionada,
  } = useNovedades();

  const {
    formData: formHallazgo,
    handleChange: handleChangeHallazgo,
    handleSubmit: handleSubmitHallazgo,
    handleUpdate: handleUpdateHallazgo,
    error: errorHallazgo,
    loading: loadingHallazgo
  } = useRegisterHallazgoNovedad();

  const [hallazgosEdit, setHallazgosEdit] = useState([]);

  const [form, setForm] = useState({
    descripcion: "",
    estado: "ABIERTA",
    fecha_revision: "",
    fecha_terminado: "",
    responsable_id: null,
    soporte: null,
    fuentes: "",
    causa: "",
    tipo_accion: "",
  });

  useEffect(() => {
    obtenerUsuariosAll();
    if (id) obtenerNovedadById(id);
  }, [id]);

  useEffect(() => {
    if (novedadSeleccionada) {
      setForm({
        descripcion: novedadSeleccionada.descripcion || "",
        estado: novedadSeleccionada.estado || "ABIERTA",
        fecha_revision: novedadSeleccionada.fecha_revision || "",
        fecha_terminado: novedadSeleccionada.fecha_terminado || "",
        responsable_id: novedadSeleccionada.responsable_id || null,
        soporte: null,
        fuentes: novedadSeleccionada.fuentes || "",
        causa: novedadSeleccionada.causa || "",
        tipo_accion: novedadSeleccionada.tipo_accion || ""
      });

      if (novedadSeleccionada.hallazgos) {
        setHallazgosEdit(novedadSeleccionada.hallazgos);
      }
    }
  }, [novedadSeleccionada]);

  const handleChangeNovedad = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmitNovedad = async (e) => {
    e.preventDefault();
    await actualizarNovedad(id, form);
  };

  const handleChangeHallazgoEdit = (id, campo, valor) => {
    setHallazgosEdit(prev =>
      prev.map(h => (h.id === id ? { ...h, [campo]: valor } : h))
    );
  };

  const handleGuardarHallazgoExistente = async (hallazgo) => {
    const response = await handleUpdateHallazgo(hallazgo.id, hallazgo);
    if (response) await obtenerNovedadById(id);
  };

  const handleSubmitNuevoHallazgo = async (e) => {
    e.preventDefault();
    await handleSubmitHallazgo({ ...formHallazgo, novedad_id: id });
    await obtenerNovedadById(id);
  };

  const optionsUsuarios = usuarios.map(u => ({
    value: u.id,
    label: u.name
  }));

  const responsableSeleccionado = optionsUsuarios.find(
    u => u.value === form.responsable_id
  );

  const opcionesFuentes = [
    { value: "Auditoría Interna", label: "Auditoría Interna" },
    { value: "Auditoría Externa", label: "Auditoría Externa" },
    { value: "Cliente", label: "Cliente" },
    { value: "Proveedor", label: "Proveedor" },
    { value: "Inspección Interna", label: "Inspección Interna" },
    { value: "Control de Proceso", label: "Control de Proceso" },
    { value: "Queja", label: "Queja" },
    { value: "Revisión Gerencial", label: "Revisión Gerencial" },
    { value: "Indicadores", label: "Indicadores / KPIs" },
    { value: "Acción Correctiva", label: "Acción Correctiva" },
    { value: "Acción Preventiva", label: "Acción Preventiva" },
    { value: "Hallazgo SST", label: "Seguridad y Salud en el Trabajo (SST)" },
    { value: "Ambiental", label: "Gestión Ambiental" },
    { value: "Otro", label: "Otro" }
  ];

  // Tailwind Class Helpers
  const inputClass = "w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white";
  const labelClass = "text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider";

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AlertCircle size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Gestión de Novedad <span className="text-blue-600">#{id}</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium">Panel de control de calidad y seguimiento de hallazgos.</p>
            </div>
          </div>
        </header>

        {loading && <div className="text-center py-4 text-blue-600 font-semibold animate-pulse">Cargando datos...</div>}
        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">{error}</div>}

        {/* --- SECCIÓN 1: INFORMACIÓN GENERAL --- */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <FileText size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold text-slate-800">Información General</h2>
          </div>

          <form onSubmit={handleSubmitNovedad} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className={labelClass}>Descripción de la Novedad</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChangeNovedad}
                  className={`${inputClass} min-h-[120px] resize-y`}
                  placeholder="Describa el evento..."
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Causa de la Novedad</label>
                <textarea
                  name="causa"
                  value={form.causa}
                  onChange={handleChangeNovedad}
                  className={`${inputClass} min-h-[120px] resize-y`}
                  placeholder="Detalle la causa raíz..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}><User size={14} /> Responsable General</label>
                <Select
                  options={optionsUsuarios}
                  value={responsableSeleccionado}
                  onChange={(selected) => setForm(prev => ({ ...prev, responsable_id: selected?.value }))}
                  className="text-sm"
                  placeholder="Seleccionar..."
                  styles={{ control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid #d1d5db' }) }}
                />
              </div>

              <div>
                <label className={labelClass}><Activity size={14} /> Estado Actual</label>
                <select name="estado" value={form.estado} onChange={handleChangeNovedad} className={inputClass}>
                  <option value="ABIERTA">ABIERTA</option>
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="CERRADA">CERRADA</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Tipo de Acción</label>
                <select name="tipo_accion" value={form.tipo_accion} onChange={handleChangeNovedad} className={inputClass}>
                  <option value="">Seleccionar...</option>
                  <option value="Preventiva">Preventiva</option>
                  <option value="Correctiva">Correctiva</option>
                  <option value="Mejora">Mejora</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Fuente de la Novedad</label>
                <Select
                  options={opcionesFuentes}
                  value={opcionesFuentes.find(f => f.value === form.fuentes)}
                  onChange={(selected) => setForm(prev => ({ ...prev, fuentes: selected?.value }))}
                  className="text-sm"
                  placeholder="Fuente..."
                  styles={{ control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid #d1d5db' }) }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <label className={labelClass}><Calendar size={14} /> Fecha Revisión</label>
                <input type="date" name="fecha_revision" value={form.fecha_revision} onChange={handleChangeNovedad} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><Calendar size={14} /> Fecha Terminado</label>
                <input type="date" name="fecha_terminado" value={form.fecha_terminado} onChange={handleChangeNovedad} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><Paperclip size={14} /> Formato plan de Accion</label>
                <input type="file" name="soporte" onChange={handleChangeNovedad} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 text-sm">
                <Save size={18} /> Guardar Cambios
              </button>
            </div>
          </form>
        </section>

        {/* --- SECCIÓN 2: LISTADO DE HALLAZGOS --- */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Hallazgos Vinculados</h2>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{hallazgosEdit.length} Registros</span>
          </div>

          {errorHallazgo?.general && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{errorHallazgo.general[0]}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {hallazgosEdit.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                No se han registrado hallazgos específicos todavía.
              </div>
            )}
            
            {hallazgosEdit.map(h => (
              <div 
                key={h.id} 
                className={`bg-white rounded-xl shadow-sm border-l-8 p-6 transition-all hover:shadow-md ${
                  h.estado === 'CERRADA' ? "border-l-emerald-500" : h.estado === 'EN_PROCESO' ? "border-l-amber-400" : "border-l-red-400"
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-blue-600">
                      <FileText size={16} />
                    </div>
                    <span className="font-bold text-slate-700">Hallazgo </span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full ${
                    h.estado === "CERRADA" ? "bg-emerald-100 text-emerald-700" : h.estado === "EN_PROCESO" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>
                    {h.estado}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className={labelClass}>Causa Identificada</label>
                    <textarea
                      value={h.causa}
                      onChange={(e) => handleChangeHallazgoEdit(h.id, "causa", e.target.value)}
                      className={`${inputClass} min-h-[80px]`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Plan de Acción</label>
                    <textarea
                      value={h.plan_accion}
                      onChange={(e) => handleChangeHallazgoEdit(h.id, "plan_accion", e.target.value)}
                      className={`${inputClass} min-h-[80px]`}
                    />
                  </div>
                  {/* OBSERVACIONES AGREGADAS AQUÍ */}
                  <div>
                    <label className={labelClass}><MessageSquare size={14}/> Observaciones</label>
                    <textarea
                      value={h.observaciones || ""}
                      onChange={(e) => handleChangeHallazgoEdit(h.id, "observaciones", e.target.value)}
                      className={`${inputClass} min-h-[80px] bg-slate-50`}
                      placeholder="Sin observaciones..."
                    />
                  </div>
                </div>
<SeguimientoHallazgo hallazgoId={h.id} />
<SoportesHallazgo hallazgoId={h.id} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg">
                  <div>
                    <label className={labelClass}>Responsable</label>
                    <Select
                      options={optionsUsuarios}
                      value={optionsUsuarios.find(u => u.value === (h.responsable_id || h.responsable?.id))}
                      onChange={(selected) => handleChangeHallazgoEdit(h.id, "responsable_id", selected.value)}
                      styles={{ control: (base) => ({ ...base, borderRadius: '8px', fontSize: '13px' }) }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Revisión</label>
                    <input type="date" value={h.fecha_revision || ""} onChange={(e) => handleChangeHallazgoEdit(h.id, "fecha_revision", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Cierre</label>
                    <input type="date" value={h.fecha_cierre || ""} onChange={(e) => handleChangeHallazgoEdit(h.id, "fecha_cierre", e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex gap-2">
                    <select value={h.estado} onChange={(e) => handleChangeHallazgoEdit(h.id, "estado", e.target.value)} className={inputClass}>
                      <option value="ABIERTA">ABIERTA</option>
                      <option value="EN_PROCESO">EN PROCESO</option>
                      <option value="CERRADA">CERRADA</option>
                    </select>
                    <button
                      onClick={() => handleGuardarHallazgoExistente(h)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-100 flex-shrink-0"
                      title="Guardar este hallazgo"
                    >
                      <Save size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- SECCIÓN 3: REGISTRO NUEVO HALLAZGO --- */}
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PlusCircle size={22} className="text-blue-700" />
            <h3 className="text-lg font-bold text-blue-900">Registrar Nuevo Hallazgo</h3>
          </div>

          <form onSubmit={handleSubmitNuevoHallazgo} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Causa Raíz</label>
                <textarea name="causa" placeholder="¿Por qué ocurrió?" onChange={handleChangeHallazgo} className={`${inputClass} min-h-[100px]`} />
                {errorHallazgo?.causa && <span className="text-red-600 text-xs font-bold mt-1 inline-block">{errorHallazgo.causa[0]}</span>}
              </div>
              <div>
                <label className={labelClass}>Plan de Acción</label>
                <textarea name="plan_accion" placeholder="Pasos a seguir..." onChange={handleChangeHallazgo} className={`${inputClass} min-h-[100px]`} />
                {errorHallazgo?.plan_accion && <span className="text-red-600 text-xs font-bold mt-1 inline-block">{errorHallazgo.plan_accion[0]}</span>}
              </div>
              <div>
                <label className={labelClass}>Observaciones</label>
                <textarea name="observaciones" placeholder="Datos adicionales..." onChange={handleChangeHallazgo} className={`${inputClass} min-h-[100px]`} />
                {errorHallazgo?.observaciones && <span className="text-red-600 text-xs font-bold mt-1 inline-block">{errorHallazgo.observaciones[0]}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Responsable Asignado</label>
                <Select
                  options={optionsUsuarios}
                  onChange={(selected) => handleChangeHallazgo({ target: { name: "responsable_id", value: selected.value } })}
                  styles={{ control: (base) => ({ ...base, borderRadius: '8px' }) }}
                />
                {errorHallazgo?.responsable_id && <span className="text-red-600 text-xs font-bold mt-1 inline-block">{errorHallazgo.responsable_id[0]}</span>}
              </div>
              <div>
                <label className={labelClass}>Fecha de Revisión</label>
                <input type="date" name="fecha_revision" onChange={handleChangeHallazgo} className={inputClass} />
                {errorHallazgo?.fecha_revision && <span className="text-red-600 text-xs font-bold mt-1 inline-block">{errorHallazgo.fecha_revision[0]}</span>}
              </div>
              <div>
                <label className={labelClass}>Fecha de Cierre</label>
                <input type="date" name="fecha_cierre" onChange={handleChangeHallazgo} className={inputClass} />
                {errorHallazgo?.fecha_cierre && <span className="text-red-600 text-xs font-bold mt-1 inline-block">{errorHallazgo.fecha_cierre[0]}</span>}
              </div>
            </div>

            <div className="flex justify-end">
      <button
  disabled={loadingHallazgo}
  className={`bg-blue-700 text-white font-black py-3 px-10 rounded-lg shadow-xl shadow-blue-200 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2
    ${loadingHallazgo ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-800 active:scale-95"}
  `}
>
  {loadingHallazgo ? (
    <>
      <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
      Guardando...
    </>
  ) : (
    "Crear Hallazgo"
  )}
</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}