import { useEffect, useState } from "react";
import { useRegisterConsumoServicios } from "../../hooks/hseq/useRegisterConsumoServicios";
import { useSedes } from "../../hooks/useSedes";
import { useGetTipoServicios } from "../../hooks/hseq/useGetTipoServicios";
import { useGetConsumoServicios } from "../../hooks/hseq/useGetConsumoServicios";
import { useGetConsumoServicioById } from "../../hooks/hseq/useGetConsumoServicioById";
import Select from "react-select";

export default function RegistrarConsumoServicios() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectConsumoServicio, setSelectConsumoServicio] = useState(null);
  const [filtros, setFiltros] = useState({
    sede_id: null,
    tipo_servicio_id: null,
    fecha_inicio: null,
    fecha_fin: null,
    page: 1,
    per_page: 10
  });

  const {
    setFormData,
    formData,
    errors,
    isloading,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete
  } = useRegisterConsumoServicios();


  const { sedes = [] } = useSedes();
  const { data: tiposServicios = [] } = useGetTipoServicios();
  const {
    data: consumoServicios,
    meta = {},
    isLoading,
  
  } = useGetConsumoServicios(filtros); // Asegúrate de pasar filtros aquí si tu hook lo soporta

  const { data: consumoServicio } = useGetConsumoServicioById(selectConsumoServicio);

  // Cargar datos para editar y abrir modal
  useEffect(() => {
    if (consumoServicio) {
      setFormData({
        id: consumoServicio.id,
        sede_id: consumoServicio.sede_id,
        tipo_servicio_id: consumoServicio.tipo_servicio_id,
        valor_factura: consumoServicio.valor_factura,
        consumo: consumoServicio.consumo,
        fecha_consumo: consumoServicio.fecha_consumo,
        fecha_pago: consumoServicio.fecha_pago,
        estado: consumoServicio.estado,
      });
      setIsModalOpen(true);
    }
  }, [consumoServicio, setFormData]);

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await handleEdit(formData.id);
    } else {
      await handleSubmit(e);
    }
    if (!errors.submit) closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectConsumoServicio(null);
    setFormData({ id: null, valor_factura: "", consumo: "", fecha_consumo: "", fecha_pago: "", estado: "" });
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: '#e2e8f0',
      padding: '2px',
      boxShadow: 'none',
      '&:hover': { border: '1px solid #6366f1' }
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Consumo de Servicios</h1>
            <p className="text-slate-500 mt-1">Registro de gastos y métricas de servicios públicos por sede</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <span>+</span> Registrar Factura
          </button>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Sede</label>
              <Select
                placeholder="Filtrar sede"
                isClearable
                options={sedes?.map(s => ({ value: s.id, label: s.nombre }))}
                value={sedes?.filter(s => s.id === filtros.sede_id).map(s => ({ value: s.id, label: s.nombre }))[0] || null}
                onChange={(opt) => setFiltros({ ...filtros, sede_id: opt?.value || null, page: 1 })}
                styles={customSelectStyles}
              />
  
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Servicio</label>
              <Select
                placeholder="Filtrar servicio"
                isClearable
                options={tiposServicios?.map(t => ({ value: t.id, label: t.nombre }))}
                value={tiposServicios?.filter(t => t.id === filtros.tipo_servicio_id).map(t => ({ value: t.id, label: t.nombre }))[0] || null}
                onChange={(opt) => setFiltros({ ...filtros, tipo_servicio_id: opt?.value || null, page: 1 })}
                styles={customSelectStyles}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Fecha Inicio</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filtros.fecha_inicio || ""}
                onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value || null, page: 1 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Fecha Fin</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filtros.fecha_fin || ""}
                onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value || null, page: 1 })}
              />
            </div>
          </div>
        </div>

        {/* TABLA DE CONSUMOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Servicio / Sede</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Costo Factura</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Consumo Mensual</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fechas</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Observaciones</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400">Cargando registros...</td></tr>
                ) : consumoServicios?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      <div className="text-slate-900 font-bold">{item.tipo_servicio?.nombre}</div>
                      <div className="text-xs text-slate-500">{item.sede?.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-600 font-bold">$ {Number(item.valor_factura).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 font-semibold">{item.consumo}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Unidades registradas</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600"><span className="font-bold">Consumo:</span> {item.fecha_consumo}</div>
                      <div className="text-xs text-slate-400"><span className="font-bold">Pago:</span> {item.fecha_pago}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        item.estado?.toLowerCase() === 'pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.observaciones || "Sin observaciones"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectConsumoServicio(item.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">✎</button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm text-slate-500 font-medium">Página {meta.current_page} de {meta.last_page}</span>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page === 1}
                onClick={() => setFiltros(p => ({ ...p, page: p.page - 1 }))}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Anterior
              </button>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => setFiltros(p => ({ ...p, page: p.page + 1 }))}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-bold text-slate-800">
                {formData.id ? "Actualizar Consumo" : "Registrar Nuevo Consumo"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-3xl transition-colors">&times;</button>
            </div>

            <form onSubmit={onFormSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Sede Responsable</label>
                <Select
                  options={sedes?.map(s => ({ value: s.id, label: s.nombre }))}
                  value={sedes?.filter(s => s.id === formData.sede_id).map(s => ({ value: s.id, label: s.nombre }))[0] || null}
                  onChange={(opt) => handleChange({ target: { name: 'sede_id', value: opt.value } })}
                  styles={customSelectStyles}
                />
                            {errors.sede_id && <p className="text-red-500 text-xs mt-1">{errors.sede_id[0]}</p>}

              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Tipo de Servicio</label>
                <Select
                  options={tiposServicios?.map(t => ({ value: t.id, label: t.nombre }))}
                  value={tiposServicios?.filter(t => t.id === formData.tipo_servicio_id).map(t => ({ value: t.id, label: t.nombre }))[0] || null}
                  onChange={(opt) => handleChange({ target: { name: 'tipo_servicio_id', value: opt.value } })}
                  styles={customSelectStyles}
                />
                {errors.tipo_servicio_id && <p className="text-red-500 text-xs mt-1">{errors.tipo_servicio_id[0]}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Valor de Factura ($)</label>
                <input
                  type="number"
                  name="valor_factura"
                  value={formData.valor_factura}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.valor_factura && <p className="text-red-500 text-xs mt-1">{errors.valor_factura[0]}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Cantidad Consumida</label>
                <input
                  type="number"
                  name="consumo"
                  value={formData.consumo}
                  onChange={handleChange}
                  placeholder="Ej: 150"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.consumo && <p className="text-red-500 text-xs mt-1">{errors.consumo[0]}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Fecha de Consumo</label>
                <input
                  type="date"
                  name="fecha_consumo"
                  value={formData.fecha_consumo}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.fecha_consumo && <p className="text-red-500 text-xs mt-1">{errors.fecha_consumo[0]}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Fecha de Pago</label>
                <input
                  type="date"
                  name="fecha_pago"
                  value={formData.fecha_pago}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.fecha_pago && <p className="text-red-500 text-xs mt-1">{errors.fecha_pago[0]}</p>}
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Estado de Factura</label>
           <select name="estado" id="estado" value={formData.estado} onChange={handleChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
             <option value="pendiente">Pendiente</option>
             <option value="pagado">Pagado</option>
           </select>
              </div>

              <div className="md:col-span-2 flex gap-4 mt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50">Cancelar</button>
                <button
                  type="submit"
                  disabled={isloading}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg disabled:opacity-50"
                >
                  {isloading ? "Procesando..." : formData.id ? "Actualizar Registro" : "Completar Registro"}
                </button>
              </div>
              {errors.submit && <p className="md:col-span-2 text-red-500 text-xs text-center mt-2 italic">{errors.submit}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}