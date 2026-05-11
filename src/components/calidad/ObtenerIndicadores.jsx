
import Select from "react-select";


export default function ObtenerIndicadores({
  onSelect,
  indicadores,
  pagina,
  setPagina,
  paginacion = {},
  puedeEditar,
  handleDelete,
  departamentoId,
  setDepartamentoId,
  departamentos,
  search,
  setSearch,
  handleSearchKeyDown
}) {
  return (
    <div className="p-2 md:p-6">
      {/* Contenedor principal */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        
        {/* Sección de Filtros */}
        {puedeEditar && (
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Filtros de búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Departamento</label>
                <Select
                  options={[
                    { value: "", label: "Todos los departamentos" },
                    ...departamentos.map((dep) => ({ value: dep.id, label: dep.nombre })),
                  ]}
                  value={departamentoId ? { value: departamentoId, label: departamentos.find((d) => d.id === departamentoId)?.nombre || "..." } : { value: "", label: "Todos los departamentos" }}
                  onChange={(selected) => { setDepartamentoId(selected ? selected.value : ""); setPagina(1); }}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Buscar indicador</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value.trimStart())}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Escribe para buscar..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto">
          {indicadores.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No hay indicadores registrados.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                <tr>
                  {["Nombre", "Fórmula", "Meta", "Frecuencia", "Descripción", "Tipo Meta"].map(h => (
                    <th key={h} className="px-6 py-4 font-semibold">{h}</th>
                  ))}
                  {puedeEditar && <th className="px-6 py-4">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {indicadores.map((indicador) => (
                  <tr
                    key={indicador.id}
                    onClick={() => { if (puedeEditar && onSelect) onSelect(indicador); }}
                    className={`${puedeEditar ? "hover:bg-blue-50/50 cursor-pointer transition-colors" : "bg-gray-50 cursor-not-allowed"} group`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{indicador.nombre}</td>
                    <td className="px-6 py-4 font-mono text-blue-600 text-xs">{indicador.formula}</td>
                    <td className="px-6 py-4">{indicador.meta}</td>
                    <td className="px-6 py-4 text-gray-600">{indicador.frecuencia}</td>
                    <td className="px-6 py-4 text-gray-500 italic">{indicador.descripcion || "—"}</td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">{indicador.tipo_meta || "—"}</span>
                    </td>
                    {puedeEditar && (
                      <td className="px-6 py-4">
                        <button
                          className="text-red-600 hover:text-red-800 font-medium text-xs hover:underline"
                          onClick={(e) => { e.stopPropagation(); handleDelete(indicador.id); }}
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {(paginacion?.last_page || 1) > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500">Página {paginacion?.current_page} de {paginacion?.last_page}</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-lg text-sm hover:bg-white disabled:opacity-50" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>Anterior</button>
              <button className="px-4 py-2 border rounded-lg text-sm hover:bg-white disabled:opacity-50" disabled={pagina === (paginacion?.last_page || 1)} onClick={() => setPagina(p => p + 1)}>Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
