import { useState } from "react";
import { useRegisterGeneracionResiduos } from "../../hooks/hseq/useRegisterGeneracionResiuduos";
import { useSedes } from "../../hooks/useSedes";
import { useGetTipoResiduos } from "../../hooks/hseq/useGetTipoResiduos";
import { useGetGeneracionResiduos } from "../../hooks/hseq/useGetGeneracionResiduos";
import Select from "react-select";
import { DeleteIcon, PencilIcon } from "lucide-react";

export default function RegistrarGeneracionResiduos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtro, setFiltro] = useState({
    tipo_residuo_id: "",
    sede_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    page: 1,
    per_page: 10,
  });

  const {
    setFormData,
    formData,
    handleChange,
    handleSubmit,
    error,
    loading,
    handleUpdate,
    handleDelete,
  } = useRegisterGeneracionResiduos();

  const { sedes = [] } = useSedes();
  const { data: tipoResiduos = [] } = useGetTipoResiduos();
  const { data: generacionResiduos = [], meta = {} } = useGetGeneracionResiduos(filtro);

  // Carga datos y abre modal
  const handleEdit = (residuo) => {
    setFormData({
      id: residuo.id,
      tipo_residuo_id: residuo.tipo_residuo_id,
      sede_id: residuo.sede_id,
      cantidad: residuo.cantidad,
      fecha: residuo.fecha,
      unidad_medida: residuo.unidad_medida,
      observaciones: residuo.observaciones,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      tipo_residuo_id: "",
      sede_id: "",
      cantidad: "",
      fecha: "",
      unidad_medida: "",
      observaciones: "",
    });
  };

  const onFormSubmit = async (e) => {
    if (formData.id) {
      await handleUpdate(e, formData.id);
    } else {
      await handleSubmit(e);
    }
    // Solo cerramos si no hay errores (opcional, dependiendo de tu lógica de errores)
    setIsModalOpen(false);
  };

  // Estilos Tailwind para los Selects
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Registro de Generación</h1>
            <p className="text-gray-500 mt-1">Monitoreo y control de residuos por sede</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <span>+</span> Nuevo Registro
          </button>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tipo de Residuo</label>
              <Select
                placeholder="Todos"
                isClearable
                options={tipoResiduos?.map(t => ({ value: t.id, label: t.nombre }))}
                onChange={(opt) => setFiltro({ ...filtro, tipo_residuo_id: opt?.value || "", page: 1 })}
                styles={customSelectStyles}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Sede</label>
              <Select
                placeholder="Todas"
                isClearable
                options={sedes?.map(s => ({ value: s.id, label: s.nombre }))}
                onChange={(opt) => setFiltro({ ...filtro, sede_id: opt?.value || "", page: 1 })}
                styles={customSelectStyles}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Desde</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={(e) => setFiltro({ ...filtro, fecha_inicio: e.target.value, page: 1 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Hasta</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={(e) => setFiltro({ ...filtro, fecha_fin: e.target.value, page: 1 })}
              />
            </div>
          </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Detalle Residuo</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Cantidad</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Fecha</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Observaciones</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {generacionResiduos?.map((residuo) => (
                  <tr key={residuo.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{residuo.tipo_residuo?.nombre}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        {residuo.sede?.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">
                        {residuo.cantidad} <small className="text-[10px] uppercase">{residuo.unidad_medida}</small>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{residuo.fecha}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{residuo.observaciones || "Sin observaciones"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(residuo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(residuo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 font-medium">
              Mostrando página <span className="text-gray-900">{meta.current_page}</span> de {meta.last_page}
            </p>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page === 1}
                onClick={() => setFiltro(p => ({ ...p, page: p.page - 1 }))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
              >
                ← Anterior
              </button>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => setFiltro(p => ({ ...p, page: p.page + 1 }))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-gray-800">
                {formData.id ? "Editar Registro" : "Nuevo Registro de Residuo"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
            </div>

            <form onSubmit={onFormSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1 space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Tipo de Residuo</label>
                  <Select
                    options={tipoResiduos?.map(t => ({ value: t.id, label: t.nombre }))}
                    value={tipoResiduos?.filter(t => t.id === formData.tipo_residuo_id).map(t => ({ value: t.id, label: t.nombre }))}
                    onChange={(opt) => handleChange({ target: { name: 'tipo_residuo_id', value: opt.value } })}
                    styles={customSelectStyles}
                  />
                  {error?.tipo_residuo_id && <p className="text-red-500 text-xs mt-1 italic">{error.tipo_residuo_id[0]}</p>}
                </div>

                <div className="md:col-span-1 space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Sede</label>
                  <Select
                    options={sedes?.map(s => ({ value: s.id, label: s.nombre }))}
                    value={sedes?.filter(s => s.id === formData.sede_id).map(s => ({ value: s.id, label: s.nombre }))}
                    onChange={(opt) => handleChange({ target: { name: 'sede_id', value: opt.value } })}
                    styles={customSelectStyles}
                  />
                  {error?.sede_id && <p className="text-red-500 text-xs mt-1 italic">{error.sede_id[0]}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Cantidad</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {error?.cantidad && <p className="text-red-500 text-xs mt-1 italic">{error.cantidad[0]}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Unidad de Medida</label>
                  <input
                    type="text"
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleChange}
                    placeholder="Kg, Lb, Tn..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {error?.unidad_medida && <p className="text-red-500 text-xs mt-1 italic">{error.unidad_medida[0]}</p>}
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {error?.fecha && <p className="text-red-500 text-xs mt-1 italic">{error.fecha[0]}</p>}
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Detalles adicionales sobre la generación..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {error?.observaciones && <p className="text-red-500 text-xs mt-1 italic">{error.observaciones[0]}</p>}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  {loading ? "Procesando..." : formData.id ? "Guardar Cambios" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}