import { useState } from "react";
import NexusLoader from "../../components/NexusLoader";
import { useGetFormasPago } from "../../hooks/contabilidad/useGetFormasPago";
import CreatFormasPago from "../../components/contabilidad/CreatFormasPago";
import { useRegisterFormaspago } from "../../hooks/contabilidad/useRegisterFormaspago";
import { PlusIcon } from "lucide-react";

export default function ObtenerFormasPago() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formaSeleccionada, setFormaSeleccionada] = useState(null);
  const { handleDelete } = useRegisterFormaspago();
  const { formasPago, isLoading, error } = useGetFormasPago();

  const openModal = (forma = null) => {
    setFormaSeleccionada(forma);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormaSeleccionada(null);
  };

  if (isLoading) return <NexusLoader text="Cargando Formas de pago..." />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Formas de Pago</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95 text-sm font-medium"
          ><span><PlusIcon /></span> Nueva Forma de Pago
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 text-sm">
            Error: {error.message}
          </div>
        )}

        {/* TABLA ESTILIZADA */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formasPago && formasPago.length > 0 ? (
                formasPago.map((forma) => (
                  <tr key={forma.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{forma.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{forma.nombre}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openModal(forma)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(forma.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">
                    No se encontraron formas de pago.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CON BACKDROP */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo oscuro con desenfoque */}
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Contenedor del Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-1">
               {/* El componente CreatFormasPago ahora recibe onClose para cerrarse al guardar */}
              <CreatFormasPago
                forma={formaSeleccionada}
                onClose={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}