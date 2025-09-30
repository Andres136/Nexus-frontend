import { useState, useEffect } from "react";
import { auditApi } from "../../services/api";
import { FaFilter } from "react-icons/fa";

export default function OrdenesCompraClient() {
  const [auditoria, setAuditoria] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    estado: "",
    cliente: "",
    sede: "",
    soloVencidas: false,
    soloNoATiempo: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await auditApi.getAuditData(filters);
        setAuditoria(response.data.auditoria || []);
      } catch (error) {
        console.error("Error al cargar datos de auditoría:", error);
      }
    }
    fetchData();
  }, [filters]);

  // Filtrado
const filteredData = auditoria.filter((orden) => {
  return (
    (!filters.estado || orden.estado_final.includes(filters.estado)) &&
    (!filters.cliente ||
      orden.cliente?.toLowerCase().includes(filters.cliente.toLowerCase())) &&
    (!filters.sede ||
      (orden.sede &&
        orden.sede.toLowerCase().includes(filters.sede.toLowerCase()))) &&
    (!filters.soloVencidas || orden.estado_final.includes("Vencida")) &&
    (!filters.soloNoATiempo || orden.no_entregado_a_tiempo === true)
  );
});


  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleFilterChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setCurrentPage(1);
  };

  const totalNoATiempo = filteredData.filter(
    (orden) => orden.no_entregado_a_tiempo === true
  ).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Auditoría de Órdenes de Compra
      </h2>

      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaFilter /> Filtros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Año</label>
            <input
              type="number"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mes</label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("es-ES", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            >
        <option value="">Todos</option>
<option value="Pendiente">Pendiente</option>
<option value="Completada">Completada</option>
<option value="Despachada">Despachada</option>
<option value="Vencida">Vencida</option>

            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <input
              type="text"
              name="cliente"
              value={filters.cliente}
              onChange={handleFilterChange}
              placeholder="Buscar cliente..."
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sede</label>
            <input
              type="text"
              name="sede"
              value={filters.sede}
              onChange={handleFilterChange}
              placeholder="Buscar sede..."
              className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
      
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="mb-4">
          <p className="text-gray-700">
            <span className="font-semibold">Total de órdenes no entregadas a tiempo:</span>{" "}
            {totalNoATiempo}
          </p>
        </div>

        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Cliente</th>
              <th className="border px-2 py-1">Creador</th>
              <th className="border px-2 py-1">Entrega</th>
              <th className="border px-2 py-1">Despacho</th>
              <th className="border px-2 py-1">Estado</th>
         
              <th className="border px-2 py-1">Sede</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  No se encontraron órdenes
                </td>
              </tr>
            ) : (
              paginatedData.map((orden) => {
                const estadoVisual = orden.estado_final;

                return (
                  <tr key={orden.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{orden.id}</td>
                    <td className="border px-2 py-1">{orden.cliente}</td>
                    <td className="border px-2 py-1">{orden.creador}</td>
                    <td className="border px-2 py-1">{orden.fecha_entrega}</td>
                    <td className="border px-2 py-1 text-center">
                      {orden.fecha_despacho}
                    </td>
                    <td
                      className={`border px-2 py-1 font-semibold text-center ${
                        estadoVisual.includes("Vencida")
                          ? "text-red-600"
                          : estadoVisual.includes("fuera de tiempo")
                          ? "text-orange-600"
                          : estadoVisual.includes("Completada") ||
                            estadoVisual.includes("a tiempo")
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {estadoVisual}
                    </td>
                 
                    <td className="border px-2 py-1">{orden.sede ?? "-"}</td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        onClick={() =>
                          setExpanded(expanded === orden.id ? null : orden.id)
                        }
                      >
                        {expanded === orden.id ? "Ocultar" : "Ver detalles"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Fila expandida */}
      {expanded &&
        paginatedData
          .filter((o) => o.id === expanded)
          .map((orden) => (
            <div
              key={`details-${orden.id}`}
              className="border rounded-lg p-4 bg-gray-50 shadow-md mt-4"
            >
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-blue-500">📦</span> Detalles de Productos
                </h4>
                <ul className="list-disc pl-6 space-y-2">
                  {orden.detalles.map((d, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      <span className="font-medium">{d.producto}</span> → Solicitado:{" "}
                      <span className="font-semibold">{d.cantidad_solicitada ?? 0}</span>, Enviado:{" "}
                      <span className="font-semibold">{d.cantidad_enviada}</span>, Faltantes:{" "}
                      <span className="font-semibold text-red-500">{d.faltantes}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {orden.orden_trabajo && (
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-green-500">🛠️</span> Orden de Trabajo
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium">ID:</span> {orden.orden_trabajo.id}
                    </p>
                    <p>
                      <span className="font-medium">Creada:</span>{" "}
                      {orden.orden_trabajo.fecha_creacion}
                    </p>
                    <p>
                      <span className="font-medium">Actualizada:</span>{" "}
                      {orden.orden_trabajo.fecha_actualizacion}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

      {/* Paginación */}
      <div className="flex justify-center items-center mt-4 gap-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
