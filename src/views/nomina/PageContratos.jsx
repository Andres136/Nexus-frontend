import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { useGetContrataciones } from "../../hooks/nomina/useGetContrataciones";
import RegisterContrato from "../../components/nomina/RegisterContrato";
import { contratacionService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

function formatCOP(value) {
  if (!value && value !== 0) return "—";
  return "$ " + Number(value).toLocaleString("es-CO");
}

function nombreCompleto(usuario) {
  if (!usuario) return "—";
  return usuario.nombre_completo || [usuario.name, usuario.apellidos].filter(Boolean).join(" ") || "—";
}

function Pagination({ meta, page, onPage }) {
  Pagination.propTypes = {
    meta: PropTypes.shape({ last_page: PropTypes.number, from: PropTypes.number, to: PropTypes.number, total: PropTypes.number }),
    page: PropTypes.number,
    onPage: PropTypes.func,
  };
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

export default function PageContratos() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [updatingStatusUuid, setUpdatingStatusUuid] = useState(null);

  const params = useMemo(
    () => ({ search: search || undefined, page, per_page: perPage }),
    [search, page, perPage]
  );

  const { contrataciones, isLoading } = useGetContrataciones(params);

  // response.data = { success, data: paginator }
  // paginator = { current_page, data: [...], last_page, total, from, to }
  const lista = contrataciones?.data?.data ?? [];
  const meta = contrataciones?.data ?? null;

  const openCreate = () => { setSelectedUuid(null); setModalOpen(true); };
  const openEdit = (uuid) => { setSelectedUuid(uuid); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedUuid(null); };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handlePerPage = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const toggleStatus = async (item) => {
    setUpdatingStatusUuid(item.uuid);
    try {
      const nextStatus = !item.status;
      await contratacionService.cambiarEstadoContrato(item.uuid, nextStatus);
      showToast("success", nextStatus ? "Contrato activado" : "Contrato inactivado");
      queryClient.invalidateQueries(["contrataciones"]);
      queryClient.invalidateQueries(["contratacion", item.uuid]);
    } catch (error) {
      showToast("error", error.response?.data?.message || "No se pudo cambiar el estado");
    } finally {
      setUpdatingStatusUuid(null);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden box-border p-4 sm:p-6">
      {/* Header */}
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Contrataciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona los contratos laborales de los empleados.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nuevo contrato
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por empleado..."
            className="pl-9 pr-4 h-9 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-500">
          Mostrar
          <select
            value={perPage}
            onChange={handlePerPage}
            className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[3, 5, 10, 20, 50].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Tabla */}
      <div className="w-full max-w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-sm text-gray-400">
            <svg className="animate-spin h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Cargando...
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            No hay contratos registrados.
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[1300px] divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[190px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="w-[135px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo contrato</th>
                <th className="w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="w-[135px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro costo</th>
                <th className="w-[120px] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Salario base</th>
                <th className="w-[105px] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Auxilio</th>
                <th className="w-[105px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                <th className="w-[110px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frecuencia</th>
                <th className="w-[105px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="w-[95px] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {lista.map((item) => (
                <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-gray-800 truncate max-w-[160px]">{nombreCompleto(item.usuario)}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">{item.usuario?.email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 align-top">
                    <p className="text-xs font-medium text-gray-500">{item.tipo_documento ?? "—"}</p>
                    <p className="text-sm text-gray-800">{item.numero_documento ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 align-top">
                    {item.cargo ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 align-top">
                    {item.tipo_contrato?.nombre ?? item.tipoContrato?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 align-top">
                    {item.empresa?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 align-top">
                    {item.usuario?.sede?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800 align-top whitespace-nowrap">
                    {formatCOP(item.base_salario)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 align-top whitespace-nowrap">
                    {formatCOP(item.auxilio_transporte)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 align-top whitespace-nowrap">
                    {item.inicio_contratacion
                      ? new Date(item.inicio_contratacion).toLocaleDateString("es-CO")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 align-top whitespace-nowrap">
                    {item.pago_frecuencia == 15 ? "Quincenal" : item.pago_frecuencia == 30 ? "Mensual" : "—"}
                  </td>
                  <td className="px-4 py-3 text-center align-top">
                    {item.status ? (
                      <button
                        type="button"
                        onClick={() => toggleStatus(item)}
                        disabled={updatingStatusUuid === item.uuid}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-60"
                        title="Clic para inactivar"
                      >
                        <CheckCircle2 className="h-3 w-3" />Activo
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleStatus(item)}
                        disabled={updatingStatusUuid === item.uuid}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60"
                        title="Clic para activar"
                      >
                        <XCircle className="h-3 w-3" />Inactivo
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    <button onClick={() => openEdit(item.uuid)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        <Pagination meta={meta} page={page} onPage={setPage} />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 animate-slide-in overflow-y-auto max-h-[90vh]">
            <button onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <RegisterContrato uuid={selectedUuid} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}
