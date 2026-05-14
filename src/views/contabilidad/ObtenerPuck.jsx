import { useState } from "react";
import { PlusIcon, Edit2, Trash2, AlertCircle, Search } from "lucide-react";

import CreatPuck from "../../components/contabilidad/CreatPuck";
import { useGetPuck } from "../../hooks/contabilidad/useGetPuck";
import { useRegisterPuck } from "../../hooks/contabilidad/useRegisterPuck";

export default function ObtenerPuck() {
  const {
    pucks,
    isLoading: loadingPucks,
    error: errorPucks,
  } = useGetPuck();

  const { handleDelete } = useRegisterPuck();

  // Estados
  const [modalOpen, setModalOpen] = useState(false);
  const [puckSeleccionado, setPuckSeleccionado] = useState(null);

  // Funciones
  const openModal = (puck = null) => {
    setPuckSeleccionado(puck);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPuckSeleccionado(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Plan Único de Cuentas (PUC)
          </h1>
          <p className="text-sm text-gray-500">
            Administra los códigos y nombres de las cuentas contables.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm font-semibold"
        >
          <PlusIcon size={18} /> Nuevo Registro
        </button>
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
                  <td colSpan="3" className="px-6 py-12 text-center">
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* El componente interno ya debería tener su propio padding y diseño compacto */}
            <CreatPuck puck={puckSeleccionado} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}