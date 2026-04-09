import { useState } from "react";
import { useGetHistorialGestionFactura } from "../../hooks/crm/useGetHistorialGestionFactura";
import { useDebounce } from "../../hooks/useDebounce";

export default function GetHistorialGestionFacturaCartera() {
  const [filters, setFilters] = useState({
    numero_factura: "",
    cliente: "",
    page: 1,
    per_page: 10
  });

  const debouncedFilters = useDebounce(filters, 500);
  const { data, isLoading } = useGetHistorialGestionFactura(debouncedFilters);

  return (
    <div className=" mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* 🔍 SECCIÓN DE FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Historial de Gestión de Cartera</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Número de factura..."
              value={filters.numero_factura}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, numero_factura: e.target.value, page: 1 }))
              }
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Nombre del cliente..."
              value={filters.cliente}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, cliente: e.target.value, page: 1 }))
              }
            />
            <span className="absolute left-3 top-2.5 text-gray-400">👤</span>
          </div>
        </div>
      </div>

      {/* ⏳ ESTADO DE CARGA */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Cargando historial...</p>
        </div>
      )}

      {/* 📊 CONTENEDOR DE DATOS */}
      {!isLoading && data?.data?.length > 0 && (
        <>
          {/* VISTA PARA ESCRITORIO (TABLA) */}
          <div className="hidden lg:block overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700 text-sm">Factura</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm">Cliente</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm">Tipo / Observación</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm text-center">Fechas</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm text-center">Gestión</th>
                  <th className="p-4 font-semibold text-gray-700 text-sm">Soportes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-blue-700">{item.gestion_cartera?.numero_factura}</span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {item.gestion_cartera?.cliente?.nombre || "N/A"}
                    </td>
                    <td className="p-4 max-w-xs">
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold uppercase">{item.tipo}</span>
                      <p className="mt-1 text-xs text-gray-500 truncate">{item.observacion}</p>
                    </td>
                    <td className="p-4 text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between"><span>Vencimiento:</span> <span className="font-medium">{item.gestion_cartera?.fecha_vencimiento ? new Date(item.gestion_cartera.fecha_vencimiento).toLocaleDateString() : "N/A"}</span></div>
                      <div className="flex justify-between text-blue-600"><span>Compromiso:</span> <span className="font-medium">{item.fecha_compromiso ? new Date(item.fecha_compromiso).toLocaleDateString() : "N/A"}</span></div>
                    </td>
                    <td className="p-4 text-center text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {item.soportes?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {item.soportes.map((s) => (
                         <a
  key={s.id}
  href={`${import.meta.env.VITE_API_URL}/storage/${s.archivo}`}
  target="_blank"
  rel="noreferrer"
  className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
>
  📄 Ver archivo
</a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin soportes</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA PARA MÓVIL (CARDS) */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {data.data.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Factura</p>
                    <p className="text-lg font-bold text-blue-700">{item.gestion_cartera?.numero_factura}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold uppercase">
                    {item.tipo}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-700"><strong>Cliente:</strong> {item.gestion_cartera?.cliente?.nombre || "N/A"}</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded italic">"{item.observacion}"</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3 border-gray-100">
                  <div>
                    <p className="text-gray-400 uppercase">Compromiso</p>
                    <p className="font-semibold text-gray-700">{item.fecha_compromiso ? new Date(item.fecha_compromiso).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 uppercase">Soportes</p>
                    <div className="mt-1">
                      {item.soportes?.length > 0 ? (
                        <a href={`http://127.0.0.1:8000/storage/${item.soportes[0].archivo}`} className="text-blue-600 font-bold">Ver {item.soportes.length} archivo(s)</a>
                      ) : "Ninguno"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ❌ ESTADO VACÍO */}
      {!isLoading && data?.data?.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">No se encontraron gestiones con los filtros aplicados</p>
        </div>
      )}

      {/* 📄 PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
        <p className="text-sm text-gray-500 order-2 sm:order-1">
          Página <span className="font-bold text-gray-800">{data?.current_page || 0}</span> de <span className="font-bold text-gray-800">{data?.last_page || 0}</span>
        </p>
        
        <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
          <button
            disabled={!data?.prev_page_url}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            ⬅ Anterior
          </button>
          <button
            disabled={!data?.next_page_url}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Siguiente ➡
          </button>
        </div>
      </div>
    </div>
  );
}