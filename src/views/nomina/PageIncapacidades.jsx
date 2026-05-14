import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import RegisterIncapacidad from "../../components/nomina/RegisterIncapacidad";
import { useGetIncapacidades } from "../../hooks/nomina/useGetIncapacidades";
import { incapacidadService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

export default function PageIncapacidades() {
  const queryClient = useQueryClient();
  const { incapacidades, isLoading } = useGetIncapacidades();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [revisando, setRevisando] = useState(null);

  const lista = incapacidades?.data?.data ?? [];

  const openCreate = () => {
    setSelectedUuid(null);
    setModalOpen(true);
  };

  const openEdit = (uuid) => {
    setSelectedUuid(uuid);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUuid(null);
  };

  const handleRevisar = async (uuid) => {
    setRevisando(uuid);
    try {
      const res = await incapacidadService.revisarIncapacidad(uuid);
      showToast("success", res.data.message || "Incapacidad revisada");
      queryClient.invalidateQueries(["incapacidades"]);
    } catch {
      showToast("error", "Error al revisar la incapacidad");
    } finally {
      setRevisando(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Incapacidades</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona las incapacidades médicas del personal.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-sm text-gray-400">
            <svg className="animate-spin h-5 w-5 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Cargando...
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            No hay incapacidades registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soporte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revisado por</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {lista.map((item) => (
                  <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{item.empleado?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{item.tipo_incapacidad}</td>
                    <td className="px-6 py-4 text-gray-600">{item.entidad_medica?.nombre ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{item.inicio?.slice(0, 10) ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{item.fin?.slice(0, 10) ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.estado_actual === "activa"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.estado_actual === "activa" ? "Activa" : "Finalizada"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.soporte_url ? (
                        <a
                          href={item.soporte_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline text-xs"
                        >
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">Sin soporte</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {item.revisor?.name ?? (
                        <span className="text-amber-500">Pendiente</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(item.uuid)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors"
                        >
                          Editar
                        </button>
                        {!item.user_reviso_id && (
                          <button
                            onClick={() => handleRevisar(item.uuid)}
                            disabled={revisando === item.uuid}
                            className="text-emerald-600 hover:text-emerald-800 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {revisando === item.uuid ? "Revisando..." : "Revisar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-8 animate-slide-in">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <RegisterIncapacidad uuid={selectedUuid} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}
