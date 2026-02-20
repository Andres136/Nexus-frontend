import { useEffect, useState } from "react";
import { useNovedades } from "../../hooks/calidad/useNovedades";
import NexusLoader from "../NexusLoader";
import { useAuth } from "../../hooks/useAuth";
import Select from "react-select";
import { Edit2 } from "lucide-react";
export default function Novedades() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [modalOpenDescripcion, setModalOpenDescripcion] = useState(false);
const [selectedNovedad, setSelectedNovedad] = useState(null);

  const { novedades,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    obtenerNovedadById,
    actualizarNovedad,
    obtenerNovedades } = useNovedades();

  const { usuarios, obtenerUsuariosAll } = useAuth({ middleware: "auth" });
  //console.log("Usuarios disponibles:", usuarios);

  useEffect(() => {

    obtenerUsuariosAll();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Gestión de productos no conformes</h1>
        <p className="mt-1 text-sm text-gray-500">Consulta, filtra y actualiza novedades de calidad.</p>
      </div>


      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar por descripción..."
          value={filters.descripcion || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, descripcion: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:max-w-sm"
        />
        </div>
      </div>

      {loading && <NexusLoader text="Cargando Novedades" />}
      {error && <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {!loading && novedades.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No hay novedades registradas.
        </div>
      )}

      {novedades.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Fecha de revisión</th>
                <th className="px-4 py-3">Fecha de cierre</th>

                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Departamento</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">Soporte</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {novedades.map((novedad) => (
                <tr key={novedad.id} className="border-t border-gray-100 transition hover:bg-gray-50/80">
            <td
  className="max-w-[280px] cursor-pointer px-4 py-3 text-xs font-medium text-gray-700 transition hover:text-blue-600"
  onClick={() => {
    setSelectedNovedad(novedad);
    setModalOpenDescripcion(true);
  }}
>
  <p className="truncate" title={novedad.descripcion}>{novedad.descripcion}</p>
</td>

                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {new Date(novedad.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {new Date(novedad.fecha_revision).toLocaleDateString() || "Sin fecha de revisión"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {new Date(novedad.fecha_terminado).toLocaleDateString() || "Sin fecha de cierre"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${novedad.estado === "ABIERTA"
                          ? "bg-yellow-100 text-yellow-700"
                          : novedad.estado === "CERRADA"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {novedad.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {novedad.registro_diario?.departamento?.nombre}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {novedad.responsable?.name || "Sin responsable"}
                  </td>

                 <td className="px-4 py-3">
                  <a
  href={`${import.meta.env.VITE_API_URL}/storage/${novedad.soporte}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 no-underline transition hover:bg-blue-100"
>
  Ver soporte
</a>
                 </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={async () => {
                        const data = await obtenerNovedadById(novedad.id);
                        setEditData(data);
                        setModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>


                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {modalOpenDescripcion && selectedNovedad && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-7">

      <button
        onClick={() => setModalOpenDescripcion(false)}
        className="absolute right-4 top-4 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        Detalle de Novedad
      </h2>

      <div className="space-y-4 text-sm text-gray-700">

        <div>
          <span className="font-semibold">Descripción:</span>
          <p className="mt-2 rounded-lg bg-gray-50 p-3 whitespace-pre-line">
            {selectedNovedad.descripcion}
          </p>
        </div>

        <div className="grid gap-4 rounded-lg bg-gray-50 p-3 sm:grid-cols-3">
          <div>
            <span className="font-semibold">Estado:</span>
            <p>{selectedNovedad.estado}</p>
          </div>

          <div>
            <span className="font-semibold">Responsable:</span>
            <p>{selectedNovedad.responsable?.name || "Sin asignar"}</p>
          </div>

          <div>
            <span className="font-semibold">Departamento:</span>
            <p>{selectedNovedad.registro_diario?.departamento?.nombre}</p>
          </div>
        </div>

        {selectedNovedad.soporte && (
          <div>
            <span className="font-semibold">Soporte:</span>
            <a
              href={`${import.meta.env.VITE_API_URL}/storage/${selectedNovedad.soporte}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
            >
              Ver archivo
            </a>
          </div>
        )}

      </div>

    </div>
  </div>
)}
          {modalOpen && editData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                <h2 className="mb-4 text-lg font-semibold text-gray-800">Editar Novedad</h2>

                <input
                  type="text"
                  value={editData.descripcion}
                  onChange={(e) =>
                    setEditData({ ...editData, descripcion: e.target.value })
                  }
                  className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <select
                  value={editData.estado}
                  onChange={(e) =>
                    setEditData({ ...editData, estado: e.target.value })
                  }
                  className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="ABIERTA">ABIERTA</option>
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="CERRADA">CERRADA</option>
                </select>
                <input
                  type="date"
                  value={
                    editData.fecha_revision
                      ? new Date(editData.fecha_revision).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditData({ ...editData, fecha_revision: e.target.value })
                  }
                  className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <input
                  type="date"
                  value={
                    editData.fecha_terminado
                      ? new Date(editData.fecha_terminado).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditData({ ...editData, fecha_terminado: e.target.value })
                  }
                  className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  type="file"

                  onChange={(e) => setEditData({ ...editData, soporte: e.target.files[0] })}
                  className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium"
                />


                <Select
                  options={usuarios.map((u) => ({ value: u.id, label: u.name }))}
                  value={
                    editData.responsable_id
                      ? { value: editData.responsable_id, label: usuarios.find(u => u.id === editData.responsable_id)?.name || "Selecciona un responsable" }
                      : null
                  }
                  onChange={(option) =>
                    setEditData((prev) => ({
                      ...prev,
                      responsable_id: option ? option.value : null,
                    }))
                  }
                  placeholder="Selecciona un responsable"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={async () => {
                      await actualizarNovedad(editData.id, editData);
                      setModalOpen(false);
                    }}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 md:px-6">

            <button
              disabled={pagination.current_page === 1}
              onClick={() => obtenerNovedades(pagination.current_page - 1)}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="text-sm font-medium text-gray-600">
              Página {pagination.current_page} de {pagination.last_page}
            </span>

            <button
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => obtenerNovedades(pagination.current_page + 1)}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>

          </div>

        </div>
      )}



    </div>
  );
}
