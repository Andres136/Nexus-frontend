import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { departamentosApi } from "../../services/api";
import { useOrdenesCarteraVencida } from "../../hooks/crm/useOrdenesCarteraVencida";
import AccesoDenegado from "../../components/AccesoDenegado";
import NexusLoader from "../../components/NexusLoader";
import { formatCurrency, formatDate } from "../../helpers";
import { AlertTriangle, Lock, Unlock } from "lucide-react";

export default function OrdenesCarteraVencida() {
  const { user } = useAuth({ middleware: "auth" });
  const [departamento, setDepartamento] = useState(null);

  useEffect(() => {
    const fetchDepartamento = async () => {
      try {
        const res = await departamentosApi.getById(user.departamento_id);
        setDepartamento(res.data);
      } catch {
        setDepartamento(null);
      }
    };
    if (user?.departamento_id) fetchDepartamento();
  }, [user?.departamento_id]);

  const isResponsable = departamento?.responsable_id === user?.id || user?.role_id === 1;

  const {
    filtros,
    handleChange,
    cambiarPagina,
    ordenes,
    pagination,
    totalValor,
    isLoading,
    activar,
    desactivar,
  } = useOrdenesCarteraVencida();

  if (!user) return null;

  if (!isResponsable) {
    return (
      <AccesoDenegado mensaje="Solo el responsable del proceso o un administrador puede gestionar órdenes con cartera vencida." />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <NexusLoader text="Cargando órdenes con cartera vencida" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Órdenes de Compra con cartera vencida</h2>
              <p className="text-sm text-gray-500">
                Activa o desactiva órdenes de clientes con facturas vencidas. Mientras una orden esté
                desactivada no se puede generar su Orden de Trabajo.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Cliente</label>
            <input
              type="text"
              name="buscar"
              placeholder="Buscar por cliente..."
              value={filtros.buscar}
              onChange={handleChange}
              className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Estado de la orden</label>
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleChange}
              className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white"
            >
              <option value="">Todas</option>
              <option value="activa">Activas</option>
              <option value="inactiva">Desactivadas</option>
            </select>
          </div>
        </div>

        <div className="px-5 pb-5 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{pagination?.total ?? ordenes.length}</span> órdenes con estos filtros
          </span>
          <span className="text-sm text-gray-500">
            Valor total: <span className="font-bold text-gray-900">{formatCurrency(totalValor)}</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <th className="px-3 py-3 text-left font-semibold">OC</th>
                <th className="px-3 py-3 text-left font-semibold">Cliente</th>
                <th className="px-3 py-3 text-left font-semibold">Asesor</th>
                <th className="px-3 py-3 text-left font-semibold">Estado OC</th>
                <th className="px-3 py-3 text-left font-semibold">Cartera</th>
                <th className="px-3 py-3 text-center font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No hay órdenes de clientes con cartera vencida.
                  </td>
                </tr>
              ) : (
                ordenes.map((oc) => {
                  const desactivada = oc.estado_id === 4;
                  const cartera = oc.cartera_info;

                  return (
                    <tr key={oc.id} className={`hover:bg-gray-50 ${desactivada ? "bg-red-50/50" : ""}`}>
                      <td className="px-3 py-2.5 font-mono text-gray-700">#{oc.id}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-800">{oc.cliente?.nombre ?? "N/A"}</td>
                      <td className="px-3 py-2.5 text-gray-600">{oc.user?.name ?? "N/A"}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            desactivada ? "bg-gray-200 text-gray-600" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {oc.estado?.nombre ?? "N/A"}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(oc.created_at)}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        {cartera?.tiene_vencida && (
                          <div className="text-red-600 font-semibold">
                            🚨 Vencida: {formatCurrency(cartera.total_vencido)}
                          </div>
                        )}
                        {cartera?.tiene_proxima && (
                          <div className="text-amber-600">
                            ⚠️ Próxima: {formatCurrency(cartera.total_proximo)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {desactivada ? (
                          <button
                            onClick={() => activar(oc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-medium transition-all"
                            title="Activar orden"
                          >
                            <Unlock size={14} />
                            Activar
                          </button>
                        ) : (
                          <button
                            onClick={() => desactivar(oc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium transition-all"
                            title="Desactivar orden"
                          >
                            <Lock size={14} />
                            Desactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {ordenes.length > 0 && pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-600">
              Página <span className="font-semibold">{pagination.current_page}</span> de{" "}
              <span className="font-semibold">{pagination.last_page}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => cambiarPagina(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Anterior
              </button>
              <button
                onClick={() => cambiarPagina(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
