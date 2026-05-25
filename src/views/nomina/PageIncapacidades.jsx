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
  const [revisionItem, setRevisionItem] = useState(null);
  const [observacionRevision, setObservacionRevision] = useState("");

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

  const openRevision = (item) => {
    setRevisionItem(item);
    setObservacionRevision(item.observacion_revision ?? "");
  };

  const closeRevision = () => {
    setRevisionItem(null);
    setObservacionRevision("");
    setRevisando(null);
  };

  const handleRevisar = async (estadoRevision) => {
    if (!revisionItem?.uuid) return;
    setRevisando(estadoRevision);
    try {
      const res = await incapacidadService.revisarIncapacidad(revisionItem.uuid, {
        estado_revision: estadoRevision,
        observacion_revision: observacionRevision,
      });
      showToast("success", res.data.message || "Incapacidad revisada");
      queryClient.invalidateQueries(["incapacidades"]);
      closeRevision();
    } catch {
      showToast("error", "Error al revisar la incapacidad");
    } finally {
      setRevisando(null);
    }
  };

  const renderSoporte = (item) => {
    if (!item?.soporte_url) {
      return (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
          Esta incapacidad no tiene soporte adjunto.
        </div>
      );
    }

    const soporte = item.soporte_url;
    const esImagen = /\.(png|jpe?g|webp)$/i.test(soporte.split("?")[0]);

    if (esImagen) {
      return (
        <img
          src={soporte}
          alt="Soporte de incapacidad"
          className="max-h-[460px] w-full rounded-lg border border-gray-200 object-contain"
        />
      );
    }

    return (
      <iframe
        title="Soporte de incapacidad"
        src={soporte}
        className="h-[460px] w-full rounded-lg border border-gray-200"
      />
    );
  };

  const estadoRevisionClass = (estado) => {
    if (estado === "aprobada") return "bg-green-100 text-green-700";
    if (estado === "rechazada") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoRevisionClass(item.estado_revision)}`}>
                        {item.estado_revision === "aprobada"
                          ? "Aprobada"
                          : item.estado_revision === "rechazada"
                            ? "Rechazada"
                            : "Pendiente"}
                      </span>
                      {item.revisor?.name && (
                        <p className="mt-1 text-gray-400">{item.revisor.name}</p>
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
                        {item.estado_revision !== "aprobada" && (
                          <button
                            onClick={() => openRevision(item)}
                            className="text-emerald-600 hover:text-emerald-800 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            Revisar
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

      {revisionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeRevision} />
          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <button
              onClick={closeRevision}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-5 pr-8">
              <h2 className="text-lg font-semibold text-gray-800">Revisión de Incapacidad</h2>
              <p className="text-sm text-gray-500 mt-1">
                Valida el soporte médico antes de aprobarlo para liquidación de nómina.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div>
                {renderSoporte(revisionItem)}
                {revisionItem.soporte_url && (
                  <a
                    href={revisionItem.soporte_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Abrir soporte en otra pestaña
                  </a>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Empleado</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{revisionItem.empleado?.name ?? "—"}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</p>
                  <p className="mt-1 text-sm text-gray-700">{revisionItem.tipo_incapacidad}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wider text-gray-500">Entidad</p>
                  <p className="mt-1 text-sm text-gray-700">{revisionItem.entidad_medica?.nombre ?? "—"}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wider text-gray-500">Período</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {revisionItem.inicio?.slice(0, 10) ?? "—"} / {revisionItem.fin?.slice(0, 10) ?? "—"}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Observación de revisión
                  </label>
                  <textarea
                    value={observacionRevision}
                    onChange={(e) => setObservacionRevision(e.target.value)}
                    rows={5}
                    placeholder="Registra anomalías, inconsistencias o comentarios de aprobación."
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRevisar("aprobada")}
                    disabled={Boolean(revisando)}
                    className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {revisando === "aprobada" ? "Aprobando..." : "Aprobar incapacidad"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRevisar("rechazada")}
                    disabled={Boolean(revisando)}
                    className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    {revisando === "rechazada" ? "Rechazando..." : "Rechazar por anomalía"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
