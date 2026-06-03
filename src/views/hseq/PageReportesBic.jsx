/* eslint-disable react/prop-types */
import { useState } from "react";
import { useGetReportesBic } from "../../hooks/hseq/useGetReportesBic";
import { useRegisterReportesBic } from "../../hooks/hseq/useRegisterReportesBic";
import { useEmpresas } from "../../hooks/useEmpresas";

const inputClass = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500";

function ReporteFormModal({ open, onClose, editingItem, hook, empresas }) {
    const { formData, handleChange, handleSubmit, handleEdit, error, loading } = hook;

    const onSubmit = async (e) => {
        e.preventDefault();
        if (editingItem) {
            await handleEdit(editingItem.uuid);
        } else {
            await handleSubmit(e);
        }
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h2 className="text-sm font-semibold text-gray-800">
                        {editingItem ? "Editar Reporte BIC" : "Nuevo Reporte BIC"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
                </div>

                <form onSubmit={onSubmit} className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Empresa</label>
                            <select name="empresa_id" value={formData.empresa_id} onChange={handleChange} className={inputClass}>
                                <option value="">Seleccione una empresa</option>
                                {empresas?.map((e) => (
                                    <option key={e.id} value={e.id}>{e.nombre}</option>
                                ))}
                            </select>
                            {error.empresa_id && <p className="text-xs text-red-500 mt-0.5">{error.empresa_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del Reporte</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre del reporte" className={inputClass} />
                            {error.nombre && <p className="text-xs text-red-500 mt-0.5">{error.nombre}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha del Reporte</label>
                            <input type="date" name="fecha_reporte" value={formData.fecha_reporte} onChange={handleChange} className={inputClass} />
                            {error.fecha_reporte && <p className="text-xs text-red-500 mt-0.5">{error.fecha_reporte}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Archivo {editingItem && <span className="text-gray-400">(dejar vacío para mantener el actual)</span>}
                            </label>
                            <input type="file" name="archivo" onChange={handleChange} className={inputClass} />
                            {error.archivo && <p className="text-xs text-red-500 mt-0.5">{error.archivo}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? "Guardando..." : editingItem ? "Actualizar" : "Registrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function PageReportesBic() {
    const hook = useRegisterReportesBic();
    const { handleDelete, setFormData, resetForm } = hook;
    const { empresas } = useEmpresas();
    const { reportesBic, isLoading: loadingReportes } = useGetReportesBic();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const openCreate = () => {
        resetForm();
        setEditingItem(null);
        setModalOpen(true);
    };

    const openEdit = (reporte) => {
        setFormData({
            empresa_id: reporte.empresa_id,
            nombre: reporte.nombre,
            fecha_reporte: reporte.fecha_reporte?.slice(0, 10),
            archivo: null,
        });
        setEditingItem(reporte);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
        resetForm();
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800">Reportes BIC</h1>
                <button onClick={openCreate} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                    + Nuevo Reporte
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <tr>
                            <th className="px-4 py-2 text-left">Nombre</th>
                            <th className="px-4 py-2 text-left">Empresa</th>
                            <th className="px-4 py-2 text-left">Fecha</th>
                            <th className="px-4 py-2 text-left">Archivo</th>
                            <th className="px-4 py-2 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loadingReportes && (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Cargando...</td></tr>
                        )}
                        {!loadingReportes && reportesBic?.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Sin reportes registrados</td></tr>
                        )}
                        {reportesBic?.map((reporte) => (
                            <tr key={reporte.uuid} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-800">{reporte.nombre}</td>
                                <td className="px-4 py-2 text-gray-600">{reporte.empresa?.nombre ?? '—'}</td>
                                <td className="px-4 py-2 text-gray-600">{reporte.fecha_reporte?.slice(0, 10)}</td>
                                <td className="px-4 py-2">
                                    {reporte.archivo_path
                                        ? <a href={`${import.meta.env.VITE_API_URL}/storage/${reporte.archivo_path}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs">Ver archivo</a>
                                        : <span className="text-gray-400 text-xs">Sin archivo</span>
                                    }
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => openEdit(reporte)} className="px-2 py-1 text-xs text-indigo-600 border border-indigo-300 rounded hover:bg-indigo-50">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(reporte.uuid)} className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50">
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ReporteFormModal
                open={modalOpen}
                onClose={closeModal}
                editingItem={editingItem}
                hook={hook}
                empresas={empresas}
            />
        </div>
    );
}
