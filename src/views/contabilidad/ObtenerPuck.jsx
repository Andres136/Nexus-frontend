import { useState } from "react";
import { PlusIcon, Edit2, Trash2, AlertCircle, Search, Upload, Download } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "../../helpers/utils/showToast";
import { cuentasContablesService } from "../../services/contabilidadService";

import CreatPuck from "../../components/contabilidad/CreatPuck";
import { useGetPuck } from "../../hooks/contabilidad/useGetPuck";
import { useRegisterPuck } from "../../hooks/contabilidad/useRegisterPuck";

export default function ObtenerPuck() {
  const queryClient = useQueryClient();
  const {
    pucks,
    isLoading: loadingPucks,
    error: errorPucks,
  } = useGetPuck();

  const { handleDelete } = useRegisterPuck();

  // Estados
  const [modalOpen, setModalOpen] = useState(false);
  const [puckSeleccionado, setPuckSeleccionado] = useState(null);
  const [importando, setImportando] = useState(false);

  // Funciones
  const openModal = (puck = null) => {
    setPuckSeleccionado(puck);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPuckSeleccionado(null);
  };

  const importarExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      setImportando(true);
      const response = await cuentasContablesService.importCuentasContables(file);
      const { created, updated, errors } = response.data.data;

      queryClient.invalidateQueries({ queryKey: ["pucks"] });
      showToast(
        errors.length ? "warning" : "success",
        errors.length
          ? `Importación: ${created} creadas, ${updated} actualizadas. Fila ${errors[0].fila}: ${errors[0].error}`
          : `Importación terminada: ${created} creadas y ${updated} actualizadas.`
      );
    } catch (error) {
      showToast("error", error.response?.data?.message || "No fue posible importar el PUC.");
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Plan Único de Cuentas (PUC)
          </h1>
          <p className="text-sm text-gray-500">
            Administra los códigos y nombres de las cuentas contables.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Excel: código, nombre, naturaleza, descripción y dinámica.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="/plantilla_puc.csv"
            download
            className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm font-semibold"
          >
            <Download size={18} /> Plantilla
          </a>
          <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 text-sm font-semibold cursor-pointer">
            <Upload size={18} /> {importando ? "Importando..." : "Importar Excel"}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              disabled={importando}
              onChange={importarExcel}
            />
          </label>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm font-semibold"
          >
            <PlusIcon size={18} /> Nuevo Registro
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {errorPucks && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 text-sm font-medium">
            Error al cargar los datos: {errorPucks.message}
          </p>
        </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Número de Cuenta</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nivel</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Naturaleza</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dinámica</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Movimiento</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingPucks ? (
                /* SKELETON LOADING */
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                    {[...Array(6)].map((__, column) => (
                      <td key={column} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    ))}
                    <td className="px-6 py-4 flex justify-center gap-2"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                  </tr>
                ))
              ) : pucks?.length > 0 ? (
                pucks.map((puck) => (
                  <tr key={puck.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">
                      {puck.numero}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {puck.nombre}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase text-violet-700">
                        {puck.nivel || "Sin definir"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        puck.naturaleza === "debito"
                          ? "bg-blue-50 text-blue-700"
                          : puck.naturaleza === "credito"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                      }`}>
                        {puck.naturaleza || "Sin definir"}
                      </span>
                    </td>
                    <td
                      className="px-4 py-4 text-xs text-gray-600 max-w-64 truncate"
                      title={puck.descripcion || ""}
                    >
                      {puck.descripcion || "—"}
                    </td>
                    <td
                      className="px-4 py-4 text-xs text-gray-600 max-w-64 truncate"
                      title={puck.dinamica || ""}
                    >
                      {puck.dinamica || "—"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        puck.permite_movimiento
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {puck.permite_movimiento ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        puck.activo
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {puck.activo ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openModal(puck)}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} /> Editar
                        </button>

                        <button
                          onClick={() => handleDelete(puck.id)}
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-semibold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search size={40} strokeWidth={1} />
                      <p className="text-sm font-medium">No se encontraron registros en el PUC</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop con desenfoque */}
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            {/* El componente interno ya debería tener su propio padding y diseño compacto */}
            <CreatPuck puck={puckSeleccionado} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}
