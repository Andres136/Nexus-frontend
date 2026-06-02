import PropTypes from "prop-types";
import { Copy, Link2, Monitor, Pencil, Plus, Power, ShieldOff, Search } from "lucide-react";
import RegisterKiosko from "../../components/nomina/RegisterKiosko";
import BtnAccesoTemporalKiosko from "../../components/nomina/BtnAccesoTemporalKiosko";
import { usePageKioscos } from "../../hooks/nomina/usePageKioscos";

const statusLabel = {
  pending:  "Pendiente",
  active:   "Activo",
  inactive: "Inactivo",
  revoked:  "Revocado",
};

const statusClass = {
  pending:  "bg-amber-50 text-amber-700",
  active:   "bg-green-50 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  revoked:  "bg-red-50 text-red-700",
};

function Pagination({ meta, page, onPage }) {
  if (!meta || meta.last_page <= 1) return null;
  const total = meta.last_page;
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
    if (page < total - 2) pages.push("...");
    pages.push(total);
  }
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Mostrando {meta.from ?? 0} a {meta.to ?? 0} de {meta.total} registros
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs">‹</button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">…</span>
          ) : (
            <button key={p} onClick={() => onPage(p)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                p === page ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>{p}</button>
          )
        )}
        <button onClick={() => onPage(page + 1)} disabled={page === total}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs">›</button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  meta: PropTypes.shape({
    last_page: PropTypes.number,
    from:      PropTypes.number,
    to:        PropTypes.number,
    total:     PropTypes.number,
  }),
  page:   PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
};

export default function PageKioscos() {
  const {
    search,
    page,
    setPage,
    modalOpen,
    selectedUuid,
    loadingAction,
    lista,
    meta,
    isLoading,
    openCreate,
    openEdit,
    closeModal,
    handleSearch,
    copyActivationLink,
    toggleActive,
    revokeKiosco,
  } = usePageKioscos();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Kioscos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Dispositivos de registro de asistencia por reconocimiento facial.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={handleSearch}
              placeholder="Buscar kiosko..."
              className="pl-9 pr-4 h-9 w-52 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" strokeWidth={2} /> Nuevo kiosko
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-sm text-gray-400">
            <svg className="animate-spin h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Cargando...
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">No hay kioscos registrados.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Dispositivo","Código","Estado","IP","Sede","Bodega","Tipo registro","Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {lista.map((item) => (
                <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Monitor className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.descripcion && (
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">{item.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {item.code}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[item.status] ?? statusClass.pending}`}>
                      {statusLabel[item.status] ?? "Pendiente"}
                    </span>
                    {item.last_seen_at && (
                      <p className="mt-1 text-[10px] text-gray-400">
                        Última actividad: {new Date(item.last_seen_at).toLocaleString("es-CO")}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{item.ip_adres}</td>
                  <td className="px-4 py-3.5 text-gray-600">{item.sede?.nombre ?? item.sede?.name ?? "—"}</td>
                  <td className="px-4 py-3.5 text-gray-600">{item.bodega?.nombre ?? item.bodega?.name ?? "—"}</td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {item.tipoRegistro?.name ?? item.tipo_registro?.name ?? "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => openEdit(item.uuid)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button onClick={() => copyActivationLink(item)} disabled={loadingAction === `link-${item.uuid}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors">
                        {loadingAction === `link-${item.uuid}` ? <Copy className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                        Link
                      </button>
                      {item.status === "active" && (
                        <BtnAccesoTemporalKiosko uuid={item.uuid} />
                      )}
                      {item.status !== "pending" && item.status !== "revoked" && (
                        <button onClick={() => toggleActive(item)} disabled={loadingAction === `status-${item.uuid}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors">
                          <Power className="h-3.5 w-3.5" />
                          {item.status === "active" ? "Desactivar" : "Activar"}
                        </button>
                      )}
                      {item.status !== "revoked" && (
                        <button onClick={() => revokeKiosco(item)} disabled={loadingAction === `revoke-${item.uuid}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors">
                          <ShieldOff className="h-3.5 w-3.5" /> Revocar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination meta={meta} page={page} onPage={setPage} />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 animate-slide-in overflow-y-auto max-h-[90vh]">
            <button onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <RegisterKiosko uuid={selectedUuid} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}
