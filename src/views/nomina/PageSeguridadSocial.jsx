import { useState, useMemo } from "react";
import RegisterSeguridadSocial from "../../components/nomina/RegisterSeguridadSocial";
import { useGetSeguridadSocial } from "../../hooks/nomina/useGetSeguridadSocial";

const TIPO_LABEL = {
  eps: "EPS",
  arl: "ARL",
  afp: "AFP",
  ccf: "CCF",
  cesantias: "Cesantías",
};

const TIPO_BADGE = {
  eps: "bg-blue-100 text-blue-700",
  arl: "bg-orange-100 text-orange-700",
  afp: "bg-purple-100 text-purple-700",
  ccf: "bg-teal-100 text-teal-700",
  cesantias: "bg-sky-100 text-sky-700",
};

const TIPOS = ["eps", "arl", "afp", "ccf", "cesantias"];

export default function PageSeguridadSocial() {
  const { seguridadSociales, isLoading } = useGetSeguridadSocial();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("");

  const listaRaw = seguridadSociales?.data?.data ?? [];
  const lista = useMemo(
    () => (filtroTipo ? listaRaw.filter((i) => i.tipo === filtroTipo) : listaRaw),
    [listaRaw, filtroTipo]
  );

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Seguridad Social</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona las entidades de seguridad social.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600"
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{TIPO_LABEL[t]}</option>
            ))}
          </select>
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
            No hay entidades de seguridad social registradas.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {lista.map((item) => (
                <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.nombre}</td>
                  <td className="px-6 py-4">
                    {item.tipo ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TIPO_BADGE[item.tipo] ?? "bg-gray-100 text-gray-500"}`}>
                        {TIPO_LABEL[item.tipo] ?? item.tipo}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.nit ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{item.direccion ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{item.fecha_inicio?.slice(0, 10) ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{item.fecha_fin?.slice(0, 10) ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.status ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(item.uuid)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <RegisterSeguridadSocial uuid={selectedUuid} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}
