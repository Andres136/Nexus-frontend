import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Select from "react-select";
import {
  ClipboardX,
  ChevronRight,
  FileText,
  Save,
  Paperclip,
} from "lucide-react";
import { useGetProductoNoConformeById } from "../../hooks/calidad/useGetProductoNoConforme";
import { useAnalisisProductoNoConforme } from "../../hooks/calidad/useAnalisisProductoNoConforme";
import { useAuth } from "../../hooks/useAuth";
import { productoNoConformeService } from "../../services/calidaService";
import { estadosApi } from "../../services/api";
import NexusLoader from "../../components/NexusLoader";
import AccesoDenegado from "../../components/AccesoDenegado";

export default function GestionProductoNoConforme() {
  const { id } = useParams();
  const { usuarios, obtenerUsuariosAll } = useAuth({ middleware: "auth" });
  const { producto, isLoading, error, refetch } = useGetProductoNoConformeById(id);
  const {
    formData,
    analisis,
    loading: loadingAnalisis,
    error: errorAnalisis,
    handleChange,
    cargarPorProducto,
    guardar,
  } = useAnalisisProductoNoConforme();

  const [estados, setEstados] = useState([]);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    obtenerUsuariosAll();
    estadosApi.getAll().then((res) => setEstados(res.data || [])).catch(() => setEstados([]));
  }, []);

  useEffect(() => {
    if (id) cargarPorProducto(id);
  }, [id]);

  const onSubmitAnalisis = async (e) => {
    e.preventDefault();
    await guardar(id);
  };

  const cambiarEstadoProducto = async (estadoId) => {
    setCambiandoEstado(true);
    try {
      await productoNoConformeService.cambiarEstado(id, estadoId);
      await refetch();
    } finally {
      setCambiandoEstado(false);
    }
  };

  const optionsUsuarios = usuarios.map((u) => ({ value: u.id, label: u.name }));
  const responsableSeleccionado = optionsUsuarios.find((u) => u.value === formData.responsable_cierre_id) || null;

  const inputClass = "w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white";
  const labelClass = "text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider";

  if (isLoading) {
    return <NexusLoader text="Cargando producto no conforme" />;
  }

  if (error?.response?.status === 403) {
    return <AccesoDenegado mensaje="La gestión de productos no conformes es solo para el responsable del departamento o un administrador." />;
  }

  if (!producto) {
    return (
      <div className="p-6 text-center text-gray-500">No se encontró el producto no conforme.</div>
    );
  }

  const origenLabel = producto.origen === "proveedor"
    ? producto.proveedor?.nombre
    : producto.origen === "cliente"
      ? producto.cliente?.nombre
      : "Interno";

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <ClipboardX size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Gestión de No Conforme <span className="text-red-600">#{producto.id}</span>
              </h1>
              <nav className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Link to="/auth/crm/no-conformidades" className="hover:text-blue-600 transition-colors">Productos No Conformes</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-600 font-medium">Gestionar #{producto.id}</span>
              </nav>
            </div>
          </div>
        </header>

        {/* --- INFORMACIÓN GENERAL (solo lectura) --- */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <FileText size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold text-slate-800">Información del reporte</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className={labelClass}>Origen</label>
              <p className="text-sm text-slate-700 font-medium capitalize">{producto.origen}</p>
            </div>
            <div>
              <label className={labelClass}>Cliente / Proveedor</label>
              <p className="text-sm text-slate-700 font-medium">{origenLabel || "—"}</p>
            </div>
            <div>
              <label className={labelClass}>Producto</label>
              <p className="text-sm text-slate-700 font-medium">{producto.producto?.name || "—"}</p>
            </div>
            <div>
              <label className={labelClass}>Tipo de falla</label>
              <p className="text-sm text-slate-700 font-medium">{producto.tipo_falla || "—"}</p>
            </div>
            <div>
              <label className={labelClass}>Cantidad afectada</label>
              <p className="text-sm text-slate-700 font-medium">{producto.cantidad_afectada}</p>
            </div>
            <div>
              <label className={labelClass}>Fecha de reporte</label>
              <p className="text-sm text-slate-700 font-medium">
                {producto.fecha_reporte ? new Date(producto.fecha_reporte).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <label className={labelClass}>Reportado por</label>
              <p className="text-sm text-slate-700 font-medium">{producto.comercial?.name || "—"}</p>
            </div>
            <div>
              <label className={labelClass}>Proceso</label>
              <p className="text-sm text-slate-700 font-medium">{producto.proceso?.nombre || "Sin proceso asignado"}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass}>Descripción inicial</label>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{producto.descripcion_inicial}</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className={labelClass}>Estado actual</label>
              <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                {producto.estado?.nombre || "Sin estado"}
              </span>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Cambiar estado</label>
              <select
                disabled={cambiandoEstado}
                defaultValue=""
                onChange={(e) => e.target.value && cambiarEstadoProducto(e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar nuevo estado...</option>
                {estados.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* --- ANÁLISIS / TRATAMIENTO --- */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <FileText size={20} className="text-red-500" />
            <h2 className="text-lg font-bold text-slate-800">Análisis y tratamiento</h2>
          </div>

          {loadingAnalisis && <div className="text-sm text-blue-600 mb-4">Cargando análisis...</div>}

          {errorAnalisis?.general && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 text-sm">{errorAnalisis.general[0]}</div>
          )}

          <fieldset>
            <form onSubmit={onSubmitAnalisis} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Causa raíz</label>
                  <textarea
                    name="causa_raiz"
                    value={formData.causa_raiz}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    placeholder="¿Por qué ocurrió?"
                  />
                  {errorAnalisis?.causa_raiz && <span className="text-red-600 text-xs font-bold mt-1 inline-block">{errorAnalisis.causa_raiz[0]}</span>}
                </div>
                <div>
                  <label className={labelClass}>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[100px] resize-y`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Acciones correctivas</label>
                  <textarea
                    name="acciones_correctivas"
                    value={formData.acciones_correctivas}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[100px] resize-y`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Acciones preventivas</label>
                  <textarea
                    name="acciones_preventivas"
                    value={formData.acciones_preventivas}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[100px] resize-y`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={labelClass}>Fecha de análisis</label>
                  <input type="date" name="fecha_analisis" value={formData.fecha_analisis || ""} onChange={handleChange} className={inputClass} />
                  {errorAnalisis?.fecha_analisis && <span className="text-red-600 text-xs font-bold mt-1 inline-block">{errorAnalisis.fecha_analisis[0]}</span>}
                </div>
                <div>
                  <label className={labelClass}>Estado del análisis</label>
                  <select name="estado_id" value={formData.estado_id || ""} onChange={handleChange} className={inputClass}>
                    <option value="">Seleccionar...</option>
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fecha de cierre</label>
                  <input type="date" name="fecha_cierre" value={formData.fecha_cierre || ""} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Responsable de cierre</label>
                  <Select
                    options={optionsUsuarios}
                    value={responsableSeleccionado}
                    onChange={(selected) => handleChange({ target: { name: "responsable_cierre_id", value: selected?.value || "" } })}
                    placeholder="Seleccionar..."
                    styles={{ control: (base) => ({ ...base, borderRadius: "8px", border: "1px solid #d1d5db" }) }}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}><Paperclip size={14} /> Evidencia</label>
                {analisis?.archivo_evidencia && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}/storage/${analisis.archivo_evidencia}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 no-underline transition hover:bg-blue-100 mb-2"
                  >
                    Ver evidencia actual
                  </a>
                )}
                <input
                  type="file"
                  name="archivo_evidencia"
                  onChange={handleChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loadingAnalisis}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-60"
                >
                  <Save size={18} /> {analisis?.id ? "Actualizar análisis" : "Guardar análisis"}
                </button>
              </div>
            </form>
          </fieldset>
        </section>
      </div>
    </div>
  );
}
