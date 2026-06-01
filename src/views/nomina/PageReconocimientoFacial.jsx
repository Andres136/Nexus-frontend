import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Search, Plus, Pencil, Trash2, UserCircle2, ScanFace, Camera } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetEmpleadosFotosFaciales } from "../../hooks/nomina/useGetEmpleadosFotosFaciales";
import { fotoFacialService } from "../../services/nominaService";
import RegisterFotoFacial from "../../components/nomina/RegisterFotoFacial";
import { showToast } from "../../helpers/utils/showToast";

const STORAGE_URL = import.meta.env.VITE_API_URL + "/storage/";

const FILTROS = [
  { value: "todos",    label: "Todos" },
  { value: "con_foto", label: "Con foto" },
  { value: "sin_foto", label: "Sin foto" },
];

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
    from: PropTypes.number,
    to: PropTypes.number,
    total: PropTypes.number,
  }),
  page: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
};

function ConfirmDelete({ nombre, onConfirm, onCancel, loading }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">Eliminar foto facial</h2>
        <p className="text-xs text-gray-400 mt-0.5">Esta acción no se puede deshacer.</p>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        ¿Seguro que deseas eliminar la foto de{" "}
        <span className="font-semibold">{nombre}</span>?
      </p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-60 transition-colors">
          {loading ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
}
ConfirmDelete.propTypes = {
  nombre: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

function Modal({ onClose, children, maxW = "max-w-md" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${maxW} mx-4 p-6 animate-slide-in overflow-y-auto max-h-[90vh]`}>
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  maxW: PropTypes.string,
};

export default function PageReconocimientoFacial() {
  const queryClient = useQueryClient();

  const [search, setSearch]           = useState("");
  const [filtro, setFiltro]           = useState("todos");
  const [page, setPage]               = useState(1);
  const [perPage]                     = useState(10);
  const [modalOpen, setModalOpen]     = useState(false);
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [selectedUuid, setSelectedUuid]       = useState(null);
  const [defaultUsersId, setDefaultUsersId]   = useState(null);
  const [selectedNombre, setSelectedNombre]   = useState("");
  const [deleting, setDeleting]       = useState(false);

  const params = useMemo(() => ({
    search: search || undefined,
    foto: filtro,
    page,
    per_page: perPage,
  }), [search, filtro, page, perPage]);

  const { data, isLoading } = useGetEmpleadosFotosFaciales(params);

  const lista = data?.data?.data ?? [];
  const meta = data?.data ?? null;
  const stats = data?.stats ?? { total: 0, con_foto: 0, sin_foto: 0 };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFiltro = (value) => {
    setFiltro(value);
    setPage(1);
  };

  const openCreate = (userId = null) => {
    setSelectedUuid(null);
    setDefaultUsersId(userId);
    setModalOpen(true);
  };
  const openEdit = (uuid) => {
    setSelectedUuid(uuid);
    setDefaultUsersId(null);
    setModalOpen(true);
  };
  const closeModal  = () => { setModalOpen(false); setSelectedUuid(null); setDefaultUsersId(null); };

  const openDelete  = (uuid, nombre) => { setSelectedUuid(uuid); setSelectedNombre(nombre); setDeleteOpen(true); };
  const closeDelete = () => { setDeleteOpen(false); setSelectedUuid(null); setSelectedNombre(""); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fotoFacialService.deleteFoto(selectedUuid);
      showToast("success", "Foto eliminada correctamente");
      queryClient.invalidateQueries(["fotosFaciales"]);
      queryClient.invalidateQueries(["empleadosFotosFaciales"]);
      closeDelete();
    } catch {
      showToast("error", "Error al eliminar la foto");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Reconocimiento Facial</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gestión de fotos faciales para el kiosko de asistencia.
          </p>
        </div>
        <button onClick={() => openCreate()}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" strokeWidth={2} /> Nueva foto
        </button>
      </div>

      {/* Stats */}
      {!isLoading && stats.total > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ScanFace className="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total empleados</p>
              <p className="text-lg font-semibold text-gray-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Camera className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Con foto</p>
              <p className="text-lg font-semibold text-green-700">{stats.con_foto}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <UserCircle2 className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sin foto</p>
              <p className="text-lg font-semibold text-amber-700">{stats.sin_foto}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar empleado..."
            className="pl-9 pr-4 h-9 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {FILTROS.map((f) => (
            <button key={f.value} onClick={() => handleFiltro(f.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filtro === f.value
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:text-gray-800"
              }`}>
              {f.label}
            </button>
          ))}
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
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <ScanFace className="h-10 w-10 text-gray-300" />
            <p className="text-sm">
              {search || filtro !== "todos" ? "Sin resultados para los filtros aplicados." : "No hay empleados registrados."}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Empleado", "Foto", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {lista.map((item) => {
                const photoUrl = item.foto?.photo ? STORAGE_URL + item.foto.photo : null;
                return (
                  <tr key={item.userId} className="hover:bg-gray-50 transition-colors">

                    {/* Empleado */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {photoUrl ? (
                            <img src={photoUrl} alt={item.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle2 className="h-5 w-5 text-indigo-300" />
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{item.nombre}</span>
                      </div>
                    </td>

                    {/* Miniatura */}
                    <td className="px-4 py-3.5">
                      {photoUrl ? (
                        <div className="w-14 h-14 rounded-lg border border-gray-100 overflow-hidden">
                          <img src={photoUrl} alt={item.nombre} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                          <UserCircle2 className="h-7 w-7 text-gray-300" />
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        photoUrl ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${photoUrl ? "bg-green-500" : "bg-amber-400"}`} />
                        {photoUrl ? "Con foto" : "Sin foto"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5">
                      {item.foto ? (
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEdit(item.foto.uuid)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </button>
                          <button onClick={() => openDelete(item.foto.uuid, item.nombre)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" /> Eliminar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => openCreate(item.userId)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                          <Camera className="h-3.5 w-3.5" /> Subir foto
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!isLoading && lista.length > 0 && (
          <Pagination meta={meta} page={page} onPage={setPage} />
        )}
      </div>

      {/* Modal Registro / Edición */}
      {modalOpen && (
        <Modal onClose={closeModal}>
          <RegisterFotoFacial
            uuid={selectedUuid}
            defaultUsersId={defaultUsersId}
            onClose={closeModal}
          />
        </Modal>
      )}

      {/* Modal Confirmar Eliminar */}
      {deleteOpen && (
        <Modal onClose={closeDelete} maxW="max-w-sm">
          <ConfirmDelete
            nombre={selectedNombre}
            onConfirm={handleDelete}
            onCancel={closeDelete}
            loading={deleting}
          />
        </Modal>
      )}
    </div>
  );
}
